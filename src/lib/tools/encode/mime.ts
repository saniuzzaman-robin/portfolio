export type FileType = { mime: string; extension: string };

type Signature = FileType & {
  /** Bytes to match; `null` matches any byte. */
  bytes: (number | null)[];
  offset?: number;
};

const ascii = (text: string) => Array.from(text, (char) => char.charCodeAt(0));

// Most specific first (RIFF containers before anything shorter).
const SIGNATURES: Signature[] = [
  { mime: 'image/png', extension: 'png', bytes: [0x89, ...ascii('PNG\r\n\x1a\n')] },
  { mime: 'image/jpeg', extension: 'jpg', bytes: [0xff, 0xd8, 0xff] },
  { mime: 'image/gif', extension: 'gif', bytes: ascii('GIF8') },
  {
    mime: 'image/webp',
    extension: 'webp',
    bytes: [...ascii('RIFF'), null, null, null, null, ...ascii('WEBP')],
  },
  {
    mime: 'audio/wav',
    extension: 'wav',
    bytes: [...ascii('RIFF'), null, null, null, null, ...ascii('WAVE')],
  },
  {
    mime: 'video/x-msvideo',
    extension: 'avi',
    bytes: [...ascii('RIFF'), null, null, null, null, ...ascii('AVI ')],
  },
  { mime: 'image/avif', extension: 'avif', bytes: ascii('ftypavif'), offset: 4 },
  { mime: 'image/heic', extension: 'heic', bytes: ascii('ftypheic'), offset: 4 },
  { mime: 'video/quicktime', extension: 'mov', bytes: ascii('ftypqt'), offset: 4 },
  { mime: 'video/mp4', extension: 'mp4', bytes: ascii('ftyp'), offset: 4 },
  { mime: 'image/bmp', extension: 'bmp', bytes: ascii('BM') },
  { mime: 'image/x-icon', extension: 'ico', bytes: [0x00, 0x00, 0x01, 0x00] },
  { mime: 'image/tiff', extension: 'tiff', bytes: [0x49, 0x49, 0x2a, 0x00] },
  { mime: 'image/tiff', extension: 'tiff', bytes: [0x4d, 0x4d, 0x00, 0x2a] },
  { mime: 'application/pdf', extension: 'pdf', bytes: ascii('%PDF-') },
  { mime: 'application/zip', extension: 'zip', bytes: [0x50, 0x4b, 0x03, 0x04] },
  { mime: 'application/gzip', extension: 'gz', bytes: [0x1f, 0x8b] },
  {
    mime: 'application/x-7z-compressed',
    extension: '7z',
    bytes: [0x37, 0x7a, 0xbc, 0xaf, 0x27, 0x1c],
  },
  { mime: 'application/vnd.rar', extension: 'rar', bytes: ascii('Rar!\x1a\x07') },
  { mime: 'application/wasm', extension: 'wasm', bytes: [0x00, ...ascii('asm')] },
  { mime: 'font/woff', extension: 'woff', bytes: ascii('wOFF') },
  { mime: 'font/woff2', extension: 'woff2', bytes: ascii('wOF2') },
  { mime: 'font/ttf', extension: 'ttf', bytes: [0x00, 0x01, 0x00, 0x00, 0x00] },
  { mime: 'font/otf', extension: 'otf', bytes: ascii('OTTO') },
  { mime: 'audio/mpeg', extension: 'mp3', bytes: ascii('ID3') },
  { mime: 'audio/ogg', extension: 'ogg', bytes: ascii('OggS') },
  { mime: 'audio/flac', extension: 'flac', bytes: ascii('fLaC') },
  { mime: 'video/webm', extension: 'webm', bytes: [0x1a, 0x45, 0xdf, 0xa3] },
];

function matches(bytes: Uint8Array, { bytes: expected, offset = 0 }: Signature): boolean {
  if (bytes.length < offset + expected.length) return false;
  return expected.every((byte, i) => byte === null || bytes[offset + i] === byte);
}

const SVG = /^\s*(?:<\?xml[^>]*>\s*)?(?:<!--[\s\S]*?-->\s*)*(?:<!DOCTYPE svg[^>]*>\s*)?<svg[\s>]/i;

/** File type from the content's magic bytes (and an SVG sniff); null when unknown. */
export function detectFileType(bytes: Uint8Array): FileType | null {
  const signature = SIGNATURES.find((candidate) => matches(bytes, candidate));
  if (signature) return { mime: signature.mime, extension: signature.extension };
  const head = new TextDecoder().decode(bytes.subarray(0, 1024));
  if (SVG.test(head)) return { mime: 'image/svg+xml', extension: 'svg' };
  return null;
}

/** Raster/vector formats an <img> can show. */
export function isPreviewableImage(mime: string): boolean {
  return /^image\/(?:png|jpeg|gif|webp|avif|bmp|x-icon|svg\+xml)$/.test(mime);
}

const EXTENSIONS = new Map(SIGNATURES.map((signature) => [signature.mime, signature.extension]));
EXTENSIONS.set('image/svg+xml', 'svg');
EXTENSIONS.set('text/plain', 'txt');
EXTENSIONS.set('application/json', 'json');
EXTENSIONS.set('text/html', 'html');
EXTENSIONS.set('text/css', 'css');

/** A file extension for a MIME type, `bin` when unknown. */
export function extensionFor(mime: string): string {
  return EXTENSIONS.get(mime) ?? 'bin';
}
