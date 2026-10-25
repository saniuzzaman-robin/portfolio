/**
 * Splits a JavaScript pattern into tokens for the explanation panel. It is deliberately lenient:
 * the browser's engine decides what is valid (see `compileRegex`), while this only has to
 * describe each piece the way the engine reads it, including Annex B quirks without `u`/`v`.
 */

export type Quantifier = { min: number; max: number | null; lazy: boolean };

export type ClassEscape = 'digit' | 'notDigit' | 'word' | 'notWord' | 'space' | 'notSpace';
export type Assertion =
  'lineStart' | 'inputStart' | 'lineEnd' | 'inputEnd' | 'wordBoundary' | 'notWordBoundary';
export type GroupKind =
  | 'capture'
  | 'nonCapture'
  | 'lookahead'
  | 'negativeLookahead'
  | 'lookbehind'
  | 'negativeLookbehind'
  | 'modifiers';
export type CharName =
  'lineFeed' | 'carriageReturn' | 'tab' | 'verticalTab' | 'formFeed' | 'nul' | 'backspace';

export type RegexNode =
  /** Plain text outside a class (consecutive characters are merged). */
  | { kind: 'literal'; text: string }
  /** Plain characters listed inside a class. */
  | { kind: 'members'; text: string }
  | { kind: 'any'; dotAll: boolean }
  | { kind: 'classEscape'; escape: ClassEscape }
  /** A character written as an escape (`\n`, `\x41`, `\u{1F600}`, `\cJ`…). */
  | { kind: 'char'; code: number; name: CharName | null }
  | { kind: 'property'; negated: boolean; name: string; value: string | null }
  | { kind: 'assertion'; assertion: Assertion }
  | { kind: 'backreference'; ref: string }
  | { kind: 'class'; negated: boolean }
  | { kind: 'range'; first: number; last: number }
  | { kind: 'setOperation'; operation: 'intersection' | 'subtraction' }
  | { kind: 'strings'; items: string[] }
  | {
      kind: 'group';
      group: GroupKind;
      index: number | null;
      name: string | null;
      /** Flags turned on / off by a modifiers group `(?i-m:…)`. */
      enable: string;
      disable: string;
    }
  | { kind: 'alternation' }
  /** Something the engine will reject (e.g. a quantifier with nothing to repeat). */
  | { kind: 'invalid'; text: string };

export type RegexToken = RegexNode & {
  /** Offsets into the pattern, including any quantifier and, for groups, the closing `)`. */
  from: number;
  to: number;
  /** Nesting level, for indenting group and class contents. */
  depth: number;
  /** Source to show: the token itself, or the opener + `…)` for a group. */
  label: string;
  quantifier: Quantifier | null;
};

export type CaptureGroup = { index: number; name: string | null };

export type RegexExplanation = { tokens: RegexToken[]; groups: CaptureGroup[] };

const CLASS_ESCAPES: Record<string, ClassEscape> = {
  d: 'digit',
  D: 'notDigit',
  w: 'word',
  W: 'notWord',
  s: 'space',
  S: 'notSpace',
};

const CONTROL_ESCAPES: Record<string, number> = { n: 0x0a, r: 0x0d, t: 0x09, v: 0x0b, f: 0x0c };

const CHAR_NAMES: Partial<Record<number, CharName>> = {
  0x0a: 'lineFeed',
  0x0d: 'carriageReturn',
  0x09: 'tab',
  0x0b: 'verticalTab',
  0x0c: 'formFeed',
  0x00: 'nul',
};

const HEX2 = /^[0-9a-fA-F]{2}/;
const HEX4 = /^[0-9a-fA-F]{4}/;
const OCTAL = /^[0-7]{1,3}/;

function charNode(code: number, name: CharName | null = CHAR_NAMES[code] ?? null): RegexNode {
  return { kind: 'char', code, name };
}

