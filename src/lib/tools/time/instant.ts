import {
  DAY,
  SECOND,
  daysInMonth,
  formatOffset,
  localMs,
  mod,
  resolveLocal,
  wallOf,
  type Resolution,
  type WallTime,
} from './zone';

export const EPOCH_UNITS = ['s', 'ms', 'us', 'ns'] as const;
export type EpochUnit = (typeof EPOCH_UNITS)[number];

/** Nanoseconds per unit (as strings: no BigInt literals below ES2020). */
const UNIT_NS: Record<EpochUnit, bigint> = {
  s: BigInt('1000000000'),
  ms: BigInt('1000000'),
  us: BigInt('1000'),
  ns: BigInt('1'),
};
const NS_PER_MS = UNIT_NS.ms;
/** `Date` covers ±100,000,000 days around 1970. */
const MAX_MS = 8.64e15;

/**
 * A point in time with nanosecond precision: `ms` since the epoch (floored) plus `nanos`
 * (0–999,999) within that millisecond. `digits` is how many fractional-second digits are
 * meaningful (0, 3, 6 or 9), so a seconds timestamp prints without `.000`.
 */
export type Instant = { ms: number; nanos: number; digits: 0 | 3 | 6 | 9 };

/**
 * The unit an integer timestamp is most likely in, from its digit count: seconds up to 11
 * digits (until the year 5138), then milliseconds, microseconds and nanoseconds.
 */
export function detectUnit(integerDigits: number): EpochUnit {
  if (integerDigits <= 11) return 's';
  if (integerDigits <= 14) return 'ms';
  if (integerDigits <= 17) return 'us';
  return 'ns';
}

const DIGITS_FOR_UNIT: Record<EpochUnit, Instant['digits']> = { s: 0, ms: 3, us: 6, ns: 9 };
const roundDigits = (count: number): Instant['digits'] =>
  count === 0 ? 0 : count <= 3 ? 3 : count <= 6 ? 6 : 9;

function fromNanoseconds(total: bigint, digits: Instant['digits']): Instant | null {
  // Floor division, so instants before 1970 keep a positive `nanos`.
  let ms = total / NS_PER_MS;
  if (total < BigInt(0) && ms * NS_PER_MS !== total) ms -= BigInt(1);
  if (ms > BigInt(MAX_MS) || ms < BigInt(-MAX_MS)) return null;
  return { ms: Number(ms), nanos: Number(total - ms * NS_PER_MS), digits };
}

export type TimeInput =
  | { ok: true; kind: 'epoch'; instant: Instant; unit: EpochUnit }
  | {
      ok: true;
      kind: 'date';
      instant: Instant;
      /** How a date without an offset was placed in the zone (`gap`/`overlap` deserve a note). */
      resolution: Resolution['kind'] | 'offset';
    }
  | { ok: false; message: string };

const EPOCH = /^([+-]?)(\d+)(?:\.(\d+))?$/;
const ISO =
  /^([+-]\d{6}|\d{4})-(\d{2})-(\d{2})(?:[Tt ](\d{2}):(\d{2})(?::(\d{2})(?:[.,](\d+))?)?)?\s*(Z|[+-]\d{2}(?::?\d{2})?)?$/i;
/** A zone `Date.parse` understands in RFC 2822 and similar strings. */
const NAMED_ZONE = /(?:\b(?:GMT|UTC|UT|Z|[ECMP][SD]T)\b|[+-]\d{2}:?\d{2}\b)/;

const OUT_OF_RANGE = 'Outside the range a date can represent (about ±275,000 years).';

/**
 * Reads an epoch timestamp (unit given or detected; negative and fractional allowed) or a date:
 * ISO 8601 (without an offset it is a wall-clock time in `timeZone`) or an RFC 2822-style
 * string with a zone.
 */
export function parseTimeInput(
  text: string,
  options: { unit: EpochUnit | 'auto'; timeZone: string }
): TimeInput {
  const input = text.trim();
  // Digit groups (`1_700_000_000`, `1 700 000 000`) are fine in a timestamp.
  const epoch = EPOCH.exec(input.replace(/[_\s]/g, ''));
  if (epoch) {
    const [, sign, integer, fraction = ''] = epoch;
    const unit =
      options.unit === 'auto' ? detectUnit(integer.replace(/^0+(?=\d)/, '').length) : options.unit;
    const perUnit = UNIT_NS[unit];
    const fractionDigits = perUnit.toString().length - 1;
    const scaled = fraction.slice(0, fractionDigits).padEnd(fractionDigits, '0');
    let total = BigInt(integer) * perUnit + (fractionDigits ? BigInt(scaled) : BigInt(0));
    if (sign === '-') total = -total;
    const digits = unit === 's' ? roundDigits(Math.min(fraction.length, 9)) : DIGITS_FOR_UNIT[unit];
    const instant = fromNanoseconds(total, digits);
    return instant
      ? { ok: true, kind: 'epoch', instant, unit }
      : { ok: false, message: OUT_OF_RANGE };
  }

  const iso = ISO.exec(input);
  if (iso) return parseIso(iso, options.timeZone);

  if (NAMED_ZONE.test(input)) {
    const ms = Date.parse(input);
    if (!Number.isNaN(ms)) {
      return { ok: true, kind: 'date', instant: { ms, nanos: 0, digits: 0 }, resolution: 'offset' };
    }
  }
  return {
    ok: false,
    message:
      'Not an epoch timestamp or a recognized date. Try 1700000000, 2024-03-10T14:30 or Tue, 14 Nov 2023 22:13:20 GMT.',
  };
}

