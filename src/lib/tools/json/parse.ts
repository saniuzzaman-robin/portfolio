/**
 * Lossless JSON parser: builds a syntax tree that keeps every number's original lexeme (so big
 * integers and `1.10` survive a round trip), records source offsets for each node, reports the
 * exact position of the first error and warns about duplicate keys.
 *
 * Lenient mode also accepts comments, trailing commas, single-quoted strings and unquoted keys;
 * serializing a lenient parse produces strict JSON, which is how "Repair" works.
 */

type Span = { from: number; to: number };

export type JsonObject = Span & { type: 'object'; entries: JsonEntry[] };
export type JsonArray = Span & { type: 'array'; items: JsonNode[] };
export type JsonString = Span & { type: 'string'; value: string };
/** `raw` is the number exactly as written; it is never converted to a float. */
export type JsonNumber = Span & { type: 'number'; raw: string };
export type JsonBoolean = Span & { type: 'boolean'; value: boolean };
export type JsonNull = Span & { type: 'null' };
export type JsonNode = JsonObject | JsonArray | JsonString | JsonNumber | JsonBoolean | JsonNull;

export type JsonEntry = { key: string; keyFrom: number; keyTo: number; value: JsonNode };

/** A problem in the source text, as a UTF-16 offset range (what editors use). */
export type JsonIssue = { message: string; from: number; to: number };

export type ParseResult =
  | { ok: true; value: JsonNode; warnings: JsonIssue[] }
  | { ok: false; error: JsonIssue; warnings: JsonIssue[] };

export type ParseOptions = { lenient?: boolean };

/** Deep enough for any real document, shallow enough that recursion can't overflow the stack. */
export const MAX_DEPTH = 2048;
/** Duplicate-key warnings stop being useful (and cost memory) long before this. */
const MAX_WARNINGS = 500;

class JsonSyntaxError extends Error {
  constructor(readonly issue: JsonIssue) {
    super(issue.message);
  }
}

const IDENTIFIER = /[\p{ID_Start}$_][\p{ID_Continue}$‌‍]*/uy;
const WORD = /[\p{ID_Continue}$]+/uy;

const ESCAPES: Record<string, string> = {
  '"': '"',
  '\\': '\\',
  '/': '/',
  b: '\b',
  f: '\f',
  n: '\n',
  r: '\r',
  t: '\t',
};

const isDigit = (code: number) => code >= 48 && code <= 57;
const isHex = (char: string) => /^[0-9a-fA-F]$/.test(char);

