import type { Random } from '@/lib/tools/generate/random';

/** A line's terminator is kept apart so `\r\n` files come back with `\r\n`. */
const LINE_BREAK = /\r\n|\r|\n/;

/** The text's lines without terminators, plus the first terminator used (`\n` if none). */
export function splitLines(text: string): { lines: string[]; eol: string; finalEol: boolean } {
  const eol = LINE_BREAK.exec(text)?.[0] ?? '\n';
  const lines = text.split(LINE_BREAK);
  // A trailing terminator ends the last line; it doesn't start an empty one.
  const finalEol = lines.length > 1 && lines[lines.length - 1] === '';
  if (finalEol) lines.pop();
  return { lines, eol, finalEol };
}

/** Applies `transform` to each line, keeping the line structure (and the final newline). */
export function mapLines(text: string, transform: (line: string) => string): string {
  const { lines, eol, finalEol } = splitLines(text);
  return lines.map(transform).join(eol) + (finalEol ? eol : '');
}

export const LINE_ORDERS = ['keep', 'sort', 'reverse', 'shuffle'] as const;
export type LineOrder = (typeof LINE_ORDERS)[number];

export const SORT_METHODS = ['natural', 'locale', 'codepoint'] as const;
/** `natural` puts "file2" before "file10"; `codepoint` is byte order, like `LC_ALL=C sort`. */
export type SortMethod = (typeof SORT_METHODS)[number];

export type LineOptions = {
  trim: boolean;
  removeBlank: boolean;
  dedupe: boolean;
  /** Applies to both dedupe and sort. */
  ignoreCase: boolean;
  order: LineOrder;
  sortMethod: SortMethod;
  descending: boolean;
  prefix: string;
  suffix: string;
};

export const DEFAULT_LINE_OPTIONS: LineOptions = {
  trim: false,
  removeBlank: false,
  dedupe: false,
  ignoreCase: false,
  order: 'keep',
  sortMethod: 'natural',
  descending: false,
  prefix: '',
  suffix: '',
};

export function isLineOptions(value: unknown): value is LineOptions {
  const options = value as LineOptions | null;
  return (
    typeof options === 'object' &&
    options !== null &&
    typeof options.trim === 'boolean' &&
    typeof options.removeBlank === 'boolean' &&
    typeof options.dedupe === 'boolean' &&
    typeof options.ignoreCase === 'boolean' &&
    LINE_ORDERS.includes(options.order) &&
    SORT_METHODS.includes(options.sortMethod) &&
    typeof options.descending === 'boolean' &&
    typeof options.prefix === 'string' &&
    typeof options.suffix === 'string'
  );
}

export type LineResult = {
  text: string;
  inputLines: number;
  outputLines: number;
  blankRemoved: number;
  duplicatesRemoved: number;
};

function comparer(method: SortMethod, ignoreCase: boolean, locale: string) {
  if (method === 'codepoint') {
    const key = ignoreCase ? (line: string) => line.toLowerCase() : (line: string) => line;
    return (a: string, b: string) => {
      const x = key(a);
      const y = key(b);
      return x < y ? -1 : x > y ? 1 : 0;
    };
  }
  const collator = new Intl.Collator(locale, {
    numeric: method === 'natural',
    sensitivity: ignoreCase ? 'accent' : 'variant',
  });
  return collator.compare;
}

/**
 * Line tools as one pipeline, in a fixed order: trim → remove blank → dedupe (first occurrence
 * wins) → sort / reverse / shuffle → prefix and suffix. `random` is only used to shuffle.
 */
export function processLines(
  text: string,
  options: LineOptions,
  locale: string,
  random: Random
): LineResult {
  if (text === '') {
    return { text: '', inputLines: 0, outputLines: 0, blankRemoved: 0, duplicatesRemoved: 0 };
  }
  const { lines: input, eol, finalEol } = splitLines(text);
  let lines = options.trim ? input.map((line) => line.trim()) : input;

  let blankRemoved = 0;
  if (options.removeBlank) {
    const kept = lines.filter((line) => line.trim() !== '');
    blankRemoved = lines.length - kept.length;
    lines = kept;
  }

  let duplicatesRemoved = 0;
  if (options.dedupe) {
    const seen = new Set<string>();
    const kept = lines.filter((line) => {
      const key = options.ignoreCase ? line.toLowerCase() : line;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    duplicatesRemoved = lines.length - kept.length;
    lines = kept;
  }

  if (options.order === 'sort') {
    const compare = comparer(options.sortMethod, options.ignoreCase, locale);
    // Array#sort is stable, so equal lines keep their relative order in both directions.
    lines = [...lines].sort(options.descending ? (a, b) => compare(b, a) : compare);
  } else if (options.order === 'reverse') {
    lines = [...lines].reverse();
  } else if (options.order === 'shuffle') {
    lines = [...lines];
    for (let i = lines.length - 1; i > 0; i--) {
      const j = random.int(i + 1);
      [lines[i], lines[j]] = [lines[j], lines[i]];
    }
  }

  if (options.prefix || options.suffix) {
    lines = lines.map((line) => options.prefix + line + options.suffix);
  }

  return {
    text: lines.join(eol) + (finalEol && lines.length > 0 ? eol : ''),
    inputLines: input.length,
    outputLines: lines.length,
    blankRemoved,
    duplicatesRemoved,
  };
}
