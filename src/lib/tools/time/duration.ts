import {
  DAY,
  HOUR,
  MINUTE,
  SECOND,
  daysInMonth,
  localMs,
  resolveLocal,
  wallOf,
  wallTime,
  type Resolution,
} from './zone';

/** A difference split into calendar units; every part is non-negative. */
export type CalendarParts = {
  years: number;
  months: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  milliseconds: number;
};

/** Adds whole months to a local time, clamping the day (Jan 31 + 1 month = Feb 28/29). */
export function addMonths(local: number, count: number): number {
  const wall = wallOf(local);
  const index = wall.year * 12 + (wall.month - 1) + count;
  const year = Math.floor(index / 12);
  const month = index - year * 12 + 1;
  return localMs({ ...wall, year, month, day: Math.min(wall.day, daysInMonth(year, month)) });
}

/**
 * Calendar difference between two wall-clock times (local ms): whole months first (with day
 * clamping), then days and time. Measured on the wall clock, so a day across a DST change is
 * still one day; exact totals come from the instants instead.
 */
export function calendarDifference(
  startLocal: number,
  endLocal: number
): { sign: -1 | 0 | 1; parts: CalendarParts } {
  const sign = endLocal > startLocal ? 1 : endLocal < startLocal ? -1 : 0;
  const [from, to] = sign < 0 ? [endLocal, startLocal] : [startLocal, endLocal];
  const a = wallOf(from);
  const b = wallOf(to);
  let months = (b.year - a.year) * 12 + (b.month - a.month);
  if (addMonths(from, months) > to) months--;
  let rest = to - addMonths(from, months);
  const take = (size: number) => {
    const count = Math.floor(rest / size);
    rest -= count * size;
    return count;
  };
  return {
    sign,
    parts: {
      years: Math.floor(months / 12),
      months: months % 12,
      days: take(DAY),
      hours: take(HOUR),
      minutes: take(MINUTE),
      seconds: take(SECOND),
      milliseconds: rest,
    },
  };
}

/** A duration as entered: calendar parts plus an exact time part in ms. */
export type Duration = {
  sign: 1 | -1;
  years: number;
  months: number;
  weeks: number;
  days: number;
  /** Hours, minutes, seconds and milliseconds together. */
  timeMs: number;
};

export type DurationParse = { ok: true; duration: Duration } | { ok: false; message: string };

const ISO_DURATION =
  /^([+-])?P(?:(\d+)Y)?(?:(\d+)M)?(?:(\d+)W)?(?:(\d+)D)?(?:T(?:(\d+(?:[.,]\d+)?)H)?(?:(\d+(?:[.,]\d+)?)M)?(?:(\d+(?:[.,]\d+)?)S)?)?$/i;

type Unit =
  keyof Omit<Duration, 'sign' | 'timeMs'> | 'hours' | 'minutes' | 'seconds' | 'milliseconds';

const UNIT_WORDS: [RegExp, Unit][] = [
  [/^(?:years?|yrs?|y)$/i, 'years'],
  [/^(?:months?|mos?)$/i, 'months'],
  [/^(?:weeks?|wks?|w)$/i, 'weeks'],
  [/^(?:days?|d)$/i, 'days'],
  [/^(?:hours?|hrs?|h)$/i, 'hours'],
  [/^(?:minutes?|mins?|m)$/i, 'minutes'],
  [/^(?:seconds?|secs?|s)$/i, 'seconds'],
  [/^(?:milliseconds?|msecs?|ms)$/i, 'milliseconds'],
];
const TIME_UNIT_MS: Partial<Record<Unit, number>> = {
  hours: HOUR,
  minutes: MINUTE,
  seconds: SECOND,
  milliseconds: 1,
};

const CALENDAR_FRACTION = 'Years, months, weeks and days must be whole numbers.';

/**
 * Reads ISO 8601 (`P1Y2M3DT4H5M6.5S`, `PT90M`, `-P1W`), units (`1h 30m`, `2 days, 4 hours`,
 * `1.5h`) or a plain number of seconds.
 */
