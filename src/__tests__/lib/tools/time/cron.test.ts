import { describe, it, expect } from 'vitest';
import { parseCron, switchSyntax, type CronExpression } from '@/lib/tools/time/cron';
import { matchingDays, nextRuns } from '@/lib/tools/time/schedule';

const cron = (text: string, quartz = false): CronExpression => {
  const result = parseCron(text, { quartz });
  if (!result.ok) throw new Error(result.error.message);
  return result.cron;
};
/** Next runs as ISO strings in UTC, with a `*` for DST-flagged runs. */
const runs = (text: string, from: string, count: number, timeZone = 'UTC', quartz = false) =>
  nextRuns(cron(text, quartz), Date.parse(from), count, timeZone).runs.map(
    (run) => new Date(run.ms).toISOString().slice(0, 19) + (run.dst ? ` ${run.dst}` : '')
  );

describe('parseCron', () => {
  it('expands ranges, steps, lists and names', () => {
    const { fields } = cron('*/15 9-17 1,15 JAN-MAR mon-fri');
    expect(fields.minute?.values).toEqual([0, 15, 30, 45]);
    expect(fields.hour?.values).toEqual([9, 10, 11, 12, 13, 14, 15, 16, 17]);
    expect(fields.dayOfMonth?.values).toEqual([1, 15]);
    expect(fields.month?.values).toEqual([1, 2, 3]);
    expect(fields.dayOfWeek?.values).toEqual([1, 2, 3, 4, 5]);
    expect(fields.second).toBeUndefined();
  });

  it('reads a start with a step, seconds first, and 7 as Sunday', () => {
    const { fields } = cron('30 5/20 * * * 7');
    expect(fields.second?.values).toEqual([30]);
    expect(fields.minute?.values).toEqual([5, 25, 45]);
    expect(fields.dayOfWeek?.values).toEqual([0]);
  });

  it('expands macros', () => {
    expect(cron('@daily')).toMatchObject({ macro: '@daily', expanded: '0 0 * * *' });
    expect(cron('@weekly', true).expanded).toBe('0 0 0 ? * 1');
    expect(cron('@yearly', true).expanded).toBe('0 0 0 1 1 ?');
  });

  it('numbers Quartz weekdays from 1 = Sunday and reads L, W and #', () => {
    const { fields } = cron('0 0 12 ? * 2-6', true);
    expect(fields.dayOfWeek?.values).toEqual([1, 2, 3, 4, 5]);
    expect(cron('0 0 12 L-2,15W,LW * ?', true).fields.dayOfMonth?.rules).toEqual([
      { kind: 'last', offset: 2 },
      { kind: 'nearestWeekday', day: 15 },
      { kind: 'lastWeekday' },
    ]);
    expect(cron('0 0 12 ? * FRI#3,6L,L', true).fields.dayOfWeek?.rules).toEqual([
      { kind: 'nth', weekday: 5, nth: 3 },
      { kind: 'lastOf', weekday: 5 },
      { kind: 'lastOf', weekday: 6 },
    ]);
    expect(cron('0 0 0 1 1 ? 2030-2032', true).fields.year?.values).toEqual([2030, 2031, 2032]);
  });

  it('points errors at the offending part', () => {
    expect(parseCron('0 60 * * *', { quartz: false })).toEqual({
      ok: false,
      error: { message: 'Hour: 60 is out of range (0–23).', from: 2, to: 4, field: 'hour' },
    });
    expect(parseCron('* * *', { quartz: false })).toMatchObject({
      ok: false,
      error: { from: 0, to: 5 },
    });
    expect(parseCron('5-1 * * * *', { quartz: false })).toMatchObject({
      ok: false,
      error: { field: 'minute' },
    });
    expect(parseCron('*/0 * * * *', { quartz: false })).toMatchObject({
      ok: false,
      error: { from: 2, to: 3 },
    });
    expect(parseCron('* * * * FOO', { quartz: false })).toMatchObject({
      ok: false,
      error: { from: 8, to: 11 },
    });
    expect(parseCron('@reboot', { quartz: false })).toMatchObject({ ok: false });
  });

  it('keeps Quartz syntax behind the option and enforces its ? rule', () => {
    expect(parseCron('0 12 L * *', { quartz: false })).toMatchObject({
      ok: false,
      error: { field: 'dayOfMonth' },
    });
    expect(parseCron('0 12 ? * *', { quartz: false })).toMatchObject({ ok: false });
    expect(parseCron('* * * * * WED', { quartz: false }).ok).toBe(true);
    expect(parseCron('0 0 12 * * *', { quartz: true })).toMatchObject({ ok: false });
    expect(parseCron('0 0 12 ? * ?', { quartz: true })).toMatchObject({ ok: false });
    expect(parseCron('0 12 * * *', { quartz: true })).toMatchObject({ ok: false });
  });
});

