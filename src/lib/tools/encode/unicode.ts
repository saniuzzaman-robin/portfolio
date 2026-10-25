import { fail, type CodecResult } from './types';

/** `utf16`: `\uXXXX`, astral characters as surrogate pairs (JS, JSON, Java). `codePoint`: `\u{…}`. */
export type UnicodeStyle = 'utf16' | 'codePoint';

const hex4 = (code: number) => code.toString(16).padStart(4, '0');

export function encodeUnicodeEscapes(
  text: string,
  { style = 'utf16', all = false }: { style?: UnicodeStyle; all?: boolean } = {}
): string {
  let out = '';
  for (const char of text) {
    const code = char.codePointAt(0)!;
    if (!all && code >= 0x20 && code <= 0x7e) {
      out += char;
    } else if (style === 'codePoint') {
      out += `\\u{${code.toString(16)}}`;
    } else {
      // `char` holds one code point: a BMP unit or a surrogate pair, each escaped separately.
      for (let i = 0; i < char.length; i++) out += `\\u${hex4(char.charCodeAt(i))}`;
    }
  }
  return out;
}

const ESCAPE =
  /\\(?:u\{([0-9a-fA-F]*)\}?|u([0-9a-fA-F]{0,4})|U([0-9a-fA-F]{0,8})|x([0-9a-fA-F]{0,2})|\\)/g;

/**
 * Decodes `\uXXXX` (surrogate pairs join naturally), `\u{…}`, `\UXXXXXXXX` and `\xXX`. An escaped
 * backslash (`\\`) is kept as is, so `\\u0041` stays literal; other escapes are left untouched.
 * A malformed `\u` is an error; malformed `\U`/`\x` are kept literally.
 */
export function decodeUnicodeEscapes(text: string): CodecResult {
  let out = '';
  let last = 0;
  for (const match of text.matchAll(ESCAPE)) {
    const [whole, braced, short, long, byte] = match;
    const at = match.index;
    out += text.slice(last, at);
    last = at + whole.length;
    if (whole === '\\\\') {
      out += whole;
      continue;
    }
    let digits: string;
    let width: number;
    if (braced !== undefined) {
      if (!whole.endsWith('}') || braced === '') {
        return fail('“\\u{” must be followed by hex digits and “}”.', at, last);
      }
      digits = braced;
      width = braced.length;
    } else if (short !== undefined) {
      [digits, width] = [short, 4];
    } else {
      [digits, width] = long !== undefined ? [long, 8] : [byte, 2];
      // Less common escapes: a Windows path like C:\Users stays as it is instead of failing.
      if (digits.length !== width) {
        out += whole;
        continue;
      }
    }
    if (digits.length !== width) {
      return fail('“\\u” must be followed by 4 hex digits.', at, last);
    }
    const code = parseInt(digits, 16);
    if (code > 0x10ffff) return fail('Code point is above U+10FFFF.', at, last);
    out +=
      braced === undefined && short !== undefined
        ? String.fromCharCode(code)
        : String.fromCodePoint(code);
  }
  return { ok: true, value: out + text.slice(last) };
}
