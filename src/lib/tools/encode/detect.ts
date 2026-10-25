import { decodeBase64, parseDataUri } from './base64';
import { decodeBinary } from './binary';
import { decodeHex } from './hex';
import { detectFileType } from './mime';
import { decodeQuotedPrintableBytes } from './quoted-printable';
import { decodeUrlBytes } from './url';
import { invalidUtf8Offset } from './utf8';
import type { TextCodec } from './codecs';

/** What pasted text most likely is: a text codec to decode with, or a data URI for File mode. */
export type Detection = TextCodec | 'file';

/** Only the start of large inputs is sniffed, so detection stays instant. */
const SAMPLE_LENGTH = 4096;

/**
 * Valid UTF-8 that is mostly printable, i.e. something a person would call text. A `partial`
 * sample may end in the middle of a character.
 */
function looksLikeText(bytes: Uint8Array, partial = false): boolean {
  const invalid = invalidUtf8Offset(bytes);
  if (bytes.length === 0 || (invalid >= 0 && !(partial && invalid >= bytes.length - 3))) {
    return false;
  }
  let control = 0;
  for (const byte of bytes) {
    if (byte < 0x20 && byte !== 0x09 && byte !== 0x0a && byte !== 0x0d) control++;
  }
  return control / bytes.length < 0.05;
}

/**
 * Guesses the encoding of `text` so the tool can offer to decode it. Conservative: returns
 * null unless the input is unambiguous and decodes cleanly.
 */
export function detectEncoding(text: string): Detection | null {
  const trimmed = text.trim();
  const sample = trimmed.slice(0, SAMPLE_LENGTH);
  const partial = trimmed.length > SAMPLE_LENGTH;
  if (sample.length < 4) return null;

  const dataUri = parseDataUri(sample);
  if (dataUri?.base64) return 'file';
  if (/(?:^|[.\s@])xn--[a-z0-9-]+/i.test(sample)) return 'punycode';
  if (/\\u[0-9a-f]{4}|\\u\{[0-9a-f]+\}/i.test(sample)) return 'unicode';
  if (/&(?:#\d+|#x[0-9a-f]+|[a-z][a-z0-9]+);/i.test(sample)) return 'html';

  const compact = sample.replace(/\s+/g, '');
  if (/^[01]+$/.test(compact) && compact.length >= 8 && decodeBinary(sample).ok) return 'binary';

  // Hex needs a letter and a digit (or byte separators), so plain numbers aren't taken for hex.
  if (/^(?:0x)?[0-9a-f]+$/i.test(compact.replace(/[:,-]|0x/gi, ''))) {
    const separated = /^[0-9a-f]{2}(?:[\s:,-][0-9a-f]{2})+$/i.test(sample);
    const mixed = /[a-f]/i.test(compact) && /\d/.test(compact);
    if ((separated || mixed) && compact.length >= 8 && decodeHex(sample).ok) return 'hex';
  }

  if (/%[0-9a-f]{2}/i.test(sample) && !/\s/.test(sample)) {
    const decoded = decodeUrlBytes(sample, 'component');
    if (decoded.ok && looksLikeText(decoded.value.bytes, partial)) return 'url';
  }

  if (
    /=[0-9A-F]{2}/.test(sample) &&
    (/=\r?\n/.test(sample) || sample.match(/=[0-9A-F]{2}/g)!.length > 2)
  ) {
    const decoded = decodeQuotedPrintableBytes(sample);
    if (decoded.ok && looksLikeText(decoded.value.bytes, partial)) return 'qp';
  }

  if (/^[A-Z2-7]+=*$/.test(compact) && /[2-7]/.test(compact) && compact.length % 8 === 0) {
    return 'base32';
  }

  if (/^[A-Za-z0-9+/_-]+={0,2}$/.test(compact) && compact.length >= 8) {
    // A cut-off sample is trimmed to whole groups so it still decodes.
    const groups = partial ? compact.slice(0, compact.length - (compact.length % 4)) : compact;
    const decoded = decodeBase64(groups);
    if (decoded.ok) {
      const { bytes } = decoded.value;
      if (detectFileType(bytes)) return 'file';
      const varied = /[0-9+/=]|[A-Z].*[a-z]|[a-z].*[A-Z]/.test(compact);
      if (varied && looksLikeText(bytes, partial)) return 'base64';
    }
  }
  return null;
}
