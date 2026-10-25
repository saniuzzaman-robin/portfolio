import { ByteSink, fail, type CodecResult, type DecodedBytes } from './types';

/** Each byte as 8 bits, separated by spaces unless `spaced` is false. */
export function encodeBinary(bytes: Uint8Array, { spaced = true } = {}): string {
  const parts = new Array<string>(bytes.length);
  for (let i = 0; i < bytes.length; i++) parts[i] = bytes[i].toString(2).padStart(8, '0');
  return parts.join(spaced ? ' ' : '');
}

/**
 * Whitespace-separated groups of up to 8 bits are one byte each, so unpadded ASCII
 * ("1001000 1101001") works; longer runs are split into 8-bit bytes.
 */
export function decodeBinary(text: string, track = false): CodecResult<DecodedBytes> {
  const sink = new ByteSink(text.length, track);
  const tokens = /\S+/g;
  let match: RegExpExecArray | null;
  while ((match = tokens.exec(text))) {
    const token = match[0];
    const start = match.index;
    const bad = /[^01]/.exec(token);
    if (bad) return fail(`“${bad[0]}” is not a binary digit.`, start + bad.index);
    if (token.length <= 8) {
      sink.push(parseInt(token, 2), start);
      continue;
    }
    if (token.length % 8 !== 0) {
      return fail(
        `${token.length} bits is not a whole number of bytes.`,
        start,
        start + token.length
      );
    }
    for (let i = 0; i < token.length; i += 8) {
      sink.push(parseInt(token.slice(i, i + 8), 2), start + i);
    }
  }
  return { ok: true, value: sink.result() };
}
