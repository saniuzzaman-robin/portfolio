import { fail, hexByte, type CodecResult, type DecodedBytes } from './types';

const encoder = new TextEncoder();
const decoder = new TextDecoder('utf-8', { fatal: true, ignoreBOM: true });

export function utf8Encode(text: string): Uint8Array {
  return encoder.encode(text);
}

/** Offset of the first byte that is not part of a well-formed UTF-8 sequence, or -1. */
export function invalidUtf8Offset(bytes: Uint8Array): number {
  let i = 0;
  while (i < bytes.length) {
    const lead = bytes[i];
    if (lead < 0x80) {
      i++;
      continue;
    }
    let size: number;
    let min = 0x80;
    let max = 0xbf;
    if (lead >= 0xc2 && lead <= 0xdf) size = 2;
    else if (lead >= 0xe0 && lead <= 0xef) {
      size = 3;
      if (lead === 0xe0) min = 0xa0; // overlong
      if (lead === 0xed) max = 0x9f; // surrogates
    } else if (lead >= 0xf0 && lead <= 0xf4) {
      size = 4;
      if (lead === 0xf0) min = 0x90; // overlong
      if (lead === 0xf4) max = 0x8f; // above U+10FFFF
    } else return i;
    for (let k = 1; k < size; k++) {
      const byte = bytes[i + k];
      if (byte === undefined) return i;
      const low = k === 1 ? min : 0x80;
      const high = k === 1 ? max : 0xbf;
      if (byte < low || byte > high) return i;
    }
    i += size;
  }
  return -1;
}

/**
 * Strict UTF-8 decode. Invalid bytes are an error (not U+FFFD), located in the input text via
 * `starts` when the decoder tracked them.
 */
export function utf8Decode({ bytes, starts }: DecodedBytes, inputLength: number): CodecResult {
  try {
    return { ok: true, value: decoder.decode(bytes) };
  } catch {
    const offset = Math.max(0, invalidUtf8Offset(bytes));
    const from = starts?.[offset] ?? 0;
    const to = starts?.[offset + 1] ?? inputLength;
    return fail(
      `The decoded bytes are not valid UTF-8 text (byte ${offset}: 0x${hexByte(bytes[offset] ?? 0)}).`,
      from,
      Math.max(to, from + 1)
    );
  }
}
