import { describe, it, expect } from 'vitest';
import { findMatches, runRegex, type RegexRequest } from '@/lib/tools/regex/run';

const request = (overrides: Partial<RegexRequest>): RegexRequest => ({
  pattern: '',
  flags: 'g',
  text: '',
  mode: 'match',
  replacement: '',
  limit: 1000,
  ...overrides,
});

const DATE = '(?<year>\\d{4})-(?<month>\\d{2})(-(\\d{2}))?';

describe('findMatches', () => {
  it('returns match and group offsets', () => {
    const { matches, truncated } = findMatches(
      new RegExp(DATE, 'g'),
      'on 2026-10-25 and 2027-01',
      10
    );
    expect(truncated).toBe(false);
    expect(matches).toEqual([
      {
        start: 3,
        end: 13,
        groups: [
          [3, 7],
          [8, 10],
          [10, 13],
          [11, 13],
        ],
      },
      { start: 18, end: 25, groups: [[18, 22], [23, 25], null, null] },
    ]);
  });

  it('stops after the first match without g', () => {
    expect(findMatches(/\d/, 'a1b2', 10).matches).toHaveLength(1);
  });

  it('keeps sticky matches adjacent', () => {
    const { matches } = findMatches(/\d/gy, '12a3', 10);
    expect(matches.map((m) => m.start)).toEqual([0, 1]);
  });

  it('steps past empty matches, by code point in unicode mode', () => {
    expect(findMatches(/x*/g, 'ab', 10).matches.map((m) => m.start)).toEqual([0, 1, 2]);
    expect(findMatches(/(?:)/gu, '😀', 10).matches.map((m) => m.start)).toEqual([0, 2]);
    expect(findMatches(/(?:)/g, '😀', 10).matches.map((m) => m.start)).toEqual([0, 1, 2]);
  });

  it('truncates at the limit', () => {
    const { matches, truncated } = findMatches(/a/g, 'aaaa', 3);
    expect(matches).toHaveLength(3);
    expect(truncated).toBe(true);
    expect(findMatches(/a/g, 'aaa', 3).truncated).toBe(false);
  });
});

describe('runRegex', () => {
  it('reports invalid patterns', () => {
    expect(runRegex(request({ pattern: '(' }))).toEqual({ ok: false, error: 'Unterminated group' });
  });

  it('replaces with numbered and named references', () => {
    const result = runRegex(
      request({
        pattern: DATE,
        text: '2026-10-25, 2027-01',
        mode: 'replace',
        replacement: '$<month>/$1 [$&] $$',
      })
    );
    expect(result.ok && result.output).toBe('10/2026 [2026-10-25] $, 01/2027 [2027-01] $');
  });

  it('replaces only the first match without g', () => {
    const result = runRegex(
      request({ pattern: 'a', flags: '', text: 'aaa', mode: 'replace', replacement: 'b' })
    );
    expect(result.ok && result.output).toBe('baa');
  });

  it('splits, including captured separators and missing groups', () => {
    const result = runRegex(request({ pattern: '(-)|,', text: 'a-b,c', mode: 'split' }));
    expect(result.ok && result.pieces).toEqual(['a', '-', 'b', null, 'c']);
  });

  it('only computes the output its mode needs', () => {
    const result = runRegex(request({ pattern: 'a', text: 'a' }));
    expect(result.ok && [result.output, result.pieces, result.matches.length]).toEqual([
      null,
      null,
      1,
    ]);
  });
});
