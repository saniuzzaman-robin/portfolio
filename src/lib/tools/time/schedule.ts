import type { CronExpression, DayRule, ParsedField } from './cron';
import {
  SECOND,
  daysInMonth,
  instantsAt,
  localMs,
  wallTime,
  weekdayOf,
  zoneOffset,
  DAY,
} from './zone';

export type CronRun = {
  ms: number;
  /**
   * `shifted`: the wall time fell in a DST gap and runs right after it; `repeated`: the second
   * run in an hour that happens twice.
   */
  dst: 'shifted' | 'repeated' | null;
};

/** Every pattern repeats within a 400-year Gregorian cycle, so searching further is pointless. */
const SEARCH_YEARS = 400;

/** `next[v]` = the smallest allowed value ≥ v, or -1. */
function nextTable(allowed: (value: number) => boolean, min: number, max: number): number[] {
  const table: number[] = [];
  let next = -1;
  for (let value = max; value >= min; value--) {
    if (allowed(value)) next = value;
    table[value] = next;
  }
  return table;
}

const allows = (field: ParsedField | undefined, fallback: (value: number) => boolean) =>
  field ? (value: number) => field.values.includes(value) : fallback;

function daysFor(field: ParsedField, year: number, month: number, length: number): Set<number> {
  const days = new Set<number>();
  if (field.field === 'dayOfMonth') {
    for (const value of field.values) if (value <= length) days.add(value);
  } else {
    for (let day = 1; day <= length; day++) {
      if (field.values.includes(weekdayOf(year, month, day))) days.add(day);
    }
  }
  for (const rule of field.rules) {
    const day = ruleDay(rule, year, month, length);
    if (day !== null) days.add(day);
  }
  return days;
}

function ruleDay(rule: DayRule, year: number, month: number, length: number): number | null {
  const weekday = (day: number) => weekdayOf(year, month, day);
  switch (rule.kind) {
    case 'last':
      return length - rule.offset >= 1 ? length - rule.offset : null;
    case 'lastWeekday': {
      const last = weekday(length);
      return last === 6 ? length - 1 : last === 0 ? length - 2 : length;
    }
    case 'nearestWeekday': {
      // Quartz never crosses into another month: 1W on a Saturday is Monday the 3rd.
      if (rule.day > length) return null;
      const day = weekday(rule.day);
      if (day === 6) return rule.day === 1 ? 3 : rule.day - 1;
      if (day === 0) return rule.day === length ? rule.day - 2 : rule.day + 1;
      return rule.day;
    }
    case 'nth': {
      const first = ((rule.weekday - weekday(1) + 7) % 7) + 1;
      const day = first + (rule.nth - 1) * 7;
      return day <= length ? day : null;
    }
    case 'lastOf': {
      const offset = (weekday(length) - rule.weekday + 7) % 7;
      return length - offset;
    }
  }
}

/** Days of a month the expression runs on, with Vixie's day-of-month/day-of-week rule. */
export function matchingDays(cron: CronExpression, year: number, month: number): Set<number> {
  const length = daysInMonth(year, month);
  const dom = cron.fields.dayOfMonth!;
  const dow = cron.fields.dayOfWeek!;
  if (cron.quartz) return daysFor(dom.unspecified ? dow : dom, year, month, length);
  const byDate = daysFor(dom, year, month, length);
  const byWeekday = daysFor(dow, year, month, length);
  // Both restricted: either may match. Otherwise (one starts with *) both must match.
  if (!dom.wildcard && !dow.wildcard) return new Set([...byDate, ...byWeekday]);
  return new Set([...byDate].filter((day) => byWeekday.has(day)));
}

/**
 * The next `count` runs strictly after `fromMs`, in `timeZone`. DST follows Vixie cron: a
 * "wildcard" job (minute or hour starting with `*`) skips times in a gap and runs again in a
 * repeated hour; a fixed-time job runs once, right after a gap (shifted by its length).
 * `exhausted` means the search ran out of years (e.g. February 30th).
 */
