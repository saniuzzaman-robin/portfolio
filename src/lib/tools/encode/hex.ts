import { ByteSink, fail, type CodecResult, type DecodedBytes } from './types';

export const HEX_SEPARATORS = { none: '', space: ' ', colon: ':' } as const;
export type HexSeparator = keyof typeof HEX_SEPARATORS;

export function encodeHex(
  bytes: Uint8Array,
  { separator = 'none', upper = false }: { separator?: HexSeparator; upper?: boolean } = {}
): string {
  const parts = new Array<string>(bytes.length);
  for (let i = 0; i < bytes.length; i++) parts[i] = bytes[i].toString(16).padStart(2, '0');
  const hex = parts.join(HEX_SEPARATORS[separator]);
  return upper ? hex.toUpperCase() : hex;
}

const isHexDigit = (char: string | undefined) => char !== undefined && /[0-9a-f]/i.test(char);

/**
 * Accepts any case, whitespace, `:`/`-`/`,` separators and `0x` or `\x` prefixes
 * ("de ad", "DE:AD", "0xde, 0xad", "\xde\xad").
 */
export function decodeHex(text: string, track = false): CodecResult<DecodedBytes> {
  const sink = new ByteSink(Math.ceil(text.length / 2), track);
  let high = -1;
  let highAt = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (/[\s:,-]/.test(char)) continue;
    const prefixed = (char === '0' || char === '\\') && /[xX]/.test(text[i + 1] ?? '');
    if (high < 0 && prefixed && isHexDigit(text[i + 2])) {
      i++;
      continue;
    }
    if (!isHexDigit(char)) return fail(`“${char}” is not a hex digit.`, i);
    const value = parseInt(char, 16);
    if (high < 0) {
      high = value;
      highAt = i;
    } else {
      sink.push((high << 4) | value, highAt);
      high = -1;
    }
  }
  if (high >= 0) return fail('Odd number of hex digits: the last byte is incomplete.', highAt);
  return { ok: true, value: sink.result() };
}