describe('matchingDays', () => {
  const days = (text: string, year: number, month: number, quartz = false) =>
    [...matchingDays(cron(text, quartz), year, month)].sort((a, b) => a - b);

  it('ORs day of month and day of week when both are restricted (Vixie)', () => {
    // October 2026: Fridays are 2, 9, 16, 23, 30.
    expect(days('0 0 13 * 5', 2026, 10)).toEqual([2, 9, 13, 16, 23, 30]);
  });

  it('ANDs them when either starts with *', () => {
    // Odd days that are Mondays: 5 and 19 (12 and 26 are even).
    expect(days('0 0 */2 * 1', 2026, 10)).toEqual([5, 19]);
  });

  it('resolves L, LW, W and # within the month', () => {
    expect(days('0 0 12 L * ?', 2028, 2, true)).toEqual([29]);
    expect(days('0 0 12 L-3 * ?', 2026, 2, true)).toEqual([25]);
    // August 2026 starts on a Saturday and ends on a Monday.
    expect(days('0 0 12 1W * ?', 2026, 8, true)).toEqual([3]);
    expect(days('0 0 12 LW * ?', 2026, 8, true)).toEqual([31]);
    // October 2026 ends on a Saturday; the 18th is a Sunday.
    expect(days('0 0 12 LW * ?', 2026, 10, true)).toEqual([30]);
    expect(days('0 0 12 18W * ?', 2026, 10, true)).toEqual([19]);
    expect(days('0 0 12 31W * ?', 2026, 9, true)).toEqual([]);
    expect(days('0 0 12 ? * 6#3', 2026, 10, true)).toEqual([16]);
    expect(days('0 0 12 ? * 2#5', 2026, 10, true)).toEqual([]);
    expect(days('0 0 12 ? * 1L', 2026, 10, true)).toEqual([25]);
  });
});

