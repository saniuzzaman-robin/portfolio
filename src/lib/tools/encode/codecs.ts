import { decodeBase32, encodeBase32 } from './base32';
import { decodeBase64, encodeBase64 } from './base64';
import { decodeBinary, encodeBinary } from './binary';
import { decodeHex, encodeHex, HEX_SEPARATORS, type HexSeparator } from './hex';
import {
  decodeHtmlEntities,
  encodeHtmlEntities,
  type EntityFormat,
  type EntityScope,
} from './html';
import { domainToAscii, domainToUnicode } from './punycode';
import { decodeQuotedPrintableBytes, encodeQuotedPrintable } from './quoted-printable';
import { rot, type RotVariant } from './rot';
import { decodeUnicodeEscapes, encodeUnicodeEscapes, type UnicodeStyle } from './unicode';
import { decodeUrlBytes, encodeUrl, loneSurrogate, surrogateIssue, type UrlEncoding } from './url';
import { utf8Decode, utf8Encode } from './utf8';
import type { CodecResult, DecodedBytes } from './types';

/** Codecs that turn text into text (the file and URL-parser modes are separate). */
export const TEXT_CODECS = [
  'base64',
  'base32',
  'hex',
  'binary',
  'url',
  'html',
  'unicode',
  'punycode',
  'qp',
  'rot',
] as const;
export type TextCodec = (typeof TEXT_CODECS)[number];
export type Direction = 'encode' | 'decode';

/** Codecs where encoding and decoding are the same operation. */
export const SYMMETRIC: ReadonlySet<TextCodec> = new Set(['rot']);

export type CodecOptions = {
  base64: { urlSafe: boolean; padding: boolean; lineLength: 0 | 64 | 76 };
  base32: { padding: boolean };
  hex: { separator: HexSeparator; upper: boolean };
  binary: { spaced: boolean };
  url: { mode: UrlEncoding };
  html: { format: EntityFormat; scope: EntityScope };
  unicode: { style: UnicodeStyle; all: boolean };
  rot: { variant: RotVariant };
};

export const DEFAULT_CODEC_OPTIONS: CodecOptions = {
  base64: { urlSafe: false, padding: true, lineLength: 0 },
  base32: { padding: true },
  hex: { separator: 'none', upper: false },
  binary: { spaced: true },
  url: { mode: 'component' },
  html: { format: 'named', scope: 'specials' },
  unicode: { style: 'utf16', all: false },
  rot: { variant: 13 },
};

/** Allowed values for the options that are enums. */
const CHOICES: Record<string, Record<string, readonly unknown[]>> = {
  base64: { lineLength: [0, 64, 76] },
  hex: { separator: Object.keys(HEX_SEPARATORS) },
  url: { mode: ['component', 'uri', 'form'] },
  html: { format: ['named', 'decimal', 'hex'], scope: ['specials', 'nonAscii'] },
  unicode: { style: ['utf16', 'codePoint'] },
  rot: { variant: [13, 47] },
};

/** Validates persisted options against the current shape (stale or edited storage is rejected). */
export function isCodecOptions(value: unknown): value is CodecOptions {
  if (typeof value !== 'object' || value === null) return false;
  const stored = value as Record<string, Record<string, unknown> | undefined>;
  return Object.entries(DEFAULT_CODEC_OPTIONS).every(([codec, defaults]) => {
    const options = stored[codec];
    if (typeof options !== 'object' || options === null) return false;
    return Object.entries(defaults as Record<string, unknown>).every(
      ([key, fallback]) =>
        typeof options[key] === typeof fallback &&
        (CHOICES[codec]?.[key]?.includes(options[key]) ?? true)
    );
  });
}

export type CodecRun = CodecResult & { warning?: string };

/** Byte decoders run once fast, and again with offset tracking only to locate a UTF-8 error. */
function decodeToText(
  input: string,
  decode: (track: boolean) => CodecResult<DecodedBytes>
): CodecResult {
  const bytes = decode(false);
  if (!bytes.ok) return bytes;
  const text = utf8Decode(bytes.value, input.length);
  if (text.ok) return text;
  const tracked = decode(true);
  return tracked.ok ? utf8Decode(tracked.value, input.length) : text;
}

/** Text → UTF-8 bytes; unpaired surrogates are an error rather than a silent U+FFFD. */
function encodeBytes(input: string, encode: (bytes: Uint8Array) => string): CodecResult {
  const lone = loneSurrogate(input);
  if (lone >= 0) return { ok: false, error: surrogateIssue(lone) };
  return { ok: true, value: encode(utf8Encode(input)) };
}

export function runCodec(
  codec: TextCodec,
  direction: Direction,
  input: string,
  options: CodecOptions
): CodecRun {
  const encode = direction === 'encode';
  switch (codec) {
    case 'base64': {
      const { urlSafe, padding, lineLength } = options.base64;
      return encode
        ? encodeBytes(input, (bytes) => encodeBase64(bytes, { urlSafe, padding, lineLength }))
        : decodeToText(input, (track) => decodeBase64(input, track));
    }
    case 'base32':
      return encode
        ? encodeBytes(input, (bytes) => encodeBase32(bytes, options.base32))
        : decodeToText(input, (track) => decodeBase32(input, track));
    case 'hex':
      return encode
        ? encodeBytes(input, (bytes) => encodeHex(bytes, options.hex))
        : decodeToText(input, (track) => decodeHex(input, track));
    case 'binary':
      return encode
        ? encodeBytes(input, (bytes) => encodeBinary(bytes, options.binary))
        : decodeToText(input, (track) => decodeBinary(input, track));
    case 'url':
      return encode
        ? encodeUrl(input, options.url.mode)
        : decodeToText(input, (track) => decodeUrlBytes(input, options.url.mode, track));
    case 'html': {
      if (encode) return { ok: true, value: encodeHtmlEntities(input, options.html) };
      const { value, unknown } = decodeHtmlEntities(input);
      return {
        ok: true,
        value,
        warning: unknown.length
          ? `Unknown entities left as they are: ${unknown.join(' ')}`
          : undefined,
      };
    }
    case 'unicode':
      return encode
        ? { ok: true, value: encodeUnicodeEscapes(input, options.unicode) }
        : decodeUnicodeEscapes(input);
    case 'punycode':
      return encode ? domainToAscii(input) : domainToUnicode(input);
    case 'qp':
      return encode
        ? encodeBytes(input, () => encodeQuotedPrintable(input))
        : decodeToText(input, (track) => decodeQuotedPrintableBytes(input, track));
    case 'rot':
      return { ok: true, value: rot(input, options.rot.variant) };
  }
}
