/*
 * Time-zone arithmetic on top of `Intl`. Wall-clock times are handled as "local ms": the
 * wall-clock fields encoded as if they were UTC, so calendar math uses the UTC getters and never
 * meets a DST transition. Converting local ms back to an instant is where gaps and overlaps
 * show up, and `resolveLocal` reports them instead of guessing silently.
 */

export const SECOND = 1000;
export const MINUTE = 60 * SECOND;
export const HOUR = 60 * MINUTE;
export const DAY = 24 * HOUR;

/** Wall-clock fields; `month` is 1–12. */
export type WallTime = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
  millisecond: number;
};

/** Floor modulo: `mod(-1, 1000)` is 999. */
export const mod = (value: number, by: number) => ((value % by) + by) % by;

/** Local ms for wall-clock fields; years 0–99 stay as written (unlike `Date.UTC`). */
export function localMs(wall: WallTime): number {
  const date = new Date(0);
  date.setUTCFullYear(wall.year, wall.month - 1, wall.day);
  date.setUTCHours(wall.hour, wall.minute, wall.second, wall.millisecond);
  return date.getTime();
}

export function wallOf(local: number): WallTime {
  const date = new Date(local);
  return {
    year: date.getUTCFullYear(),
    month: date.getUTCMonth() + 1,
    day: date.getUTCDate(),
    hour: date.getUTCHours(),
    minute: date.getUTCMinutes(),
    second: date.getUTCSeconds(),
    millisecond: date.getUTCMilliseconds(),
  };
}

export const daysInMonth = (year: number, month: number) =>
  new Date(
    localMs({ year, month: month + 1, day: 0, hour: 0, minute: 0, second: 0, millisecond: 0 })
  ).getUTCDate();

/** 0 = Sunday … 6 = Saturday. */
export const weekdayOf = (year: number, month: number, day: number) =>
  new Date(
    localMs({ year, month, day, hour: 0, minute: 0, second: 0, millisecond: 0 })
  ).getUTCDay();

const formatters = new Map<string, Intl.DateTimeFormat>();

function partsFormatter(timeZone: string): Intl.DateTimeFormat {
  let formatter = formatters.get(timeZone);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat('en-US', {
      timeZone,
      hourCycle: 'h23',
      era: 'short',
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
    });
    formatters.set(timeZone, formatter);
  }
  return formatter;
}

export function isTimeZone(timeZone: string): boolean {
  try {
    partsFormatter(timeZone);
    return true;
  } catch {
    return false;
  }
}

/** The viewer's own time zone (only meaningful in the browser). */
export const systemTimeZone = () => Intl.DateTimeFormat().resolvedOptions().timeZone;

/** IANA zones the engine knows, with UTC first. */
export function timeZones(): string[] {
  const zones =
    typeof Intl.supportedValuesOf === 'function' ? Intl.supportedValuesOf('timeZone') : [];
  return ['UTC', ...zones.filter((zone) => zone !== 'UTC')];
}

/** Wall-clock time of an instant in a zone. */
export function wallTime(ms: number, timeZone: string): WallTime {
  const fields: Record<string, string> = {};
  for (const part of partsFormatter(timeZone).formatToParts(new Date(ms))) {
    fields[part.type] = part.value;
  }
  const year = Number(fields.year);
  return {
    year: fields.era === 'BC' || fields.era === 'B' ? 1 - year : year,
    month: Number(fields.month),
    day: Number(fields.day),
    hour: Number(fields.hour),
    minute: Number(fields.minute),
    second: Number(fields.second),
    millisecond: mod(ms, SECOND),
  };
}

/** UTC offset of a zone at an instant, in ms (east of Greenwich is positive). */
export function zoneOffset(ms: number, timeZone: string): number {
  return localMs(wallTime(ms, timeZone)) - ms;
}

export type Resolution = {
  ms: number;
  /** `gap`: the wall time doesn't exist (clocks jumped forward); `overlap`: it happens twice. */
  kind: 'exact' | 'gap' | 'overlap';
};

/** Every instant showing this wall-clock time: none in a DST gap, two in an overlap. */
export function instantsAt(local: number, timeZone: string): number[] {
  const offsets = new Set([zoneOffset(local - DAY, timeZone), zoneOffset(local + DAY, timeZone)]);
  return [...offsets]
    .map((offset) => local - offset)
    .filter((ms) => ms + zoneOffset(ms, timeZone) === local)
    .sort((a, b) => a - b);
}

/**
 * The instant for a wall-clock time: the earlier one in an overlap, and in a gap the time
 * pushed forward by the gap's length (02:30 on a spring-forward night becomes 03:30), like
 * `Temporal`'s "compatible" disambiguation.
 */
export function resolveLocal(local: number, timeZone: string): Resolution {
  const instants = instantsAt(local, timeZone);
  if (instants.length === 1) return { ms: instants[0], kind: 'exact' };
  if (instants.length > 1) return { ms: instants[0], kind: 'overlap' };
  return { ms: local - zoneOffset(local - DAY, timeZone), kind: 'gap' };
}

/** `+05:30`, `-08:00`, `+00:00`; seconds appear only for historic offsets that have them. */
export function formatOffset(offsetMs: number, separator = ':'): string {
  const sign = offsetMs < 0 ? '-' : '+';
  const total = Math.round(Math.abs(offsetMs) / SECOND);
  const pad = (value: number) => String(value).padStart(2, '0');
  const parts = [pad(Math.floor(total / 3600)), pad(Math.floor(total / 60) % 60)];
  if (total % 60) parts.push(pad(total % 60));
  return sign + parts.join(separator);
}
