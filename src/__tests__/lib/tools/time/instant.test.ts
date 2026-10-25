import { describe, it, expect } from 'vitest';
import {
  dayOfYear,
  detectUnit,
  epochValues,
  formatIso,
  formatRfc2822,
  isoWeek,
  parseTimeInput,
  type TimeInput,
} from '@/lib/tools/time/instant';
import {
  formatOffset,
  instantsAt,
  localMs,
  resolveLocal,
  wallTime,
  zoneOffset,
} from '@/lib/tools/time/zone';

const parse = (text: string, timeZone = 'UTC', unit: 'auto' | 's' | 'ms' | 'us' | 'ns' = 'auto') =>
  parseTimeInput(text, { unit, timeZone });
const ok = (result: TimeInput) => {
  if (!result.ok) throw new Error(result.message);
  return result;
};
const local = (text: string) => {
  const [date, time = '00:00:00'] = text.split('T');
  const [year, month, day] = date.split('-').map(Number);
  const [hour, minute, second = 0] = time.split(':').map(Number);
  return localMs({ year, month, day, hour, minute, second, millisecond: 0 });
};

describe('epoch input', () => {
  it('detects the unit from the digit count', () => {
    expect(detectUnit(10)).toBe('s');
    expect(detectUnit(13)).toBe('ms');
    expect(detectUnit(16)).toBe('us');
    expect(detectUnit(19)).toBe('ns');
  });

  it('reads every unit to the same instant', () => {
    for (const text of ['1700000000', '1700000000000', '1700000000000000', '1700000000000000000']) {
      expect(ok(parse(text)).instant.ms).toBe(1700000000000);
    }
    expect(ok(parse('1700000000', 'UTC', 'ms')).instant.ms).toBe(1700000000);
  });

  it('keeps nanoseconds beyond the millisecond', () => {
    const { instant } = ok(parse('1700000000123456789'));
    expect(instant).toEqual({ ms: 1700000000123, nanos: 456789, digits: 9 });
    expect(epochValues(instant)).toEqual({
      s: '1700000000',
      ms: '1700000000123',
      us: '1700000000123456',
      ns: '1700000000123456789',
    });
    expect(formatIso(instant)).toBe('2023-11-14T22:13:20.123456789Z');
  });

  it('reads negative and fractional seconds, flooring toward the past', () => {
    const negative = ok(parse('-1.5')).instant;
    expect(negative).toEqual({ ms: -1500, nanos: 0, digits: 3 });
    expect(formatIso(negative)).toBe('1969-12-31T23:59:58.500Z');
    expect(epochValues(negative).s).toBe('-2');
    expect(ok(parse('-1', 'UTC', 'ns')).instant).toEqual({ ms: -1, nanos: 999999, digits: 9 });
  });

  it('accepts digit groups and rejects out-of-range values', () => {
    expect(ok(parse('1_700_000_000')).instant.ms).toBe(1700000000000);
    expect(parse('99999999999999999', 'UTC', 's')).toMatchObject({ ok: false });
  });
});

