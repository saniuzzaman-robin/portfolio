import type { JsonNode } from './parse';

/** One step from a parent to a child: an object key or an array index. */
export type PathSegment = string | number;

const SHORTHAND = /^[A-Za-z_$][A-Za-z0-9_$]*$/;

function quoteName(name: string): string {
  const escaped = name.replace(/[\\'\u0000-\u001f]/g, (char) => {
    if (char === '\\' || char === "'") return `\\${char}`;
    const named: Record<string, string> = { '\b': 'b', '\f': 'f', '\n': 'n', '\r': 'r', '\t': 't' };
    return char in named
      ? `\\${named[char]}`
      : `\\u${char.charCodeAt(0).toString(16).padStart(4, '0')}`;
  });
  return `['${escaped}']`;
}

/** JSONPath for a node: `$.users[0].name`, or `$['first name']` when a key isn't an identifier. */
export function formatPath(segments: readonly PathSegment[]): string {
  let path = '$';
  for (const segment of segments) {
    if (typeof segment === 'number') path += `[${segment}]`;
    else path += SHORTHAND.test(segment) ? `.${segment}` : quoteName(segment);
  }
  return path;
}

type Selector =
  | { kind: 'name'; name: string }
  | { kind: 'wildcard' }
  | { kind: 'index'; index: number }
  | { kind: 'slice'; start?: number; end?: number; step?: number };

type Segment = { descendant: boolean; selectors: Selector[] };

export type PathError = { message: string; offset: number };
export type CompiledPath = { ok: true; segments: Segment[] } | { ok: false; error: PathError };

class PathSyntaxError extends Error {
  constructor(
    readonly offset: number,
    message: string
  ) {
    super(message);
  }
}

const NAME = /[\p{L}_$][\p{L}\p{N}_$]*/uy;
const INTEGER = /-?\d+/y;
const STRING_ESCAPES: Record<string, string> = {
  b: '\b',
  f: '\f',
  n: '\n',
  r: '\r',
  t: '\t',
  '/': '/',
  '\\': '\\',
  "'": "'",
  '"': '"',
};

/**
 * Compiles the common subset of JSONPath (RFC 9535) without filters: `$`, `.name`, `['name']`,
 * `[0]`, `[-1]`, `[*]`, `.*`, `..name` (recursive descent), slices `[start:end:step]` and
 * unions `[0,2,'a']`. The leading `$` may be left out.
 */
export function compilePath(source: string): CompiledPath {
  let pos = 0;
  const text = source.trim();
  const offset = source.indexOf(text);
  const segments: Segment[] = [];

  const fail = (message: string, at = pos): never => {
    throw new PathSyntaxError(at + offset, message);
  };

  const readInteger = (): number | undefined => {
    INTEGER.lastIndex = pos;
    const match = INTEGER.exec(text);
    if (!match) return undefined;
    pos += match[0].length;
    const value = Number(match[0]);
    if (!Number.isSafeInteger(value)) fail('Index is out of range', pos - match[0].length);
    return value;
  };

  const readName = (): string => {
    NAME.lastIndex = pos;
    const match = NAME.exec(text);
    if (!match)
      fail(text[pos] === undefined ? 'Expected a property name' : `Unexpected '${text[pos]}'`);
    pos += match![0].length;
    return match![0];
  };

  const readString = (): string => {
    const quote = text[pos];
    const start = pos;
    pos++;
    let value = '';
    while (pos < text.length && text[pos] !== quote) {
      if (text[pos] === '\\') {
        const escape = text[pos + 1];
        if (escape === 'u') {
          const hex = text.slice(pos + 2, pos + 6);
          if (!/^[0-9a-fA-F]{4}$/.test(hex)) fail('Invalid Unicode escape');
          value += String.fromCharCode(parseInt(hex, 16));
          pos += 6;
          continue;
        }
        if (escape === undefined || !(escape in STRING_ESCAPES)) fail('Invalid escape sequence');
        value += STRING_ESCAPES[escape];
        pos += 2;
        continue;
      }
      value += text[pos];
      pos++;
    }
    if (pos >= text.length) fail('Unterminated string', start);
    pos++;
    return value;
  };

  const skipSpaces = () => {
    while (text[pos] === ' ') pos++;
  };

  const readSelector = (): Selector => {
    skipSpaces();
    const char = text[pos];
    if (char === "'" || char === '"') return { kind: 'name', name: readString() };
    if (char === '*') {
      pos++;
      return { kind: 'wildcard' };
    }
    const start = readInteger();
    skipSpaces();
    if (text[pos] !== ':') {
      if (start === undefined) fail(char === undefined ? "Expected ']'" : `Unexpected '${char}'`);
      return { kind: 'index', index: start! };
    }
    pos++;
    skipSpaces();
    const end = readInteger();
    skipSpaces();
    let step: number | undefined;
    if (text[pos] === ':') {
      pos++;
      skipSpaces();
      step = readInteger();
    }
    return { kind: 'slice', start, end, step };
  };

  const readBracket = (): Selector[] => {
    pos++;
    const selectors = [readSelector()];
    skipSpaces();
    while (text[pos] === ',') {
      pos++;
      selectors.push(readSelector());
      skipSpaces();
    }
    if (text[pos] !== ']')
      fail(text[pos] === undefined ? "Expected ']'" : `Unexpected '${text[pos]}'`);
    pos++;
    return selectors;
  };

  try {
    if (text[pos] === '$') pos++;
    // Allow `a.b` as shorthand for `$.a.b`.
    else if (text[pos] !== '.' && text[pos] !== '[')
      segments.push({ descendant: false, selectors: [{ kind: 'name', name: readName() }] });
    while (pos < text.length) {
      if (text.startsWith('..', pos)) {
        pos += 2;
        if (text[pos] === '[') segments.push({ descendant: true, selectors: readBracket() });
        else if (text[pos] === '*') {
          pos++;
          segments.push({ descendant: true, selectors: [{ kind: 'wildcard' }] });
        } else segments.push({ descendant: true, selectors: [{ kind: 'name', name: readName() }] });
      } else if (text[pos] === '.') {
        pos++;
        if (text[pos] === '*') {
          pos++;
          segments.push({ descendant: false, selectors: [{ kind: 'wildcard' }] });
        } else
          segments.push({ descendant: false, selectors: [{ kind: 'name', name: readName() }] });
      } else if (text[pos] === '[') {
        segments.push({ descendant: false, selectors: readBracket() });
      } else {
        fail(`Unexpected '${text[pos]}'`);
      }
    }
    return { ok: true, segments };
  } catch (error) {
    if (error instanceof PathSyntaxError) {
      return { ok: false, error: { message: error.message, offset: error.offset } };
    }
    throw error;
  }
}