export function parseJson(text: string, options: ParseOptions = {}): ParseResult {
  const lenient = options.lenient ?? false;
  const length = text.length;
  const warnings: JsonIssue[] = [];
  // A byte-order mark is common in files saved on Windows; it isn't part of the document.
  let pos = text.charCodeAt(0) === 0xfeff ? 1 : 0;

  const fail = (message: string, from: number, to = from + 1): never => {
    throw new JsonSyntaxError({ message, from, to: Math.min(Math.max(from, to), length) });
  };

  /** "end of input", "'x'" or "U+00A0" for invisible characters. */
  const describe = (at: number): string => {
    if (at >= length) return 'end of input';
    const char = String.fromCodePoint(text.codePointAt(at) ?? 0);
    return /^[\p{L}\p{N}\p{P}\p{S}]$/u.test(char)
      ? `'${char}'`
      : `U+${char.codePointAt(0)!.toString(16).toUpperCase().padStart(4, '0')}`;
  };

  const wordAt = (at: number): string => {
    WORD.lastIndex = at;
    return WORD.exec(text)?.[0] ?? '';
  };

  /** Fails on the token at `at`, covering a whole word (`undefined`, `NaN`) when there is one. */
  const unexpected = (at: number, expected?: string): never => {
    const word = wordAt(at);
    const found = word.length > 1 ? `token '${word}'` : describe(at);
    const end = at + Math.max(1, word.length);
    if (at >= length)
      fail(`Unexpected end of input${expected ? `; expected ${expected}` : ''}`, at);
    return fail(
      expected ? `Expected ${expected} but found ${found}` : `Unexpected ${found}`,
      at,
      end
    );
  };

  const skip = () => {
    while (pos < length) {
      const code = text.charCodeAt(pos);
      if (code === 32 || code === 9 || code === 10 || code === 13) {
        pos++;
        continue;
      }
      if (code !== 47 /* / */) return;
      const next = text.charCodeAt(pos + 1);
      const start = pos;
      if (next === 47) {
        while (pos < length && text[pos] !== '\n' && text[pos] !== '\r') pos++;
      } else if (next === 42 /* * */) {
        const close = text.indexOf('*/', pos + 2);
        if (close === -1) fail('Unterminated comment', start, start + 2);
        pos = close + 2;
      } else {
        return;
      }
      if (!lenient) fail('Comments are not allowed in JSON', start, pos);
    }
  };

  const parseString = (): JsonString => {
    const start = pos;
    const quote = text.charCodeAt(pos);
    pos++;
    let value = '';
    let chunk = pos;
    for (;;) {
      if (pos >= length) {
        const lineEnd = text.slice(start).search(/[\r\n]/);
        fail('Unterminated string', start, lineEnd === -1 ? length : start + lineEnd);
      }
      const code = text.charCodeAt(pos);
      if (code === quote) {
        value += text.slice(chunk, pos);
        pos++;
        return { type: 'string', value, from: start, to: pos };
      }
      if (code === 92 /* \ */) {
        value += text.slice(chunk, pos);
        const escape = text[pos + 1];
        if (escape === undefined) fail('Unterminated string', start, pos + 1);
        if (escape === 'u') {
          const hex = text.slice(pos + 2, pos + 6);
          if (hex.length < 4 || ![...hex].every(isHex)) {
            fail('Invalid Unicode escape: expected \\u followed by 4 hex digits', pos, pos + 6);
          }
          value += String.fromCharCode(parseInt(hex, 16));
          pos += 6;
        } else if (escape in ESCAPES) {
          value += ESCAPES[escape];
          pos += 2;
        } else if (lenient && escape === "'") {
          value += "'";
          pos += 2;
        } else {
          fail(`Invalid escape sequence '\\${escape}'`, pos, pos + 2);
        }
        chunk = pos;
        continue;
      }
      if (code === 10 || code === 13) {
        fail('Unterminated string (line breaks inside strings must be written as \\n)', start, pos);
      }
      if (code < 32) {
        fail(`Control character ${describe(pos)} must be escaped inside strings`, pos);
      }
      pos++;
    }
  };

  const parseNumber = (): JsonNumber => {
    const start = pos;
    if (text.charCodeAt(pos) === 45 /* - */) pos++;
    const first = text.charCodeAt(pos);
    if (first === 48 /* 0 */) {
      pos++;
      if (isDigit(text.charCodeAt(pos))) fail('Numbers cannot have leading zeros', start, pos + 1);
    } else if (isDigit(first)) {
      while (isDigit(text.charCodeAt(pos))) pos++;
    } else {
      unexpected(pos, 'a digit');
    }
    if (text.charCodeAt(pos) === 46 /* . */) {
      pos++;
      if (!isDigit(text.charCodeAt(pos))) unexpected(pos, 'a digit after the decimal point');
      while (isDigit(text.charCodeAt(pos))) pos++;
    }
    const exponent = text.charCodeAt(pos);
    if (exponent === 101 || exponent === 69 /* e E */) {
      pos++;
      const sign = text.charCodeAt(pos);
      if (sign === 43 || sign === 45) pos++;
      if (!isDigit(text.charCodeAt(pos))) unexpected(pos, 'a digit in the exponent');
      while (isDigit(text.charCodeAt(pos))) pos++;
    }
    return { type: 'number', raw: text.slice(start, pos), from: start, to: pos };
  };

  const parseKey = (): { key: string; from: number; to: number } => {
    const start = pos;
    const code = text.charCodeAt(pos);
    if (code === 34 /* " */) {
      const string = parseString();
      return { key: string.value, from: string.from, to: string.to };
    }
    if (code === 39 /* ' */) {
      if (!lenient) fail('Property names must use double quotes', start);
      const string = parseString();
      return { key: string.value, from: string.from, to: string.to };
    }
    IDENTIFIER.lastIndex = pos;
    const identifier = IDENTIFIER.exec(text)?.[0];
    if (identifier) {
      if (!lenient) {
        fail('Property names must be double-quoted strings', start, start + identifier.length);
      }
      pos += identifier.length;
      return { key: identifier, from: start, to: pos };
    }
    return unexpected(pos, "a property name or '}'");
  };

  const parseObject = (depth: number): JsonObject => {
    const start = pos;
    pos++;
    const entries: JsonEntry[] = [];
    const seen = new Set<string>();
    skip();
    if (text.charCodeAt(pos) === 125 /* } */) {
      pos++;
      return { type: 'object', entries, from: start, to: pos };
    }
    for (;;) {
      const key = parseKey();
      skip();
      if (text.charCodeAt(pos) !== 58 /* : */) unexpected(pos, "':' after the property name");
      pos++;
      skip();
      const value = parseValue(depth + 1);
      if (seen.has(key.key)) {
        if (warnings.length < MAX_WARNINGS) {
          warnings.push({ message: `Duplicate key "${key.key}"`, from: key.from, to: key.to });
        }
      } else {
        seen.add(key.key);
      }
      entries.push({ key: key.key, keyFrom: key.from, keyTo: key.to, value });
      skip();
      const next = text.charCodeAt(pos);
      if (next === 125) {
        pos++;
        return { type: 'object', entries, from: start, to: pos };
      }
      if (next !== 44 /* , */) unexpected(pos, "',' or '}' after the property value");
      const comma = pos;
      pos++;
      skip();
      if (text.charCodeAt(pos) === 125) {
        if (!lenient) fail('Trailing commas are not allowed in JSON', comma);
        pos++;
        return { type: 'object', entries, from: start, to: pos };
      }
    }
  };

  const parseArray = (depth: number): JsonArray => {
    const start = pos;
    pos++;
    const items: JsonNode[] = [];
    skip();
    if (text.charCodeAt(pos) === 93 /* ] */) {
      pos++;
      return { type: 'array', items, from: start, to: pos };
    }
    for (;;) {
      items.push(parseValue(depth + 1));
      skip();
      const next = text.charCodeAt(pos);
      if (next === 93) {
        pos++;
        return { type: 'array', items, from: start, to: pos };
      }
      if (next !== 44) unexpected(pos, "',' or ']' after the array item");
      const comma = pos;
      pos++;
      skip();
      if (text.charCodeAt(pos) === 93) {
        if (!lenient) fail('Trailing commas are not allowed in JSON', comma);
        pos++;
        return { type: 'array', items, from: start, to: pos };
      }
    }
  };

  const literal = (word: string): boolean => {
    if (!text.startsWith(word, pos) || wordAt(pos) !== word) return false;
    pos += word.length;
    return true;
  };

  const parseValue = (depth: number): JsonNode => {
    const start = pos;
    const code = text.charCodeAt(pos);
    if (code === 123 /* { */ || code === 91 /* [ */) {
      if (depth >= MAX_DEPTH) fail(`Nesting is deeper than ${MAX_DEPTH} levels`, start);
      return code === 123 ? parseObject(depth) : parseArray(depth);
    }
    if (code === 34) return parseString();
    if (code === 39) {
      if (!lenient) fail('Strings must use double quotes', start);
      return parseString();
    }
    if (code === 45 || isDigit(code)) return parseNumber();
    if (literal('true')) return { type: 'boolean', value: true, from: start, to: pos };
    if (literal('false')) return { type: 'boolean', value: false, from: start, to: pos };
    if (literal('null')) return { type: 'null', from: start, to: pos };
    return unexpected(pos);
  };

  try {
    skip();
    if (pos >= length) fail('The document is empty', pos);
    const value = parseValue(0);
    skip();
    if (pos < length) fail(`Unexpected ${describe(pos)} after the JSON value`, pos);
    return { ok: true, value, warnings };
  } catch (error) {
    if (error instanceof JsonSyntaxError) return { ok: false, error: error.issue, warnings };
    throw error;
  }
}

/** 1-based line and column of a UTF-16 offset; `\r\n`, `\r` and `\n` each end a line. */
export function positionAt(text: string, offset: number): { line: number; col: number } {
  const end = Math.min(Math.max(0, offset), text.length);
  let line = 1;
  let lineStart = 0;
  for (let i = 0; i < end; i++) {
    const code = text.charCodeAt(i);
    if (code === 10 || (code === 13 && text.charCodeAt(i + 1) !== 10)) {
      line++;
      lineStart = i + 1;
    }
  }
  return { line, col: end - lineStart + 1 };
}
