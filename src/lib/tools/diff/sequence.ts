/**
 * Myers' O(ND) difference algorithm in linear space: the middle-snake bisection from
 * "An O(ND) Difference Algorithm and Its Variations" (1986), over sequences of integer ids.
 *
 * Work is bounded by a budget of explored diagonals. A region that would need more is reported
 * as one replacement instead, and the result is marked as not minimal, so pathological inputs
 * stay fast and still produce a correct (if coarser) diff.
 */

/** A differing region: items `[fromA, toA)` of `a` were replaced by `[fromB, toB)` of `b`. */
export type Hunk = { fromA: number; toA: number; fromB: number; toB: number };

export type SequenceDiff = {
  /** Non-overlapping, in order, separated by at least one equal item. */
  hunks: Hunk[];
  /** False when the budget ran out and some region was replaced wholesale. */
  minimal: boolean;
};

/** Diagonals the default budget allows across one whole diff. */
export const DEFAULT_BUDGET = 4_000_000;

type Budget = { left: number; minimal: boolean };
type Point = { x: number; y: number };

export function diffSequences(
  a: ArrayLike<number>,
  b: ArrayLike<number>,
  budget = DEFAULT_BUDGET
): SequenceDiff {
  const hunks: Hunk[] = [];
  const state: Budget = { left: budget, minimal: true };

  const emit = (fromA: number, toA: number, fromB: number, toB: number) => {
    if (fromA === toA && fromB === toB) return;
    const last = hunks[hunks.length - 1];
    if (last && last.toA === fromA && last.toB === fromB) {
      last.toA = toA;
      last.toB = toB;
    } else {
      hunks.push({ fromA, toA, fromB, toB });
    }
  };

  // An explicit stack instead of recursion: degenerate inputs can split very deeply. The right
  // half is pushed first so regions are finished left to right and hunks come out in order.
  const stack: [number, number, number, number][] = [[0, a.length, 0, b.length]];
  while (stack.length > 0) {
    let [aLo, aHi, bLo, bHi] = stack.pop()!;
    while (aLo < aHi && bLo < bHi && a[aLo] === b[bLo]) {
      aLo++;
      bLo++;
    }
    while (aLo < aHi && bLo < bHi && a[aHi - 1] === b[bHi - 1]) {
      aHi--;
      bHi--;
    }
    if (aLo === aHi || bLo === bHi) {
      emit(aLo, aHi, bLo, bHi);
      continue;
    }
    const split = middleSnake(a, aLo, aHi, b, bLo, bHi, state);
    if (split === 'disjoint') {
      emit(aLo, aHi, bLo, bHi);
      continue;
    }
    // A split on a corner would make no progress; treat it like an exhausted budget.
    if (!split || (split.x === aLo && split.y === bLo) || (split.x === aHi && split.y === bHi)) {
      state.minimal = false;
      emit(aLo, aHi, bLo, bHi);
      continue;
    }
    stack.push([split.x, aHi, split.y, bHi], [aLo, split.x, bLo, split.y]);
  }

  return { hunks, minimal: state.minimal };
}

/**
 * Runs the forward and reverse searches until their paths overlap and returns the point where
 * the optimal edit path crosses the middle, `'disjoint'` when the ranges share no item (so
 * replacing one with the other is optimal), or null when the budget runs out first.
 * Callers trim common prefixes and suffixes, so both ranges are non-empty and differ at both ends.
 */
function middleSnake(
  a: ArrayLike<number>,
  aLo: number,
  aHi: number,
  b: ArrayLike<number>,
  bLo: number,
  bHi: number,
  budget: Budget
): Point | 'disjoint' | null {
  const n = aHi - aLo;
  const m = bHi - bLo;
  const maxD = Math.ceil((n + m) / 2);
  const offset = maxD;
  const size = 2 * maxD + 2;
  // forward[k] / reverse[k]: furthest x reached on diagonal k (x - y = k), or -1 when unvisited.
  const forward = new Int32Array(size).fill(-1);
  const reverse = new Int32Array(size).fill(-1);
  forward[offset + 1] = 0;
  reverse[offset + 1] = 0;
  const delta = n - m;
  // With an odd delta the paths can first meet during a forward step, otherwise a reverse one.
  const checkForward = delta % 2 !== 0;
  // Diagonals that ran off the edge of the grid are skipped from then on.
  let forwardStart = 0;
  let forwardEnd = 0;
  let reverseStart = 0;
  let reverseEnd = 0;

  for (let d = 0; d < maxD; d++) {
    budget.left -= 2 * d + 1;
    if (budget.left < 0) return null;

    for (let k = -d + forwardStart; k <= d - forwardEnd; k += 2) {
      const index = offset + k;
      let x =
        k === -d || (k !== d && forward[index - 1] < forward[index + 1])
          ? forward[index + 1]
          : forward[index - 1] + 1;
      let y = x - k;
      while (x < n && y < m && a[aLo + x] === b[bLo + y]) {
        x++;
        y++;
      }
      forward[index] = x;
      if (x > n) forwardEnd += 2;
      else if (y > m) forwardStart += 2;
      else if (checkForward) {
        const other = offset + delta - k;
        if (other >= 0 && other < size && reverse[other] !== -1 && x >= n - reverse[other]) {
          return { x: aLo + x, y: bLo + y };
        }
      }
    }

    for (let k = -d + reverseStart; k <= d - reverseEnd; k += 2) {
      const index = offset + k;
      let x =
        k === -d || (k !== d && reverse[index - 1] < reverse[index + 1])
          ? reverse[index + 1]
          : reverse[index - 1] + 1;
      let y = x - k;
      while (x < n && y < m && a[aHi - x - 1] === b[bHi - y - 1]) {
        x++;
        y++;
      }
      reverse[index] = x;
      if (x > n) reverseEnd += 2;
      else if (y > m) reverseStart += 2;
      else if (!checkForward) {
        const other = offset + delta - k;
        if (other >= 0 && other < size && forward[other] !== -1) {
          const forwardX = forward[other];
          if (forwardX >= n - x) {
            return { x: aLo + forwardX, y: bLo + offset + forwardX - other };
          }
        }
      }
    }
  }
  // With even one common item the edit distance is at most n + m - 2, and the searches meet by
  // d = maxD - 1. Getting here means there was none.
  return 'disjoint';
}

/** Maps equal keys to equal integers, so the diff compares numbers instead of strings. */
export function internKeys(a: readonly string[], b: readonly string[]): [Int32Array, Int32Array] {
  const ids = new Map<string, number>();
  const intern = (keys: readonly string[]) => {
    const out = new Int32Array(keys.length);
    keys.forEach((key, index) => {
      let id = ids.get(key);
      if (id === undefined) {
        id = ids.size;
        ids.set(key, id);
      }
      out[index] = id;
    });
    return out;
  };
  return [intern(a), intern(b)];
}
