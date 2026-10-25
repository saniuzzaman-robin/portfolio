import { decodeBase64, parseDataUri } from './base64';
import { detectFileType, type FileType } from './mime';
import { decodeUrlBytes } from './url';
import type { CodecResult } from './types';

export type DecodedFile = {
  bytes: Uint8Array<ArrayBuffer>;
  /** MIME type named by a data URI, if the input was one. */
  declared: string | null;
  /** MIME type recognized from the content. */
  detected: FileType | null;
};

/** Base64 or a `data:` URI (base64 or percent-encoded) → the file's bytes and type. */
export function decodeFilePayload(text: string): CodecResult<DecodedFile> {
  const uri = parseDataUri(text);
  const decoded = !uri
    ? decodeBase64(text)
    : uri.base64
      ? decodeBase64(uri.data, false, uri.dataOffset)
      : decodeUrlBytes(uri.data, 'component');
  if (!decoded.ok) {
    // Percent-decoding reports offsets within the payload; shift them to the whole text.
    if (uri && !uri.base64) {
      const { error } = decoded;
      return {
        ok: false,
        error: { ...error, from: error.from + uri.dataOffset, to: error.to + uri.dataOffset },
      };
    }
    return decoded;
  }
  const { bytes } = decoded.value;
  return {
    ok: true,
    value: { bytes, declared: uri?.mime ?? null, detected: detectFileType(bytes) },
  };
}
