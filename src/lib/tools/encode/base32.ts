import { ByteSink, fail, type CodecResult, type DecodedBytes } from './types';

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
const VALUES = new Int8Array(128).fill(-1);
for (let i = 0; i < 32; i++) {
  VALUES[ALPHABET.charCodeAt(i)] = i;
  VALUES[ALPHABET.toLowerCase().charCodeAt(i)] = i;
}

/** Characters left over in a final group that still end on a whole byte (RFC 4648 §6). */
const VALID_REMAINDERS = new Set([0, 2, 4, 5, 7]);

/** RFC 4648 base32 (standard alphabet). */
export function encodeBase32(bytes: Uint8Array, { padding = true } = {}): string {
  let out = '';
  let buffer = 0;
  let bits = 0;
  for (const byte of bytes) {
    buffer = ((buffer << 8) | byte) & 0xffff;
    bits += 8;
    while (bits >= 5) {
      bits -= 5;
      out += ALPHABET[(buffer >> bits) & 31];
    }
  }
  if (bits > 0) out += ALPHABET[(buffer << (5 - bits)) & 31];
  if (padding) out += '='.repeat((8 - (out.length % 8)) % 8);
  return out;
}

/** Case-insensitive; whitespace is ignored and padding is optional. */
export function decodeBase32(text: string, track = false): CodecResult<DecodedBytes> {
  const sink = new ByteSink(Math.ceil((text.length * 5) / 8), track);
  let buffer = 0;
  let bits = 0;
  let count = 0;
  let groupStart = 0;
  let previous = 0;
  let paddingStart = -1;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (/\s/.test(char)) continue;
    if (char === '=') {
      if (paddingStart < 0) paddingStart = i;
      continue;
    }
    const code = char.charCodeAt(0);
    const value = code < 128 ? VALUES[code] : -1;
    if (value < 0) return fail(`“${char}” is not a base32 character.`, i);
    if (paddingStart >= 0) return fail('Data continues after the “=” padding.', i);
    if (count % 8 === 0) groupStart = i;
    count++;
    buffer = ((buffer << 5) | value) & 0xffff;
    bits += 5;
    if (bits >= 8) {
      bits -= 8;
      // Approximate source for UTF-8 errors: the character before the one completing the byte.
      sink.push((buffer >> bits) & 0xff, previous);
    }
    previous = i;
  }
  if (!VALID_REMAINDERS.has(count % 8)) {
    return fail('The last group has the wrong number of characters.', groupStart, text.length);
  }
  return { ok: true, value: sink.result() };
}