export type PathMatch = { path: PathSegment[]; node: JsonNode };

type Located = { node: JsonNode; path: PathSegment[] };

/** Slice indices per RFC 9535 §2.3.4.2, including negative steps. */
function sliceIndices(length: number, selector: Extract<Selector, { kind: 'slice' }>): number[] {
  const step = selector.step ?? 1;
  if (step === 0) return [];
  const normalize = (index: number) => (index >= 0 ? index : length + index);
  const indices: number[] = [];
  if (step > 0) {
    const lower = Math.min(Math.max(normalize(selector.start ?? 0), 0), length);
    const upper = Math.min(Math.max(normalize(selector.end ?? length), 0), length);
    for (let i = lower; i < upper; i += step) indices.push(i);
  } else {
    const upper = Math.min(Math.max(normalize(selector.start ?? length - 1), -1), length - 1);
    const lower = Math.min(Math.max(normalize(selector.end ?? -length - 1), -1), length - 1);
    for (let i = upper; lower < i; i += step) indices.push(i);
  }
  return indices;
}

function select(target: Located, selector: Selector, out: Located[]) {
  const { node, path } = target;
  if (node.type === 'object') {
    if (selector.kind === 'wildcard') {
      for (const entry of node.entries) out.push({ node: entry.value, path: [...path, entry.key] });
    } else if (selector.kind === 'name') {
      // With duplicate keys the last one wins, as in JSON.parse.
      const entry = node.entries.findLast((candidate) => candidate.key === selector.name);
      if (entry) out.push({ node: entry.value, path: [...path, entry.key] });
    }
  } else if (node.type === 'array') {
    const { items } = node;
    let indices: number[] = [];
    if (selector.kind === 'wildcard') indices = items.map((_, index) => index);
    else if (selector.kind === 'index') {
      const index = selector.index >= 0 ? selector.index : items.length + selector.index;
      if (index >= 0 && index < items.length) indices = [index];
    } else if (selector.kind === 'slice') indices = sliceIndices(items.length, selector);
    for (const index of indices) out.push({ node: items[index], path: [...path, index] });
  }
}

/** The node and all of its descendants in document order. */
function descendants(target: Located): Located[] {
  const all: Located[] = [];
  const stack = [target];
  while (stack.length > 0) {
    const current = stack.pop()!;
    all.push(current);
    const children: Located[] = [];
    if (current.node.type === 'object') {
      for (const entry of current.node.entries)
        children.push({ node: entry.value, path: [...current.path, entry.key] });
    } else if (current.node.type === 'array') {
      current.node.items.forEach((item, index) =>
        children.push({ node: item, path: [...current.path, index] })
      );
    }
    for (let i = children.length - 1; i >= 0; i--) stack.push(children[i]);
  }
  return all;
}

/** Runs a compiled path; stops after `limit` matches and reports whether it did. */
export function queryPath(
  root: JsonNode,
  segments: Segment[],
  limit = 10_000
): { matches: PathMatch[]; truncated: boolean } {
  let current: Located[] = [{ node: root, path: [] }];
  let truncated = false;
  for (const segment of segments) {
    const next: Located[] = [];
    const targets = segment.descendant ? current.flatMap(descendants) : current;
    for (const target of targets) {
      for (const selector of segment.selectors) select(target, selector, next);
      if (next.length > limit) {
        truncated = true;
        break;
      }
    }
    current = next;
  }
  return { matches: current.slice(0, limit), truncated: truncated || current.length > limit };
}
