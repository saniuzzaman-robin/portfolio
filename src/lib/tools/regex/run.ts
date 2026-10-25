import { compileRegex, withFlags } from './flags';

export type RegexMode = 'match' | 'replace' | 'split';

export type RegexRequest = {
  pattern: string;
  flags: string;
  text: string;
  mode: RegexMode;
  replacement: string;
  /** Most matches (and split pieces) to collect. */
  limit: number;
};

/** `[start, end)` offsets into the text; null for a group that didn't take part in the match. */
export type Span = readonly [start: number, end: number];

export type RegexMatch = {
  start: number;
  end: number;
  /** Capture groups 1…n, in pattern order. */
  groups: (Span | null)[];
};

export type RegexResult =
  | {
      ok: true;
      matches: RegexMatch[];
      /** More matches exist than `limit`. */
      truncated: boolean;
      /** The replaced text (replace mode). */
      output: string | null;
      /** `String.prototype.split` pieces; null for a group that didn't take part (split mode). */
      pieces: (string | null)[] | null;
      elapsedMs: number;
    }
  | { ok: false; error: string };

/** Index after an empty match, stepping over a whole surrogate pair in Unicode mode. */
function advance(text: string, index: number, unicode: boolean): number {
  if (!unicode || index + 1 >= text.length) return index + 1;
  const code = text.charCodeAt(index);
  const next = text.charCodeAt(index + 1);
  const pair = code >= 0xd800 && code <= 0xdbff && next >= 0xdc00 && next <= 0xdfff;
  return index + (pair ? 2 : 1);
}

/**
 * Lists matches with group offsets (via the `d` flag). Without `g` only the first match counts,
 * like `exec`; `y` keeps each match anchored where the previous one ended, like `matchAll`.
 */
export function findMatches(
  regex: RegExp,
  text: string,
  limit: number
): { matches: RegexMatch[]; truncated: boolean } {
  const global = regex.global;
  const scanner = new RegExp(regex.source, withFlags(regex.flags, 'dg'));
  const unicode = scanner.unicode || scanner.unicodeSets;
  const matches: RegexMatch[] = [];
  let truncated = false;
  let match: RegExpExecArray | null;
  while ((match = scanner.exec(text)) !== null) {
    if (matches.length === limit) {
      truncated = true;
      break;
    }
    const indices = match.indices ?? [];
    const groups: (Span | null)[] = [];
    for (let i = 1; i < match.length; i++) groups.push(indices[i] ?? null);
    matches.push({ start: match.index, end: match.index + match[0].length, groups });
    if (!global) break;
    if (match[0] === '') scanner.lastIndex = advance(text, scanner.lastIndex, unicode);
  }
  return { matches, truncated };
}

/** Runs one request. Synchronous and unbounded: call it off the main thread (see the worker). */
export function runRegex(request: RegexRequest): RegexResult {
  const compiled = compileRegex(request.pattern, request.flags);
  if (!compiled.ok) return compiled;
  const { regex } = compiled;
  const started = performance.now();
  const { matches, truncated } = findMatches(regex, request.text, request.limit);
  let output: string | null = null;
  let pieces: (string | null)[] | null = null;
  if (request.mode === 'replace') output = request.text.replace(regex, request.replacement);
  if (request.mode === 'split') {
    // Groups that didn't take part come back as undefined, which the DOM typings leave out.
    const split = request.text.split(regex, request.limit) as (string | undefined)[];
    pieces = split.map((piece) => piece ?? null);
  }
  return { ok: true, matches, truncated, output, pieces, elapsedMs: performance.now() - started };
}