describe('nextRuns', () => {
  it('lists runs strictly after the start', () => {
    expect(runs('*/15 9 * * *', '2026-10-25T09:15:00Z', 3)).toEqual([
      '2026-10-25T09:30:00',
      '2026-10-25T09:45:00',
      '2026-10-26T09:00:00',
    ]);
    expect(runs('30 * * * * *', '2026-10-25T09:15:30.500Z', 2)).toEqual([
      '2026-10-25T09:16:30',
      '2026-10-25T09:17:30',
    ]);
  });

  it('honours months, weekdays, macros and years', () => {
    expect(runs('0 9 * JAN-MAR MON', '2026-10-25T00:00:00Z', 2)).toEqual([
      '2027-01-04T09:00:00',
      '2027-01-11T09:00:00',
    ]);
    expect(runs('@yearly', '2026-10-25T00:00:00Z', 1)).toEqual(['2027-01-01T00:00:00']);
    expect(runs('0 0 0 29 2 ? 2025-2099', '2026-10-25T00:00:00Z', 2, 'UTC', true)).toEqual([
      '2028-02-29T00:00:00',
      '2032-02-29T00:00:00',
    ]);
  });

  it('reports a schedule that never runs', () => {
    const result = nextRuns(cron('0 0 30 2 *'), Date.parse('2026-01-01T00:00:00Z'), 5, 'UTC');
    expect(result).toEqual({ runs: [], exhausted: true });
    const past = nextRuns(
      cron('0 0 0 1 1 ? 2020', true),
      Date.parse('2026-01-01T00:00:00Z'),
      1,
      'UTC'
    );
    expect(past.exhausted).toBe(true);
  });

  it('runs in the chosen zone', () => {
    expect(runs('0 9 * * *', '2026-10-24T12:00:00Z', 2, 'Asia/Tokyo')).toEqual([
      '2026-10-25T00:00:00',
      '2026-10-26T00:00:00',
    ]);
  });

  describe('across DST (America/New_York, 2026)', () => {
    it('runs a fixed-time job in the spring gap right after it, once', () => {
      expect(runs('30 2 * * *', '2026-03-07T00:00:00Z', 3, 'America/New_York')).toEqual([
        '2026-03-07T07:30:00', // 02:30 EST
        '2026-03-08T07:30:00 shifted', // 02:30 doesn't exist: 03:30 EDT
        '2026-03-09T06:30:00', // 02:30 EDT
      ]);
    });

    it('skips gap times for a wildcard job', () => {
      expect(runs('0 * * * *', '2026-03-08T05:30:00Z', 3, 'America/New_York')).toEqual([
        '2026-03-08T06:00:00', // 01:00 EST
        '2026-03-08T07:00:00', // 03:00 EDT (02:00 never happened)
        '2026-03-08T08:00:00',
      ]);
    });

    it('does not duplicate a shifted run that matches after the gap too', () => {
      expect(runs('0,30 2,3 * * *', '2026-03-08T05:00:00Z', 3, 'America/New_York')).toEqual([
        '2026-03-08T07:00:00 shifted',
        '2026-03-08T07:30:00 shifted',
        '2026-03-09T06:00:00',
      ]);
    });

    it('runs a fixed-time job once in the repeated autumn hour', () => {
      expect(runs('30 1 * * *', '2026-10-31T12:00:00Z', 2, 'America/New_York')).toEqual([
        '2026-11-01T05:30:00', // 01:30 EDT only
        '2026-11-02T06:30:00', // 01:30 EST
      ]);
    });

    it('runs a wildcard job in both copies of the repeated hour, in time order', () => {
      expect(runs('*/30 * * * *', '2026-11-01T04:45:00Z', 5, 'America/New_York')).toEqual([
        '2026-11-01T05:00:00', // 01:00 EDT
        '2026-11-01T05:30:00', // 01:30 EDT
        '2026-11-01T06:00:00 repeated', // 01:00 EST
        '2026-11-01T06:30:00 repeated', // 01:30 EST
        '2026-11-01T07:00:00', // 02:00 EST
      ]);
    });
  });

  it('handles Europe/London on its own transition days', () => {
    expect(runs('30 1 * * *', '2026-03-28T12:00:00Z', 2, 'Europe/London')).toEqual([
      '2026-03-29T01:30:00 shifted', // 01:30 GMT doesn't exist: 02:30 BST
      '2026-03-30T00:30:00',
    ]);
    expect(runs('15 1 * * *', '2026-10-24T12:00:00Z', 2, 'Europe/London')).toEqual([
      '2026-10-25T00:15:00', // 01:15 BST, not again at 01:15 GMT
      '2026-10-26T01:15:00',
    ]);
  });
});

describe('switchSyntax', () => {
  it('converts Unix to Quartz: seconds, a ? day and weekdays from 1', () => {
    expect(switchSyntax(cron('*/15 9-17 * * 1-5'), true)).toBe('0 */15 9-17 ? * 2-6');
    expect(switchSyntax(cron('0 0 1 * *'), true)).toBe('0 0 0 1 * ?');
    expect(switchSyntax(cron('30 0 0 * * 0,6,1-5/2'), true)).toBe('30 0 0 ? * 1,7,2-6/2');
    expect(switchSyntax(cron('0 0 13 * 5'), true)).toBeNull();
  });

  it('converts Quartz to Unix, dropping a zero second', () => {
    expect(switchSyntax(cron('0 0 12 ? * 2#1', true), false)).toBeNull();
    expect(switchSyntax(cron('0 30 9 ? * MON-FRI *', true), false)).toBe('30 9 * * MON-FRI');
    expect(switchSyntax(cron('15 0 0 ? * 1,7', true), false)).toBe('15 0 0 * * 0,6');
    expect(switchSyntax(cron('0 0 0 1 1 ? 2030', true), false)).toBeNull();
  });

  it('round-trips', () => {
    const unix = '5 4 * * SUN';
    expect(switchSyntax(cron(switchSyntax(cron(unix), true)!, true), false)).toBe(unix);
  });
});
