export type DiffEntry =
  | { type: 'equal'; left: string; right: string; leftNum: number; rightNum: number }
  | { type: 'modify'; left: string; right: string; leftNum: number; rightNum: number }
  | { type: 'delete'; left: string; leftNum: number }
  | { type: 'insert'; right: string; rightNum: number };

function extractKey(line: string): string | null {
  const match = line.match(/^\s*"([^"]+)"\s*:/);
  return match ? match[1] : null;
}

function normalizeForComparison(line: string): string {
  // Remove trailing comma for comparison purposes
  return line.replace(/,\s*$/, '');
}

export function computeDiff(lines1: string[], lines2: string[]): DiffEntry[] {
  const m = lines1.length;
  const n = lines2.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] =
        normalizeForComparison(lines1[i - 1]) === normalizeForComparison(lines2[j - 1])
          ? dp[i - 1][j - 1] + 1
          : Math.max(dp[i - 1][j], dp[i][j - 1]);

  const result: DiffEntry[] = [];
  let i = m,
    j = n;
  while (i > 0 || j > 0) {
    if (
      i > 0 &&
      j > 0 &&
      normalizeForComparison(lines1[i - 1]) === normalizeForComparison(lines2[j - 1])
    ) {
      result.unshift({
        type: 'equal',
        left: lines1[i - 1],
        right: lines2[j - 1],
        leftNum: i,
        rightNum: j,
      });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      result.unshift({ type: 'insert', right: lines2[j - 1], rightNum: j });
      j--;
    } else {
      result.unshift({ type: 'delete', left: lines1[i - 1], leftNum: i });
      i--;
    }
  }

  // Post-process: group consecutive deletes/inserts and match by key
  const merged: DiffEntry[] = [];
  let idx = 0;
  while (idx < result.length) {
    const curr = result[idx];

    if (curr.type === 'delete' || curr.type === 'insert') {
      // Collect consecutive deletes and inserts
      const deletes: DiffEntry[] = [];
      const inserts: DiffEntry[] = [];

      while (
        idx < result.length &&
        (result[idx].type === 'delete' || result[idx].type === 'insert')
      ) {
        if (result[idx].type === 'delete') {
          deletes.push(result[idx]);
        } else {
          inserts.push(result[idx]);
        }
        idx++;
      }

      // Match deletes and inserts by key
      const usedInsertIndices = new Set<number>();

      for (const del of deletes) {
        let found = false;
        for (let j = 0; j < inserts.length; j++) {
          if (!usedInsertIndices.has(j) && extractKey(del.left) === extractKey(inserts[j].right)) {
            merged.push({
              type: 'modify',
              left: normalizeForComparison(del.left),
              right: normalizeForComparison(inserts[j].right),
              leftNum: del.leftNum,
              rightNum: inserts[j].rightNum,
            });
            usedInsertIndices.add(j);
            found = true;
            break;
          }
        }
        if (!found) {
          merged.push(del);
        }
      }

      // Add unmatched inserts
      for (let j = 0; j < inserts.length; j++) {
        if (!usedInsertIndices.has(j)) {
          merged.push(inserts[j]);
        }
      }
    } else {
      merged.push(curr);
      idx++;
    }
  }

  return merged;
}