export function nextRuns(
  cron: CronExpression,
  fromMs: number,
  count: number,
  timeZone: string
): { runs: CronRun[]; exhausted: boolean } {
  const { fields } = cron;
  const wildcardJob = Boolean(fields.minute?.wildcard || fields.hour?.wildcard);
  const seconds = nextTable(
    allows(fields.second, (value) => value === 0),
    0,
    59
  );
  const minutes = nextTable(
    allows(fields.minute, () => true),
    0,
    59
  );
  const hours = nextTable(
    allows(fields.hour, () => true),
    0,
    23
  );
  const months = nextTable(
    allows(fields.month, () => true),
    1,
    12
  );
  const years = fields.year?.values;
  const dayCache = new Map<number, Set<number>>();
  const days = (year: number, month: number) => {
    const key = year * 12 + month;
    let set = dayCache.get(key);
    if (!set) {
      set = matchingDays(cron, year, month);
      dayCache.set(key, set);
    }
    return set;
  };

  // Start one second after `fromMs`, on the wall clock of the zone.
  const start = wallTime(fromMs - (((fromMs % SECOND) + SECOND) % SECOND) + SECOND, timeZone);
  let { year, month, day, hour, minute, second } = start;
  const lastYear = Math.min(start.year + SEARCH_YEARS, years ? Math.max(...years) : Infinity);

  const runs: CronRun[] = [];
  // Second runs of a repeated hour come later in real time than the first runs after them.
  const repeats: CronRun[] = [];
  const push = (run: CronRun) => {
    while (repeats.length && repeats[0].ms < run.ms) add(repeats.shift()!);
    add(run);
  };
  const add = (run: CronRun) => {
    const last = runs[runs.length - 1];
    if (run.ms > fromMs && (!last || run.ms > last.ms)) runs.push(run);
  };
  const nextDay = () => {
    day++;
    hour = minute = second = 0;
  };

  while (runs.length < count) {
    if (year > lastYear) break;
    if (years && !years.includes(year)) {
      year++;
      month = day = 1;
      hour = minute = second = 0;
      continue;
    }
    if (months[month] !== month) {
      const next = months[month];
      if (next < 0) {
        year++;
        month = 1;
      } else {
        month = next;
      }
      day = 1;
      hour = minute = second = 0;
      continue;
    }
    if (day > daysInMonth(year, month)) {
      month++;
      if (month > 12) {
        month = 1;
        year++;
      }
      day = 1;
      continue;
    }
    if (!days(year, month).has(day)) {
      nextDay();
      continue;
    }
    if (hours[hour] !== hour) {
      if (hours[hour] < 0) nextDay();
      else [hour, minute, second] = [hours[hour], 0, 0];
      continue;
    }
    if (minutes[minute] !== minute) {
      if (minutes[minute] < 0) [hour, minute, second] = [hour + 1, 0, 0];
      else [minute, second] = [minutes[minute], 0];
      if (hour > 23) nextDay();
      continue;
    }
    if (seconds[second] !== second) {
      if (seconds[second] < 0) [minute, second] = [minute + 1, 0];
      else second = seconds[second];
      if (minute > 59) [hour, minute] = [hour + 1, 0];
      if (hour > 23) nextDay();
      continue;
    }

    const local = localMs({ year, month, day, hour, minute, second, millisecond: 0 });
    const instants = instantsAt(local, timeZone);
    if (instants.length === 0) {
      if (!wildcardJob) push({ ms: local - zoneOffset(local - DAY, timeZone), dst: 'shifted' });
    } else {
      push({ ms: instants[0], dst: null });
      if (instants.length > 1 && wildcardJob) repeats.push({ ms: instants[1], dst: 'repeated' });
    }

    second++;
    if (second > 59) [minute, second] = [minute + 1, 0];
    if (minute > 59) [hour, minute] = [hour + 1, 0];
    if (hour > 23) nextDay();
  }

  while (repeats.length) add(repeats.shift()!);
  return { runs: runs.slice(0, count), exhausted: runs.length < count };
}
