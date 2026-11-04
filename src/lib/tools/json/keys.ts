const KEY = /"((?:[^"\\\n]|\\.)*)"\s*:/g;

/** Past this size, scanning on every completion request stops being instant. */
const MAX_SCAN = 1_000_000;
const MAX_KEYS = 500;

/**
 * The distinct object keys used in `text`, most frequent first (ties keep document order).
 * A regex scan, not a parse, so it works while the document is half-typed.
 */
export function collectKeys(text: string): string[] {
  const counts = new Map<string, number>();
  for (const match of text.slice(0, MAX_SCAN).matchAll(KEY)) {
    let key: string;
    try {
      key = JSON.parse(`"${match[1]}"`) as string;
    } catch {
      continue;
    }
    counts.set(key, (counts.get(key) ?? 0) + 1);
    if (counts.size >= MAX_KEYS) break;
  }
  return [...counts].sort((a, b) => b[1] - a[1]).map(([key]) => key);
}