function parseIso(match: RegExpExecArray, timeZone: string): TimeInput {
  const [, yearText, monthText, dayText, hourText, minuteText, secondText, fraction = '', offset] =
    match;
  const wall: WallTime = {
    year: Number(yearText),
    month: Number(monthText),
    day: Number(dayText),
    hour: Number(hourText ?? 0),
    minute: Number(minuteText ?? 0),
    second: Number(secondText ?? 0),
    millisecond: 0,
  };
  if (wall.month < 1 || wall.month > 12)
    return { ok: false, message: `Month ${monthText} is not 01–12.` };
  if (wall.day < 1 || wall.day > daysInMonth(wall.year, wall.month)) {
    return { ok: false, message: `Day ${dayText} doesn't exist in ${yearText}-${monthText}.` };
  }
  if (wall.hour > 23 || wall.minute > 59 || wall.second > 59) {
    return { ok: false, message: 'The time must be between 00:00:00 and 23:59:59.' };
  }
  const fractionNs = Number(fraction.slice(0, 9).padEnd(9, '0'));
  wall.millisecond = Math.floor(fractionNs / 1e6);
  const nanos = fractionNs % 1e6;
  const digits = roundDigits(Math.min(fraction.length, 9));
  const local = localMs(wall);

  let ms: number;
  let resolution: Resolution['kind'] | 'offset';
  if (offset) {
    ms = local - parseOffset(offset);
    resolution = 'offset';
  } else {
    ({ ms, kind: resolution } = resolveLocal(local, timeZone));
  }
  if (Math.abs(ms) > MAX_MS) return { ok: false, message: OUT_OF_RANGE };
  return { ok: true, kind: 'date', instant: { ms, nanos, digits }, resolution };
}

function parseOffset(text: string): number {
  if (/^z$/i.test(text)) return 0;
  const digits = text.slice(1).replace(':', '');
  const minutes = Number(digits.slice(0, 2)) * 60 + Number(digits.slice(2) || 0);
  return (text[0] === '-' ? -1 : 1) * minutes * 60 * SECOND;
}

/** The instant in each epoch unit (floored), as exact decimal strings. */
export function epochValues(instant: Instant): Record<EpochUnit, string> {
  const total = BigInt(instant.ms) * NS_PER_MS + BigInt(instant.nanos);
  const floorDiv = (by: bigint) => {
    const quotient = total / by;
    return total < BigInt(0) && quotient * by !== total ? quotient - BigInt(1) : quotient;
  };
  return {
    s: floorDiv(UNIT_NS.s).toString(),
    ms: floorDiv(UNIT_NS.ms).toString(),
    us: floorDiv(UNIT_NS.us).toString(),
    ns: total.toString(),
  };
}

const pad = (value: number, length = 2) => String(value).padStart(length, '0');

function formatYear(year: number): string {
  if (year >= 0 && year <= 9999) return pad(year, 4);
  return (year < 0 ? '-' : '+') + pad(Math.abs(year), 6);
}

/** ISO 8601 with the instant's precision: `2023-11-14T22:13:20Z`, `…20.123456+05:30`. */
export function formatIso(instant: Instant, offsetMs = 0): string {
  const wall = wallOf(instant.ms + offsetMs);
  const fraction = pad(wall.millisecond, 3) + pad(instant.nanos, 6);
  const date = `${formatYear(wall.year)}-${pad(wall.month)}-${pad(wall.day)}`;
  const time = `${pad(wall.hour)}:${pad(wall.minute)}:${pad(wall.second)}`;
  const seconds = instant.digits ? `.${fraction.slice(0, instant.digits)}` : '';
  return `${date}T${time}${seconds}${offsetMs === 0 ? 'Z' : formatOffset(offsetMs)}`;
}

const RFC_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const RFC_MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

/** RFC 2822 (email, HTTP): `Tue, 14 Nov 2023 22:13:20 +0000`. English names by definition. */
export function formatRfc2822(ms: number, offsetMs = 0): string {
  const local = ms + offsetMs;
  const wall = wallOf(local);
  const weekday = RFC_DAYS[new Date(local).getUTCDay()];
  return `${weekday}, ${pad(wall.day)} ${RFC_MONTHS[wall.month - 1]} ${formatYear(wall.year)} ${pad(wall.hour)}:${pad(wall.minute)}:${pad(wall.second)} ${formatOffset(offsetMs, '')}`;
}

/** 1–366. */
export function dayOfYear(wall: Pick<WallTime, 'year' | 'month' | 'day'>): number {
  const start = localMs({
    year: wall.year,
    month: 1,
    day: 1,
    hour: 0,
    minute: 0,
    second: 0,
    millisecond: 0,
  });
  const day = localMs({ ...wall, hour: 0, minute: 0, second: 0, millisecond: 0 });
  return (day - start) / DAY + 1;
}

/** ISO 8601 week date: weeks start on Monday and week 1 holds the year's first Thursday. */
export function isoWeek(wall: Pick<WallTime, 'year' | 'month' | 'day'>): {
  year: number;
  week: number;
} {
  const day = localMs({ ...wall, hour: 0, minute: 0, second: 0, millisecond: 0 });
  const weekday = mod(new Date(day).getUTCDay() + 6, 7); // Monday = 0
  const thursday = wallOf(day + (3 - weekday) * DAY);
  return { year: thursday.year, week: Math.floor((dayOfYear(thursday) - 1) / 7) + 1 };
}
