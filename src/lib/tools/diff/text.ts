import { diffSequences, internKeys, type Hunk } from './sequence';

/**
 * Line diff with word- or character-level detail inside changed lines, in the shape editors use:
 * UTF-16 offset ranges into both texts.
 */

/** `a[fromA, toA)` was replaced by `b[fromB, toB)`. */
export type TextChange = { fromA: number; toA: number; fromB: number; toB: number };

export type Granularity = 'word' | 'char';

export type TextDiffOptions = {
  /** Compare as if all whitespace (including line endings) were removed, like `diff -w`. */
  ignoreWhitespace?: boolean;
  ignoreCase?: boolean;
  /** Detail inside changed lines. Defaults to `word`. */
  granularity?: Granularity;
};

/** Changed lines are paired one to one; the rest of a changed block counts as added or removed. */
export type LineStats = { added: number; removed: number; changed: number };

export type TextDiff = {
  changes: TextChange[];
  stats: LineStats;
  /** False when the inputs were too different for an exact diff within the work budget. */
  minimal: boolean;
};

/** Changed blocks with more tokens than this (per side) are highlighted as a whole. */
const MAX_INLINE_TOKENS = 10_000;
/** Work allowed for the detail diff of one changed block. */
const INLINE_BUDGET = 250_000;

const WORD_TOKEN = /[\p{L}\p{M}\p{N}_]+|\s+|[^]/gu;
const CHAR_TOKEN = /\s+|[^]/gu;
const WHITESPACE = /\s+/g;

type Span = { from: number; to: number };
type Token = Span & { key: string };

/** Lines including their terminator, so a missing final newline counts as a difference. */
function splitLines(text: string): Span[] {
  const lines: Span[] = [];
  let from = 0;
  while (from < text.length) {
    const newline = text.indexOf('\n', from);
    const to = newline === -1 ? text.length : newline + 1;
    lines.push({ from, to });
    from = to;
  }
  return lines;
}

function normalizer(options: TextDiffOptions): (text: string) => string {
  const { ignoreWhitespace = false, ignoreCase = false } = options;
  return (text) => {
    let key = ignoreWhitespace ? text.replace(WHITESPACE, '') : text;
    if (ignoreCase) key = key.toLowerCase();
    return key;
  };
}

export function diffText(a: string, b: string, options: TextDiffOptions = {}): TextDiff {
  const normalize = normalizer(options);
  const linesA = splitLines(a);
  const linesB = splitLines(b);
  const [idsA, idsB] = internKeys(
    linesA.map((line) => normalize(a.slice(line.from, line.to))),
    linesB.map((line) => normalize(b.slice(line.from, line.to)))
  );
  const { hunks, minimal } = diffSequences(idsA, idsB);

  const changes: TextChange[] = [];
  const stats: LineStats = { added: 0, removed: 0, changed: 0 };
  const range = (lines: Span[], text: string, from: number, to: number): Span => {
    const start = from < lines.length ? lines[from].from : text.length;
    return { from: start, to: to > from ? lines[to - 1].to : start };
  };

  for (const hunk of hunks) {
    const spanA = range(linesA, a, hunk.fromA, hunk.toA);
    const spanB = range(linesB, b, hunk.fromB, hunk.toB);
    const block =
      hunk.fromA === hunk.toA || hunk.fromB === hunk.toB
        ? [{ fromA: spanA.from, toA: spanA.to, fromB: spanB.from, toB: spanB.to }]
        : inlineChanges(a, spanA, b, spanB, options);
    // Lines whose keys differ can still hold the same tokens (with whitespace ignored, `ab`
    // split over two lines); such a block isn't a change.
    if (block.length === 0) continue;
    changes.push(...block);
    countLines(hunk, stats);
  }
  return { changes, stats, minimal };
}

function countLines(hunk: Hunk, stats: LineStats) {
  const removed = hunk.toA - hunk.fromA;
  const added = hunk.toB - hunk.fromB;
  const paired = Math.min(removed, added);
  stats.changed += paired;
  stats.removed += removed - paired;
  stats.added += added - paired;
}

function tokenize(text: string, span: Span, options: TextDiffOptions): Token[] {
  const pattern = options.granularity === 'char' ? CHAR_TOKEN : WORD_TOKEN;
  const tokens: Token[] = [];
  const source = text.slice(span.from, span.to);
  for (const match of source.matchAll(pattern)) {
    const value = match[0];
    if (options.ignoreWhitespace && /^\s/.test(value)) continue;
    const from = span.from + match.index;
    tokens.push({
      from,
      to: from + value.length,
      key: options.ignoreCase ? value.toLowerCase() : value,
    });
  }
  return tokens;
}

/** Word or character changes between two blocks of changed lines. */
function inlineChanges(
  a: string,
  spanA: Span,
  b: string,
  spanB: Span,
  options: TextDiffOptions
): TextChange[] {
  const whole = [{ fromA: spanA.from, toA: spanA.to, fromB: spanB.from, toB: spanB.to }];
  const tokensA = tokenize(a, spanA, options);
  const tokensB = tokenize(b, spanB, options);
  if (tokensA.length > MAX_INLINE_TOKENS || tokensB.length > MAX_INLINE_TOKENS) return whole;

  const [idsA, idsB] = internKeys(
    tokensA.map((token) => token.key),
    tokensB.map((token) => token.key)
  );
  // An insertion sits right after the previous token (or before the first one).
  const at = (tokens: Token[], index: number, start: number) =>
    index > 0 ? tokens[index - 1].to : (tokens[0]?.from ?? start);
  const toRange = (tokens: Token[], from: number, to: number, start: number): Span =>
    to > from
      ? { from: tokens[from].from, to: tokens[to - 1].to }
      : { from: at(tokens, from, start), to: at(tokens, from, start) };

  return diffSequences(idsA, idsB, INLINE_BUDGET).hunks.map((hunk) => {
    const changeA = toRange(tokensA, hunk.fromA, hunk.toA, spanA.from);
    const changeB = toRange(tokensB, hunk.fromB, hunk.toB, spanB.from);
    return { fromA: changeA.from, toA: changeA.to, fromB: changeB.from, toB: changeB.to };
  });
}
