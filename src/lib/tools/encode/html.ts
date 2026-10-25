import { ENTITY_CODE_POINTS, ENTITY_NAMES } from './html-entities';

export type EntityFormat = 'named' | 'decimal' | 'hex';
/** `specials`: only `& < > " '`. `nonAscii`: also every character outside ASCII. */
export type EntityScope = 'specials' | 'nonAscii';

const SPECIALS = new Set([0x26, 0x3c, 0x3e, 0x22, 0x27]);

function reference(code: number, format: EntityFormat): string {
  if (format === 'named') {
    const name = ENTITY_NAMES.get(code);
    if (name) return `&${name};`;
  }
  return format === 'hex' ? `&#x${code.toString(16).toUpperCase()};` : `&#${code};`;
}

export function encodeHtmlEntities(
  text: string,
  { format = 'named', scope = 'specials' }: { format?: EntityFormat; scope?: EntityScope } = {}
): string {
  let out = '';
  for (const char of text) {
    const code = char.codePointAt(0)!;
    const escape = SPECIALS.has(code) || (scope === 'nonAscii' && code > 0x7e);
    out += escape ? reference(code, format) : char;
  }
  return out;
}

const REFERENCE = /&(?:#(\d+)|#[xX]([0-9a-fA-F]+)|([A-Za-z][A-Za-z0-9]*));?/g;

function fromCodePoint(code: number): string {
  // What browsers do with null, surrogate and out-of-range references.
  const invalid = code === 0 || code > 0x10ffff || (code >= 0xd800 && code <= 0xdfff);
  return String.fromCodePoint(invalid ? 0xfffd : code);
}

/**
 * Decodes numeric references (`;` optional) and named ones (`;` required). Unknown names are
 * left as they are, and reported so the caller can warn about them.
 */
export function decodeHtmlEntities(text: string): { value: string; unknown: string[] } {
  const unknown = new Set<string>();
  const value = text.replace(REFERENCE, (match, decimal?: string, hex?: string, name?: string) => {
    if (decimal !== undefined) return fromCodePoint(Number(decimal));
    if (hex !== undefined) return fromCodePoint(parseInt(hex, 16));
    if (!match.endsWith(';')) return match;
    const code = ENTITY_CODE_POINTS.get(name!);
    if (code === undefined) {
      unknown.add(match);
      return match;
    }
    return String.fromCodePoint(code);
  });
  return { value, unknown: [...unknown] };
}
