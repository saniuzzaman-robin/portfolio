import { describe, it, expect } from 'vitest';
import {
  addDuration,
  addMonths,
  calendarDifference,
  durationMs,
  formatIsoDuration,
  parseDuration,
  partsToDuration,
  type Duration,
} from '@/lib/tools/time/duration';
import { localMs, wallOf } from '@/lib/tools/time/zone';

const local = (year: number, month: number, day: number, hour = 0, minute = 0) =>
  localMs({ year, month, day, hour, minute, second: 0, millisecond: 0 });
const duration = (text: string): Duration => {
  const result = parseDuration(text);
  if (!result.ok) throw new Error(result.message);
  return result.duration;
};

describe('calendarDifference', () => {
  it('counts whole months with day clamping, then days and time', () => {
    expect(calendarDifference(local(2026, 1, 31), local(2026, 3, 1))).toEqual({
      sign: 1,
      parts: { years: 0, months: 1, days: 1, hours: 0, minutes: 0, seconds: 0, milliseconds: 0 },
    });
    expect(calendarDifference(local(2020, 2, 29, 12), local(2026, 10, 25, 9, 30)).parts).toEqual({
      years: 6,
      months: 7,
      days: 25,
      hours: 21,
      minutes: 30,
      seconds: 0,
      milliseconds: 0,
    });
  });

  it('is negative when the end comes first, and zero when equal', () => {
    const { sign, parts } = calendarDifference(local(2026, 3, 1), local(2026, 1, 31));
    expect(sign).toBe(-1);
    expect(parts.months).toBe(1);
    expect(calendarDifference(local(2026, 1, 1), local(2026, 1, 1)).sign).toBe(0);
  });

  it('clamps when adding months', () => {
    expect(wallOf(addMonths(local(2024, 1, 31), 1))).toMatchObject({ month: 2, day: 29 });
    expect(wallOf(addMonths(local(2024, 3, 31), -13))).toMatchObject({
      year: 2023,
      month: 2,
      day: 28,
    });
  });
});

describe('parseDuration', () => {
  it('reads ISO 8601 and normalizes the time part', () => {
    expect(duration('P1Y2M3W4DT5H6M7.5S')).toEqual({
      sign: 1,
      years: 1,
      months: 2,
      weeks: 3,
      days: 4,
      timeMs: 5 * 3600e3 + 6 * 60e3 + 7500,
    });
    expect(formatIsoDuration(duration('PT90M'))).toBe('PT1H30M');
    expect(formatIsoDuration(duration('-P1W'))).toBe('-P1W');
  });

  it('reads unit words, decimals and plain seconds', () => {
    expect(durationMs(duration('1h 30m'))).toBe(5400e3);
    expect(durationMs(duration('2 days, 4 hours and 5 secs'))).toBe(2 * 86400e3 + 4 * 3600e3 + 5e3);
    expect(durationMs(duration('1.5h'))).toBe(5400e3);
    expect(durationMs(duration('250ms'))).toBe(250);
    expect(durationMs(duration('90'))).toBe(90e3);
    expect(durationMs(duration('-1d'))).toBe(-86400e3);
  });

  it('has no exact length with years or months', () => {
    expect(durationMs(duration('1mo'))).toBeNull();
    expect(durationMs(duration('P1Y'))).toBeNull();
  });

  it('rejects unknown units, stray text and fractional calendar units', () => {
    expect(parseDuration('3 fortnights')).toMatchObject({ ok: false });
    expect(parseDuration('1h x')).toMatchObject({ ok: false });
    expect(parseDuration('1.5 days')).toMatchObject({ ok: false });
    expect(parseDuration('P')).toMatchObject({ ok: false });
    expect(parseDuration('')).toMatchObject({ ok: false });
  });
});

describe('formatIsoDuration', () => {
  it('writes zero as PT0S and fractional seconds', () => {
    expect(formatIsoDuration(duration('0'))).toBe('PT0S');
    expect(formatIsoDuration(duration('1.25s'))).toBe('PT1.25S');
    expect(
      formatIsoDuration(
        partsToDuration(-1, {
          years: 1,
          months: 0,
          days: 2,
          hours: 0,
          minutes: 0,
          seconds: 3,
          milliseconds: 0,
        })
      )
    ).toBe('-P1Y2DT3S');
  });
});

describe('addDuration', () => {
  it('keeps the wall time across DST for days and adds exact time for hours', () => {
    const start = Date.UTC(2026, 2, 7, 17); // 12:00 EST, the day before spring forward
    const day = addDuration(start, duration('1d'), 1, 'America/New_York');
    expect(new Date(day.ms).toISOString()).toBe('2026-03-08T16:00:00.000Z'); // 12:00 EDT
    const hours = addDuration(start, duration('24h'), 1, 'America/New_York');
    expect(new Date(hours.ms).toISOString()).toBe('2026-03-08T17:00:00.000Z'); // 13:00 EDT
  });

  it('subtracts and clamps months', () => {
    const start = Date.UTC(2026, 2, 31, 9);
    const result = addDuration(start, duration('1mo'), -1, 'UTC');
    expect(new Date(result.ms).toISOString()).toBe('2026-02-28T09:00:00.000Z');
  });
});
