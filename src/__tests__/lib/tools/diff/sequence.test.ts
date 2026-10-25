import { describe, it, expect } from 'vitest';
import { diffSequences, internKeys, type Hunk } from '@/lib/tools/diff/sequence';

/** Applies the hunks to `a`, which must give `b`; equal stretches must really be equal. */
function apply(a: number[], b: number[], hunks: Hunk[]): number[] {
  const out: number[] = [];
  let i = 0;
  let j = 0;
  for (const hunk of hunks) {
    expect(hunk.fromA - i).toBe(hunk.fromB - j);
    expect(a.slice(i, hunk.fromA)).toEqual(b.slice(j, hunk.fromB));
    out.push(...a.slice(i, hunk.fromA), ...b.slice(hunk.fromB, hunk.toB));
    i = hunk.toA;
    j = hunk.toB;
  }
  expect(a.slice(i)).toEqual(b.slice(j));
  return [...out, ...a.slice(i)];
}

/** Edits in the hunks (deleted + inserted items). */
const cost = (hunks: Hunk[]) =>
  hunks.reduce((sum, h) => sum + h.toA - h.fromA + h.toB - h.fromB, 0);

/** Minimal edit distance (insertions + deletions) by dynamic programming over the LCS. */
function editDistance(a: number[], b: number[]): number {
  const lcs = Array.from({ length: a.length + 1 }, () => new Array<number>(b.length + 1).fill(0));
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      lcs[i][j] =
        a[i - 1] === b[j - 1] ? lcs[i - 1][j - 1] + 1 : Math.max(lcs[i - 1][j], lcs[i][j - 1]);
    }
  }
  return a.length + b.length - 2 * lcs[a.length][b.length];
}

/** Deterministic pseudo-random sequences (mulberry32). */
function generator(seed: number) {
  let state = seed;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

describe('diffSequences', () => {
  it('finds nothing in equal sequences', () => {
    expect(diffSequences([1, 2, 3], [1, 2, 3])).toEqual({ hunks: [], minimal: true });
    expect(diffSequences([], [])).toEqual({ hunks: [], minimal: true });
  });

  it('reports pure insertions and deletions', () => {
    expect(diffSequences([], [1, 2]).hunks).toEqual([{ fromA: 0, toA: 0, fromB: 0, toB: 2 }]);
    expect(diffSequences([1, 2, 3], [1, 3]).hunks).toEqual([
      { fromA: 1, toA: 2, fromB: 1, toB: 1 },
    ]);
  });

  it('merges adjacent edits into one replacement', () => {
    expect(diffSequences([1, 2, 3], [1, 4, 3]).hunks).toEqual([
      { fromA: 1, toA: 2, fromB: 1, toB: 2 },
    ]);
  });

  it('matches the classic ABCABBA / CBABAC example with 5 edits', () => {
    const [a, b] = internKeys([...'ABCABBA'], [...'CBABAC']);
    const { hunks, minimal } = diffSequences(a, b);
    expect(minimal).toBe(true);
    expect(cost(hunks)).toBe(5);
    expect(apply([...a], [...b], hunks)).toEqual([...b]);
  });

  it('is minimal and correct on random inputs', () => {
    const random = generator(42);
    for (let round = 0; round < 300; round++) {
      const alphabet = 1 + Math.floor(random() * 5);
      const make = () =>
        Array.from({ length: Math.floor(random() * 30) }, () => Math.floor(random() * alphabet));
      const a = make();
      const b = make();
      const { hunks, minimal } = diffSequences(a, b);
      expect(minimal).toBe(true);
      expect(apply(a, b, hunks)).toEqual(b);
      expect(cost(hunks)).toBe(editDistance(a, b));
      for (let k = 1; k < hunks.length; k++) {
        expect(hunks[k].fromA).toBeGreaterThan(hunks[k - 1].toA);
      }
    }
  });

  it('falls back to a coarse but correct diff when the budget runs out', () => {
    const a = Array.from({ length: 2000 }, (_, i) => i);
    const b = Array.from({ length: 2000 }, (_, i) => (i % 3 === 0 ? -i - 1 : i));
    const { hunks, minimal } = diffSequences(a, b, 1000);
    expect(minimal).toBe(false);
    expect(apply(a, b, hunks)).toEqual(b);
  });
});

describe('internKeys', () => {
  it('gives equal keys equal ids across both sides', () => {
    const [a, b] = internKeys(['x', 'y', 'x'], ['y', 'z']);
    expect([...a]).toEqual([0, 1, 0]);
    expect([...b]).toEqual([1, 2]);
  });
});