describe('date input', () => {
  it('reads ISO 8601 with an offset', () => {
    expect(ok(parse('2023-11-15T07:13:20+09:00')).instant.ms).toBe(1700000000000);
    expect(ok(parse('2023-11-14 22:13:20.5z')).instant).toEqual({
      ms: 1700000000500,
      nanos: 0,
      digits: 3,
    });
    expect(ok(parse('2023-11-14T17:13:20-0500')).instant.ms).toBe(1700000000000);
  });

  it('places a date without an offset in the chosen zone', () => {
    expect(ok(parse('2023-11-14T17:13:20', 'America/New_York')).instant.ms).toBe(1700000000000);
    expect(ok(parse('2024-03-10', 'UTC')).instant.ms).toBe(Date.UTC(2024, 2, 10));
  });

  it('reports DST gaps and overlaps for wall times', () => {
    const gap = ok(parse('2026-03-08T02:30', 'America/New_York'));
    expect(gap).toMatchObject({ resolution: 'gap' });
    expect(formatIso(gap.instant)).toBe('2026-03-08T07:30:00Z');
    const overlap = ok(parse('2026-11-01T01:30', 'America/New_York'));
    expect(overlap).toMatchObject({ resolution: 'overlap' });
    expect(formatIso(overlap.instant)).toBe('2026-11-01T05:30:00Z');
  });

  it('reads RFC 2822 strings that carry a zone', () => {
    expect(ok(parse('Tue, 14 Nov 2023 22:13:20 GMT')).instant.ms).toBe(1700000000000);
    expect(ok(parse('Wed, 15 Nov 2023 07:13:20 +0900')).instant.ms).toBe(1700000000000);
  });

  it('rejects impossible dates and unknown text', () => {
    expect(parse('2023-02-29')).toMatchObject({ ok: false });
    expect(parse('2023-13-01')).toMatchObject({ ok: false });
    expect(parse('2023-01-01T24:00')).toMatchObject({ ok: false });
    expect(parse('next tuesday')).toMatchObject({ ok: false });
  });
});

describe('formatting', () => {
  const instant = { ms: 1700000000000, nanos: 0, digits: 0 as const };

  it('writes ISO 8601 and RFC 2822 with an offset', () => {
    const offset = zoneOffset(instant.ms, 'Asia/Kolkata');
    expect(formatIso(instant, offset)).toBe('2023-11-15T03:43:20+05:30');
    expect(formatRfc2822(instant.ms)).toBe('Tue, 14 Nov 2023 22:13:20 +0000');
    expect(formatRfc2822(instant.ms, offset)).toBe('Wed, 15 Nov 2023 03:43:20 +0530');
  });

  it('writes expanded years outside 0000–9999', () => {
    expect(formatIso({ ms: -62198755200000, nanos: 0, digits: 0 })).toBe('-000001-01-01T00:00:00Z');
  });

  it('formats offsets, including historic ones with seconds', () => {
    expect(formatOffset(-5 * 3600e3)).toBe('-05:00');
    expect(formatOffset(0)).toBe('+00:00');
    expect(formatOffset(5 * 3600e3 + 45 * 60e3, '')).toBe('+0545');
    expect(formatOffset(-(17 * 60 + 30) * 1000)).toBe('-00:17:30');
  });

  it('computes ISO weeks and days of the year', () => {
    expect(isoWeek({ year: 2021, month: 1, day: 3 })).toEqual({ year: 2020, week: 53 });
    expect(isoWeek({ year: 2026, month: 12, day: 31 })).toEqual({ year: 2026, week: 53 });
    expect(isoWeek({ year: 2024, month: 12, day: 30 })).toEqual({ year: 2025, week: 1 });
    expect(dayOfYear({ year: 2024, month: 12, day: 31 })).toBe(366);
    expect(dayOfYear({ year: 2026, month: 3, day: 1 })).toBe(60);
  });
});

describe('zones', () => {
  it('reads the wall time and offset of an instant', () => {
    expect(wallTime(1700000000000, 'Asia/Tokyo')).toMatchObject({
      year: 2023,
      month: 11,
      day: 15,
      hour: 7,
    });
    expect(zoneOffset(Date.UTC(2026, 6, 1), 'Europe/London')).toBe(3600e3);
  });

  it('finds no instant in a gap and two in an overlap', () => {
    expect(instantsAt(local('2026-03-29T01:30'), 'Europe/London')).toEqual([]);
    expect(instantsAt(local('2026-10-25T01:30'), 'Europe/London')).toEqual([
      Date.UTC(2026, 9, 25, 0, 30),
      Date.UTC(2026, 9, 25, 1, 30),
    ]);
    expect(resolveLocal(local('2026-03-29T01:30'), 'Europe/London')).toEqual({
      ms: Date.UTC(2026, 2, 29, 1, 30),
      kind: 'gap',
    });
  });
});
