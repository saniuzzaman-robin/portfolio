import { ByteSink, fail, type CodecResult, type DecodedBytes } from './types';

const STANDARD = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
const URL_SAFE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';

// Decoding accepts both alphabets, so pasted base64url works without switching options.
const VALUES = new Int8Array(128).fill(-1);
for (let i = 0; i < 64; i++) {
  VALUES[STANDARD.charCodeAt(i)] = i;
  VALUES[URL_SAFE.charCodeAt(i)] = i;
}

const isSpace = (code: number) => code === 0x20 || code === 0x09 || code === 0x0a || code === 0x0d;

export type Base64Options = {
  /** RFC 4648 §5 alphabet (`-` and `_`). */
  urlSafe?: boolean;
  padding?: boolean;
  /** Break lines every N characters (76 = MIME, 64 = PEM); 0 = one line. */
  lineLength?: number;
};

export function encodeBase64(
  bytes: Uint8Array,
  { urlSafe = false, padding = true, lineLength = 0 }: Base64Options = {}
): string {
  const alphabet = urlSafe ? URL_SAFE : STANDARD;
  const parts: string[] = [];
  let chunk = '';
  const full = bytes.length - (bytes.length % 3);
  for (let i = 0; i < full; i += 3) {
    const n = (bytes[i] << 16) | (bytes[i + 1] << 8) | bytes[i + 2];
    chunk +=
      alphabet[n >> 18] + alphabet[(n >> 12) & 63] + alphabet[(n >> 6) & 63] + alphabet[n & 63];
    // Flush periodically: one huge string concatenation is slow in some engines.
    if (chunk.length >= 8192) {
      parts.push(chunk);
      chunk = '';
    }
  }
  const rest = bytes.length - full;
  if (rest === 1) {
    const n = bytes[full] << 16;
    chunk += alphabet[n >> 18] + alphabet[(n >> 12) & 63] + (padding ? '==' : '');
  } else if (rest === 2) {
    const n = (bytes[full] << 16) | (bytes[full + 1] << 8);
    chunk +=
      alphabet[n >> 18] + alphabet[(n >> 12) & 63] + alphabet[(n >> 6) & 63] + (padding ? '=' : '');
  }
  parts.push(chunk);
  const encoded = parts.join('');
  return lineLength > 0 ? wrapLines(encoded, lineLength) : encoded;
}

export function wrapLines(text: string, width: number): string {
  const lines: string[] = [];
  for (let i = 0; i < text.length; i += width) lines.push(text.slice(i, i + width));
  return lines.join('\n');
}

/**
 * Decodes standard or URL-safe base64. Whitespace and line breaks are ignored and padding is
 * optional; anything else that isn't base64 is an error at its position.
 */
export function decodeBase64(text: string, track = false, offset = 0): CodecResult<DecodedBytes> {
  const sink = new ByteSink(Math.ceil((text.length * 3) / 4), track);
  let buffer = 0;
  let bits = 0;
  let count = 0;
  let groupStart = 0;
  let previous = 0;
  let padding = 0;
  let paddingStart = -1;
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    if (isSpace(code)) continue;
    if (code === 0x3d) {
      if (paddingStart < 0) paddingStart = i;
      padding++;
      continue;
    }
    const value = code < 128 ? VALUES[code] : -1;
    if (value < 0) {
      return fail(`“${text[i]}” is not a base64 character.`, offset + i, offset + i + 1);
    }
    if (paddingStart >= 0) {
      return fail('Data continues after the “=” padding.', offset + i, offset + i + 1);
    }
    if (count % 4 === 0) groupStart = i;
    count++;
    buffer = ((buffer << 6) | value) & 0xffff;
    bits += 6;
    if (bits >= 8) {
      bits -= 8;
      // Every byte begins in the character before the one that completes it.
      sink.push((buffer >> bits) & 0xff, offset + previous);
    }
    previous = i;
  }
  if (count % 4 === 1) {
    return fail(
      'The last group has a single character; base64 groups need at least two.',
      offset + groupStart,
      offset + text.length
    );
  }
  if (padding > 0 && ((count + padding) % 4 !== 0 || padding > 2)) {
    return fail('Wrong amount of “=” padding.', offset + paddingStart, offset + text.length);
  }
  return { ok: true, value: sink.result() };
}

export type DataUri = {
  mime: string;
  base64: boolean;
  /** The payload after the comma, and where it starts in the original text. */
  data: string;
  dataOffset: number;
};

/** Splits `data:[<mime>][;params][;base64],<data>`; returns null if `text` isn't a data URI. */
export function parseDataUri(text: string): DataUri | null {
  const match = /^\s*data:([^,]*),/i.exec(text);
  if (!match) return null;
  const params = match[1].split(';').map((part) => part.trim());
  const base64 = params.length > 1 && params[params.length - 1].toLowerCase() === 'base64';
  const mime = params[0] || 'text/plain';
  const dataOffset = match[0].length;
  return { mime: mime.toLowerCase(), base64, data: text.slice(dataOffset).trimEnd(), dataOffset };
}

export function toDataUri(bytes: Uint8Array, mime: string): string {
  return `data:${mime};base64,${encodeBase64(bytes)}`;
}
