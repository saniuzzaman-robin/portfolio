import { unescapeJsonString } from '@/lib/tools/json/format';
import { failed, formatted, type FormatResult } from '@/lib/tools/format/types';

export const ESCAPE_TARGETS = ['json', 'javascript', 'sql', 'regex', 'csv', 'shell'] as const;
export type EscapeTarget = (typeof ESCAPE_TARGETS)[number];

export const JS_QUOTES = ["'", '"', '`'] as const;
export type JsQuote = (typeof JS_QUOTES)[number];

export type EscapeOptions = {
  /** Wrap the result in quotes (JSON, JavaScript, SQL); CSV and shell quote only when needed. */
  quotes: boolean;
  jsQuote: JsQuote;
  /** Write every non-ASCII character as a `\u` escape (JSON, JavaScript). */
  ascii: boolean;
  /** MySQL-style backslash escapes in SQL strings, as well as doubled quotes. */
  sqlBackslashes: boolean;
};

export const DEFAULT_ESCAPE_OPTIONS: EscapeOptions = {
  quotes: true,
  jsQuote: "'",
  ascii: false,
  sqlBackslashes: false,
};

export function isEscapeOptions(value: unknown): value is EscapeOptions {
  const options = value as EscapeOptions | null;
  return (
    typeof options === 'object' &&
    options !== null &&
    typeof options.quotes === 'boolean' &&
    JS_QUOTES.includes(options.jsQuote) &&
    typeof options.ascii === 'boolean' &&
    typeof options.sqlBackslashes === 'boolean'
  );
}

const hex = (code: number, digits: number) => code.toString(16).toUpperCase().padStart(digits, '0');

/** Everything past `~` as `\uXXXX` (characters outside the BMP become two escapes, as in JSON). */
function escapeNonAscii(text: string): string {
  return text.replace(/[^\x00-\x7e]/g, (char) => `\\u${hex(char.charCodeAt(0), 4)}`);
}

function escapeJson(text: string, options: EscapeOptions): string {
  const literal = JSON.stringify(text);
  const body = options.ascii ? escapeNonAscii(literal) : literal;
  return options.quotes ? body : body.slice(1, -1);
}

const JS_SHORT: Record<string, string> = {
  '\\': '\\\\',
  '\b': '\\b',
  '\f': '\\f',
  '\n': '\\n',
  '\r': '\\r',
  '\t': '\\t',
  '\v': '\\v',
};

function escapeJavaScript(text: string, options: EscapeOptions): string {
  const quote = options.jsQuote;
  let out = '';
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const code = text.charCodeAt(i);
    if (char in JS_SHORT) out += JS_SHORT[char];
    else if (char === quote) out += `\\${quote}`;
    else if (quote === '`' && char === '$' && text[i + 1] === '{') out += '\\$';
    // `\0` followed by a digit would read as an octal escape.
    else if (code === 0) out += /\d/.test(text[i + 1] ?? '') ? '\\x00' : '\\0';
    else if (code < 0x20 || code === 0x7f) out += `\\x${hex(code, 2)}`;
    else if (code === 0x2028 || code === 0x2029) out += `\\u${hex(code, 4)}`;
    else if (code >= 0xd800 && code <= 0xdfff) {
      const pair = code <= 0xdbff && /[\udc00-\udfff]/.test(text[i + 1] ?? '');
      if (pair && !options.ascii) out += char + text[++i];
      else if (pair) out += `\\u${hex(code, 4)}\\u${hex(text.charCodeAt(++i), 4)}`;
      // A lone surrogate can't be written as itself in UTF-8 source.
      else out += `\\u${hex(code, 4)}`;
    } else if (code > 0x7e && options.ascii) out += `\\u${hex(code, 4)}`;
    else out += char;
  }
  return options.quotes ? quote + out + quote : out;
}

const MYSQL_ESCAPES: Record<string, string> = {
  '\0': '\\0',
  '\\': '\\\\',
  '\n': '\\n',
  '\r': '\\r',
  '\x1a': '\\Z',
};