/** Capture groups and whether any is named, without parsing (needed before `\1` is read). */
function scanGroups(pattern: string): { count: number; named: boolean } {
  let count = 0;
  let named = false;
  let classDepth = 0;
  for (let i = 0; i < pattern.length; i++) {
    const ch = pattern[i];
    if (ch === '\\') i++;
    else if (ch === '[') classDepth++;
    else if (ch === ']' && classDepth > 0) classDepth--;
    else if (ch === '(' && classDepth === 0 && pattern[i + 1] !== '?') count++;
    else if (ch === '(' && classDepth === 0 && /^\(\?<[^=!]/.test(pattern.slice(i, i + 4))) {
      count++;
      named = true;
    }
  }
  return { count, named };
}

/** Reads `*`, `+`, `?`, `{n}`, `{n,}` or `{n,m}` (plus a lazy `?`) at `at`. */
function readQuantifier(
  pattern: string,
  at: number
): { quantifier: Quantifier; end: number } | null {
  const ch = pattern[at];
  let min: number;
  let max: number | null;
  let end = at + 1;
  if (ch === '*') [min, max] = [0, null];
  else if (ch === '+') [min, max] = [1, null];
  else if (ch === '?') [min, max] = [0, 1];
  else if (ch === '{') {
    const match = /^\{(\d+)(?:(,)(\d*))?\}/.exec(pattern.slice(at));
    if (!match) return null;
    min = Number(match[1]);
    max = match[2] ? (match[3] ? Number(match[3]) : null) : min;
    end = at + match[0].length;
  } else return null;
  const lazy = pattern[end] === '?';
  return { quantifier: { min, max, lazy }, end: lazy ? end + 1 : end };
}

type Escape = {
  node: RegexNode;
  end: number;
  /** The single character it stands for, when it is one (usable as a range end). */
  code: number | null;
};

type GroupHeader = {
  group: GroupKind;
  length: number;
  name?: string;
  enable?: string;
  disable?: string;
};

function readGroupHeader(rest: string): GroupHeader {
  if (rest.startsWith('(?:')) return { group: 'nonCapture', length: 3 };
  if (rest.startsWith('(?=')) return { group: 'lookahead', length: 3 };
  if (rest.startsWith('(?!')) return { group: 'negativeLookahead', length: 3 };
  if (rest.startsWith('(?<=')) return { group: 'lookbehind', length: 4 };
  if (rest.startsWith('(?<!')) return { group: 'negativeLookbehind', length: 4 };
  const named = /^\(\?<([^>]*)>/.exec(rest);
  if (named) return { group: 'capture', length: named[0].length, name: named[1] };
  const modifiers = /^\(\?([a-z]*)(?:-([a-z]*))?:/.exec(rest);
  if (modifiers) {
    return {
      group: 'modifiers',
      length: modifiers[0].length,
      enable: modifiers[1],
      disable: modifiers[2] ?? '',
    };
  }
  // A malformed `(?…`: the engine rejects it; keep it as a group so the nesting stays balanced.
  if (rest.startsWith('(?')) return { group: 'nonCapture', length: 2 };
  return { group: 'capture', length: 1 };
}

export function explainRegex(pattern: string, flags: string): RegexExplanation {
  const unicode = flags.includes('u') || flags.includes('v');
  const sets = flags.includes('v');
  const multiline = flags.includes('m');
  const dotAll = flags.includes('s');
  const scanned = scanGroups(pattern);
  const tokens: RegexToken[] = [];
  const groups: CaptureGroup[] = [];
  const open: number[] = [];
  let groupIndex = 0;

  const push = (node: RegexNode, from: number, to: number, depth: number): number => {
    tokens.push({ ...node, from, to, depth, label: pattern.slice(from, to), quantifier: null });
    return tokens.length - 1;
  };

  const codeAt = (at: number): { code: number; end: number } => {
    const code = pattern.codePointAt(at) ?? 0;
    return { code, end: at + (code > 0xffff ? 2 : 1) };
  };

  const readEscape = (at: number, inClass: boolean): Escape => {
    const next = pattern[at + 1];
    const rest = pattern.slice(at + 2);
    const plain = inClass ? 'members' : 'literal';
    if (next === undefined)
      return { node: { kind: 'invalid', text: '\\' }, end: at + 1, code: null };
    const escape = CLASS_ESCAPES[next];
    if (escape) return { node: { kind: 'classEscape', escape }, end: at + 2, code: null };
    if (next in CONTROL_ESCAPES) {
      const code = CONTROL_ESCAPES[next];
      return { node: charNode(code), end: at + 2, code };
    }
    if (next === 'b' || next === 'B') {
      if (inClass && next === 'b') return { node: charNode(8, 'backspace'), end: at + 2, code: 8 };
      if (!inClass) {
        const assertion = next === 'b' ? 'wordBoundary' : 'notWordBoundary';
        return { node: { kind: 'assertion', assertion }, end: at + 2, code: null };
      }
    }
    if (next === 'c' && /^[a-zA-Z]/.test(rest)) {
      const code = rest.charCodeAt(0) % 32;
      return { node: charNode(code), end: at + 3, code };
    }
    if (next === 'x' && HEX2.test(rest)) {
      const code = parseInt(rest.slice(0, 2), 16);
      return { node: charNode(code), end: at + 4, code };
    }
    if (next === 'u') {
      const braced = unicode ? /^\{([0-9a-fA-F]+)\}/.exec(rest) : null;
      if (braced) {
        const code = parseInt(braced[1], 16);
        return { node: charNode(code), end: at + 2 + braced[0].length, code };
      }
      if (HEX4.test(rest)) {
        let code = parseInt(rest.slice(0, 4), 16);
        let end = at + 6;
        // In Unicode mode an escaped surrogate pair is one character.
        const low = /^\\u([dD][c-fC-F][0-9a-fA-F]{2})/.exec(pattern.slice(end));
        if (unicode && code >= 0xd800 && code <= 0xdbff && low) {
          code = 0x10000 + ((code - 0xd800) << 10) + (parseInt(low[1], 16) - 0xdc00);
          end += 6;
        }
        return { node: charNode(code), end, code };
      }
    }
    if ((next === 'p' || next === 'P') && unicode) {
      const braced = /^\{([^}]*)\}/.exec(rest);
      if (braced) {
        const [name, value] = braced[1].split('=');
        return {
          node: { kind: 'property', negated: next === 'P', name, value: value ?? null },
          end: at + 2 + braced[0].length,
          code: null,
        };
      }
    }
    if (next === 'q' && sets && inClass) {
      const braced = /^\{([^}]*)\}/.exec(rest);
      if (braced) {
        return {
          node: { kind: 'strings', items: braced[1].split('|') },
          end: at + 2 + braced[0].length,
          code: null,
        };
      }
    }
    if (next === 'k' && !inClass && (unicode || scanned.named)) {
      const named = /^<([^>]*)>/.exec(rest);
      if (named) {
        return {
          node: { kind: 'backreference', ref: named[1] },
          end: at + 2 + named[0].length,
          code: null,
        };
      }
    }
    if (next === '0' && !/^[0-9]/.test(rest)) return { node: charNode(0), end: at + 2, code: 0 };
    if (/[0-9]/.test(next)) {
      const digits = /^[0-9]+/.exec(pattern.slice(at + 1))?.[0] ?? next;
      if (!inClass && next !== '0' && (unicode || Number(digits) <= scanned.count)) {
        return {
          node: { kind: 'backreference', ref: digits },
          end: at + 1 + digits.length,
          code: null,
        };
      }
      // Annex B: without `u`, an out-of-range `\12` is a legacy octal escape, and `\8` is "8".
      const octal = OCTAL.exec(pattern.slice(at + 1))?.[0];
      if (!unicode && octal) {
        let text = octal;
        while (parseInt(text, 8) > 0o377) text = text.slice(0, -1);
        const code = parseInt(text, 8);
        return { node: charNode(code), end: at + 1 + text.length, code };
      }
    }
    // Identity escape: `\.` is a literal dot.
    const { code, end } = codeAt(at + 1);
    return { node: { kind: plain, text: String.fromCodePoint(code) }, end, code };
  };

  const readClassAtom = (at: number): Escape => {
    if (pattern[at] === '\\') return readEscape(at, true);
    const { code, end } = codeAt(at);
    return { node: { kind: 'members', text: String.fromCodePoint(code) }, end, code };
  };

  const readClass = (at: number, depth: number): number => {
    const negated = pattern[at + 1] === '^';
    const index = push({ kind: 'class', negated }, at, at, depth);
    let i = at + (negated ? 2 : 1);
    while (i < pattern.length && pattern[i] !== ']') {
      if (sets && pattern[i] === '[') {
        i = readClass(i, depth + 1);
        continue;
      }
      if (sets && (pattern.startsWith('&&', i) || pattern.startsWith('--', i))) {
        const operation = pattern[i] === '&' ? 'intersection' : 'subtraction';
        push({ kind: 'setOperation', operation }, i, i + 2, depth + 1);
        i += 2;
        continue;
      }
      const start = readClassAtom(i);
      const dash = start.end;
      const isRange =
        start.code !== null &&
        pattern[dash] === '-' &&
        dash + 1 < pattern.length &&
        pattern[dash + 1] !== ']' &&
        !(sets && pattern[dash + 1] === '-');
      if (isRange) {
        const end = readClassAtom(dash + 1);
        if (end.code !== null && start.code !== null) {
          push({ kind: 'range', first: start.code, last: end.code }, i, end.end, depth + 1);
          i = end.end;
          continue;
        }
      }
      push(start.node, i, start.end, depth + 1);
      i = start.end;
    }
    const end = Math.min(i + 1, pattern.length);
    tokens[index].to = end;
    tokens[index].label = pattern.slice(at, end);
    return end;
  };

  /** Token a following quantifier applies to; -1 when there is none. */
  let lastAtom = -1;
  let i = 0;
  while (i < pattern.length) {
    const ch = pattern[i];
    const depth = open.length;
    if (ch === '\\') {
      const escape = readEscape(i, false);
      lastAtom = push(escape.node, i, escape.end, depth);
      i = escape.end;
    } else if (ch === '[') {
      lastAtom = tokens.length;
      i = readClass(i, depth);
    } else if (ch === '(') {
      const header = readGroupHeader(pattern.slice(i));
      const index = header.group === 'capture' ? ++groupIndex : null;
      const name = header.name ?? null;
      if (index !== null) groups.push({ index, name });
      const token = push(
        {
          kind: 'group',
          group: header.group,
          index,
          name,
          enable: header.enable ?? '',
          disable: header.disable ?? '',
        },
        i,
        pattern.length,
        depth
      );
      tokens[token].label = `${pattern.slice(i, i + header.length)}…`;
      open.push(token);
      lastAtom = -1;
      i += header.length;
    } else if (ch === ')') {
      const token = open.pop();
      if (token === undefined) {
        push({ kind: 'invalid', text: ')' }, i, i + 1, depth);
        lastAtom = -1;
      } else {
        tokens[token].to = i + 1;
        tokens[token].label += ')';
        lastAtom = token;
      }
      i++;
    } else if (ch === '|') {
      push({ kind: 'alternation' }, i, i + 1, depth);
      lastAtom = -1;
      i++;
    } else if (ch === '^' || ch === '$') {
      const assertion =
        ch === '^' ? (multiline ? 'lineStart' : 'inputStart') : multiline ? 'lineEnd' : 'inputEnd';
      lastAtom = push({ kind: 'assertion', assertion }, i, i + 1, depth);
      i++;
    } else if (ch === '.') {
      lastAtom = push({ kind: 'any', dotAll }, i, i + 1, depth);
      i++;
    } else {
      const read = readQuantifier(pattern, i);
      if (read && lastAtom >= 0) {
        const atom = tokens[lastAtom];
        atom.quantifier = read.quantifier;
        atom.label += pattern.slice(atom.to, read.end);
        atom.to = read.end;
        lastAtom = -1;
        i = read.end;
      } else if (read && ch !== '{') {
        push({ kind: 'invalid', text: pattern.slice(i, read.end) }, i, read.end, depth);
        i = read.end;
      } else {
        // A `{` that isn't a quantifier is a literal without `u`/`v` (Annex B).
        const { code, end } = codeAt(i);
        lastAtom = push({ kind: 'literal', text: String.fromCodePoint(code) }, i, end, depth);
        i = end;
      }
    }
  }

  return { tokens: mergeText(tokens), groups };
}

/** Joins runs of plain characters ("a", "b", "c" → "abc") that no quantifier splits. */
function mergeText(tokens: RegexToken[]): RegexToken[] {
  const merged: RegexToken[] = [];
  for (const token of tokens) {
    const previous = merged[merged.length - 1];
    if (
      previous &&
      (token.kind === 'literal' || token.kind === 'members') &&
      previous.kind === token.kind &&
      previous.depth === token.depth &&
      previous.to === token.from &&
      !previous.quantifier &&
      !token.quantifier
    ) {
      merged[merged.length - 1] = {
        ...previous,
        text: previous.text + token.text,
        to: token.to,
        label: previous.label + token.label,
      };
    } else merged.push(token);
  }
  return merged;
}