export function parseDuration(text: string): DurationParse {
  const input = text.trim();
  const duration: Duration = { sign: 1, years: 0, months: 0, weeks: 0, days: 0, timeMs: 0 };
  if (input === '') return { ok: false, message: 'Enter a duration.' };

  const iso = ISO_DURATION.exec(input);
  if (iso && /\d/.test(input)) {
    const [, sign, years, months, weeks, days, hours, minutes, seconds] = iso;
    const number = (value?: string) => Number((value ?? '0').replace(',', '.'));
    duration.sign = sign === '-' ? -1 : 1;
    duration.years = number(years);
    duration.months = number(months);
    duration.weeks = number(weeks);
    duration.days = number(days);
    duration.timeMs = Math.round(
      number(hours) * HOUR + number(minutes) * MINUTE + number(seconds) * SECOND
    );
    return { ok: true, duration };
  }

  let rest = input;
  if (/^[+-]/.test(rest)) {
    duration.sign = rest[0] === '-' ? -1 : 1;
    rest = rest.slice(1).trim();
  }
  if (/^\d+(?:\.\d+)?$/.test(rest)) {
    duration.timeMs = Math.round(Number(rest) * SECOND);
    return { ok: true, duration };
  }

  const token = /\s*(\d+(?:\.\d+)?)\s*([a-z]+)\s*(?:,|and\b)?/iy;
  let matched = false;
  while (token.lastIndex < rest.length) {
    const start = token.lastIndex;
    const match = token.exec(rest);
    if (!match) {
      return {
        ok: false,
        message: `Unexpected “${rest.slice(start).trim()}”. Try 1h 30m or PT1H30M.`,
      };
    }
    const unit = UNIT_WORDS.find(([pattern]) => pattern.test(match[2]))?.[1];
    if (!unit) return { ok: false, message: `Unknown unit “${match[2]}”.` };
    const value = Number(match[1]);
    const timeUnit = TIME_UNIT_MS[unit];
    if (timeUnit !== undefined) {
      duration.timeMs += Math.round(value * timeUnit);
    } else {
      if (!Number.isInteger(value)) return { ok: false, message: CALENDAR_FRACTION };
      duration[unit as 'years' | 'months' | 'weeks' | 'days'] += value;
    }
    matched = true;
  }
  return matched ? { ok: true, duration } : { ok: false, message: 'Enter a duration.' };
}

/** Exact length in ms, or null when years or months make it depend on the start date. */
export function durationMs(duration: Duration): number | null {
  if (duration.years || duration.months) return null;
  return duration.sign * ((duration.weeks * 7 + duration.days) * DAY + duration.timeMs);
}

/** Normalized ISO 8601: the time part is split into H/M/S, zero is `PT0S`. */
export function formatIsoDuration(duration: Duration): string {
  const { years, months, weeks, days } = duration;
  let rest = duration.timeMs;
  const hours = Math.floor(rest / HOUR);
  rest -= hours * HOUR;
  const minutes = Math.floor(rest / MINUTE);
  rest -= minutes * MINUTE;
  const seconds = rest / SECOND;
  const date = [
    [years, 'Y'],
    [months, 'M'],
    [weeks, 'W'],
    [days, 'D'],
  ]
    .filter(([value]) => value)
    .map(([value, unit]) => `${value}${unit}`)
    .join('');
  const time = [
    [hours, 'H'],
    [minutes, 'M'],
    [seconds, 'S'],
  ]
    .filter(([value]) => value)
    .map(([value, unit]) => `${value}${unit}`)
    .join('');
  if (!date && !time) return 'PT0S';
  return `${duration.sign < 0 ? '-' : ''}P${date}${time ? `T${time}` : ''}`;
}

/** ISO 8601 for a calendar difference. */
export function partsToDuration(sign: -1 | 0 | 1, parts: CalendarParts): Duration {
  return {
    sign: sign < 0 ? -1 : 1,
    years: parts.years,
    months: parts.months,
    weeks: 0,
    days: parts.days,
    timeMs:
      parts.hours * HOUR + parts.minutes * MINUTE + parts.seconds * SECOND + parts.milliseconds,
  };
}

/**
 * `start ± duration` in a zone: years, months, weeks and days move the wall clock (so "1 day"
 * keeps the time across DST), then hours and smaller add exact time.
 */
export function addDuration(
  startMs: number,
  duration: Duration,
  direction: 1 | -1,
  timeZone: string
): { ms: number; resolution: Resolution['kind'] } {
  const sign = duration.sign * direction;
  const startLocal = localMs(wallTime(startMs, timeZone));
  const moved = addMonths(startLocal, sign * (duration.years * 12 + duration.months));
  const local = moved + sign * (duration.weeks * 7 + duration.days) * DAY;
  // Without calendar parts, nothing moved on the wall clock: keep the exact start instant.
  const resolved =
    local === startLocal ? { ms: startMs, kind: 'exact' as const } : resolveLocal(local, timeZone);
  return { ms: resolved.ms + sign * duration.timeMs, resolution: resolved.kind };
}