function escapeSql(text: string, options: EscapeOptions): string {
  let body = text.replace(/'/g, "''");
  if (options.sqlBackslashes) body = body.replace(/[\0\\\n\r\x1a]/g, (char) => MYSQL_ESCAPES[char]);
  return options.quotes ? `'${body}'` : body;
}

/**
 * Characters with a meaning in a pattern, plus `/` for regex literals. Nothing else, because
 * other escapes (like `\-`) are syntax errors with the `u` and `v` flags.
 */
const REGEX_SYNTAX = /[\\^$.*+?()[\]{}|/]/g;

function escapeRegex(text: string): string {
  return text
    .replace(REGEX_SYNTAX, '\\$&')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t');
}

/** RFC 4180 field: quoted when it holds a delimiter, quote, line break or edge whitespace. */
function escapeCsv(text: string, options: EscapeOptions): string {
  const needsQuotes = options.quotes || /[",;\t\r\n]|^\s|\s$/.test(text);
  return needsQuotes ? `"${text.replace(/"/g, '""')}"` : text;
}

/** POSIX shell word: single quotes, with each `'` written as `'\''`. */
function escapeShell(text: string, options: EscapeOptions): string {
  if (text !== '' && !options.quotes && /^[\w@%+=:,./-]+$/.test(text)) return text;
  return `'${text.replace(/'/g, "'\\''")}'`;
}

export function escapeText(text: string, target: EscapeTarget, options: EscapeOptions): string {
  switch (target) {
    case 'json':
      return escapeJson(text, options);
    case 'javascript':
      return escapeJavaScript(text, options);
    case 'sql':
      return escapeSql(text, options);
    case 'regex':
      return escapeRegex(text);
    case 'csv':
      return escapeCsv(text, options);
    case 'shell':
      return escapeShell(text, options);
  }
}

/** `text` without one pair of matching surrounding quotes, and where its body starts. */
function unquote(text: string, quotes: readonly string[]): { body: string; start: number } {
  const first = text[0];
  if (text.length >= 2 && quotes.includes(first) && text[text.length - 1] === first) {
    return { body: text.slice(1, -1), start: 1 };
  }
  return { body: text, start: 0 };
}

const JS_SIMPLE: Record<string, string> = {
  b: '\b',
  f: '\f',
  n: '\n',
  r: '\r',
  t: '\t',
  v: '\v',
};

/**
 * Reads `\x`, `\u`, `\u{…}` and single-letter escapes at `text[i]` (just after the backslash).
 * Returns the decoded text and how many characters it used, or an error message.
 */
function readCodeEscape(
  text: string,
  i: number
): { value: string; length: number } | { error: string; length: number } | null {
  const char = text[i];
  if (char in JS_SIMPLE) return { value: JS_SIMPLE[char], length: 1 };
  if (char === 'x') {
    const digits = text.slice(i + 1, i + 3);
    if (!/^[0-9a-f]{2}$/i.test(digits)) return { error: '\\x needs two hex digits', length: 1 };
    return { value: String.fromCharCode(parseInt(digits, 16)), length: 3 };
  }
  if (char === 'u') {
    if (text[i + 1] === '{') {
      const end = text.indexOf('}', i + 2);
      const digits = end < 0 ? '' : text.slice(i + 2, end);
      const code = /^[0-9a-f]{1,6}$/i.test(digits) ? parseInt(digits, 16) : -1;
      if (code < 0 || code > 0x10ffff) {
        return { error: '\\u{…} needs a code point from 0 to 10FFFF', length: 1 };
      }
      return { value: String.fromCodePoint(code), length: end - i + 1 };
    }
    const digits = text.slice(i + 1, i + 5);
    if (!/^[0-9a-f]{4}$/i.test(digits)) return { error: '\\u needs four hex digits', length: 1 };
    return { value: String.fromCharCode(parseInt(digits, 16)), length: 5 };
  }
  return null;
}

function unescapeJavaScript(text: string): FormatResult {
  const { body, start } = unquote(text, JS_QUOTES);
  const quote = start ? text[0] : null;
  let out = '';
  for (let i = 0; i < body.length; i++) {
    const char = body[i];
    if (char === quote) {
      return failed(`Unescaped ${quote} inside the string`, start + i, start + i + 1);
    }
    if (char !== '\\') {
      out += char;
      continue;
    }
    const next = body[i + 1];
    if (next === undefined) return failed('The string ends with a lone backslash', start + i);
    const code = readCodeEscape(body, i + 1);
    if (code && 'error' in code) return failed(code.error, start + i, start + i + 2);
    if (code) {
      out += code.value;
      i += code.length;
    } else if (next === '0' && !/\d/.test(body[i + 2] ?? '')) {
      out += '\0';
      i++;
    } else if (/\d/.test(next)) {
      return failed('Octal escapes are not allowed in strict mode', start + i, start + i + 2);
    } else if (next === '\r' || next === '\n' || next === ' ' || next === ' ') {
      // A backslash before a line break continues the string on the next line.
      i += next === '\r' && body[i + 2] === '\n' ? 2 : 1;
    } else {
      out += next;
      i++;
    }
  }
  return formatted(out);
}

const MYSQL_DECODES: Partial<Record<string, string>> = {
  0: '\0',
  n: '\n',
  r: '\r',
  t: '\t',
  b: '\b',
  Z: '\x1a',
};

function unescapeSql(text: string, options: EscapeOptions): FormatResult {
  const { body, start } = unquote(text, ["'"]);
  let out = '';
  for (let i = 0; i < body.length; i++) {
    const char = body[i];
    if (char === "'") {
      if (body[i + 1] !== "'") {
        return failed("A quote inside the string must be doubled ('')", start + i, start + i + 1);
      }
      out += "'";
      i++;
    } else if (char === '\\' && options.sqlBackslashes && i + 1 < body.length) {
      const next = body[++i];
      // MySQL keeps the backslash in \% and \_ (they matter only to LIKE).
      out += MYSQL_DECODES[next] ?? (next === '%' || next === '_' ? `\\${next}` : next);
    } else {
      out += char;
    }
  }
  return formatted(out);
}

/** Escapes that stand for a set of characters, not one: they have no literal form. */
const REGEX_CLASSES = new Set(['d', 'D', 'w', 'W', 's', 'S', 'b', 'B', 'p', 'P', 'k']);

function unescapeRegex(text: string): FormatResult {
  let out = '';
  for (let i = 0; i < text.length; i++) {
    if (text[i] !== '\\') {
      out += text[i];
      continue;
    }
    const next = text[i + 1];
    if (next === undefined) return failed('The pattern ends with a lone backslash', i);
    if (REGEX_CLASSES.has(next)) {
      return failed(`\\${next} matches a class of characters, not one literal`, i, i + 2);
    }
    if (next === 'c' && /[a-z]/i.test(text[i + 2] ?? '')) {
      out += String.fromCharCode(text.charCodeAt(i + 2) % 32);
      i += 2;
      continue;
    }
    const code = readCodeEscape(text, i + 1);
    if (code && 'error' in code) return failed(code.error, i, i + 2);
    if (code) {
      out += code.value;
      i += code.length;
    } else if (next === '0' && !/\d/.test(text[i + 2] ?? '')) {
      out += '\0';
      i++;
    } else if (/[0-9a-z]/i.test(next)) {
      return failed(`\\${next} is a backreference or not a valid escape`, i, i + 2);
    } else {
      out += next;
      i++;
    }
  }
  return formatted(out);
}

function unescapeCsv(text: string): FormatResult {
  if (!(text.length >= 2 && text.startsWith('"') && text.endsWith('"'))) return formatted(text);
  const body = text.slice(1, -1);
  for (let i = 0; i < body.length; i++) {
    if (body[i] !== '"') continue;
    if (body[i + 1] !== '"') {
      return failed('A quote inside a quoted field must be doubled ("")', i + 1, i + 2);
    }
    i++;
  }
  return formatted(body.replace(/""/g, '"'));
}

/** In double quotes, a backslash only escapes these (and a line break, which it removes). */
const DOUBLE_QUOTE_ESCAPES = new Set(['$', '`', '"', '\\']);

/**
 * Splits a POSIX shell command line into its arguments, one per line, with quotes and
 * backslashes resolved. Expansions (`$VAR`, globs) are left as written.
 */
function unescapeShell(text: string): FormatResult {
  const words: string[] = [];
  let word = '';
  let inWord = false;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (/\s/.test(char)) {
      if (inWord) words.push(word);
      word = '';
      inWord = false;
      continue;
    }
    inWord = true;
    if (char === "'") {
      const end = text.indexOf("'", i + 1);
      if (end < 0) return failed('Unterminated single quote', i, i + 1);
      word += text.slice(i + 1, end);
      i = end;
    } else if (char === '"') {
      let j = i + 1;
      for (; j < text.length && text[j] !== '"'; j++) {
        if (text[j] === '\\' && j + 1 < text.length) {
          const next = text[j + 1];
          if (next === '\n') j++;
          else if (DOUBLE_QUOTE_ESCAPES.has(next)) word += text[++j];
          else word += '\\';
        } else {
          word += text[j];
        }
      }
      if (j >= text.length) return failed('Unterminated double quote', i, i + 1);
      i = j;
    } else if (char === '\\') {
      const next = text[i + 1];
      if (next === undefined) return failed('The command ends with a lone backslash', i);
      i++;
      // Backslash-newline joins lines; it isn't part of any word.
      if (next !== '\n') word += next;
      else if (word === '') inWord = false;
    } else {
      word += char;
    }
  }
  if (inWord) words.push(word);
  return formatted(words.join('\n'));
}

/** The reverse of `escapeText`; errors point into `text`. */
export function unescapeText(
  text: string,
  target: EscapeTarget,
  options: EscapeOptions
): FormatResult {
  switch (target) {
    case 'json': {
      const result = unescapeJsonString(text);
      return result.ok ? formatted(result.value) : { ok: false, error: result.error };
    }
    case 'javascript':
      return unescapeJavaScript(text);
    case 'sql':
      return unescapeSql(text, options);
    case 'regex':
      return unescapeRegex(text);
    case 'csv':
      return unescapeCsv(text);
    case 'shell':
      return unescapeShell(text);
  }
}
