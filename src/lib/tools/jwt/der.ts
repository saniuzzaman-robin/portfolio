import { decodeBase64, encodeBase64 } from '@/lib/tools/encode/base64';

/** Minimal DER (ASN.1) reading and writing: just enough to unwrap certificates and PKCS#1 keys. */

export class KeyFormatError extends Error {}

/** One DER element: `bytes[start..end]` is the whole element, `bytes[contentStart..end]` its value. */
export type Tlv = { tag: number; start: number; contentStart: number; end: number };

export const TAG = {
  integer: 0x02,
  bitString: 0x03,
  octetString: 0x04,
  null: 0x05,
  oid: 0x06,
  sequence: 0x30,
  /** `[0]` explicit context tag (the X.509 version field). */
  context0: 0xa0,
} as const;

export function readTlv(bytes: Uint8Array, start: number, limit = bytes.length): Tlv {
  if (start + 2 > limit) throw new KeyFormatError('The DER data ends unexpectedly.');
  const tag = bytes[start];
  let length = bytes[start + 1];
  let contentStart = start + 2;
  if (length & 0x80) {
    const count = length & 0x7f;
    if (count === 0 || count > 4 || contentStart + count > limit) {
      throw new KeyFormatError('The DER data has an invalid length.');
    }
    length = 0;
    for (let i = 0; i < count; i++) length = length * 256 + bytes[contentStart + i];
    contentStart += count;
  }
  const end = contentStart + length;
  if (end > limit) throw new KeyFormatError('The DER data ends unexpectedly.');
  return { tag, start, contentStart, end };
}

/** The elements inside a constructed element (a SEQUENCE, or an explicit context tag). */
export function children(bytes: Uint8Array, parent: Tlv): Tlv[] {
  const items: Tlv[] = [];
  let position = parent.contentStart;
  while (position < parent.end) {
    const item = readTlv(bytes, position, parent.end);
    items.push(item);
    position = item.end;
  }
  return items;
}

function expectTag(item: Tlv | undefined, tag: number, what: string): Tlv {
  if (!item || item.tag !== tag) throw new KeyFormatError(`Expected ${what} in the DER data.`);
  return item;
}

function encodeLength(length: number): number[] {
  if (length < 0x80) return [length];
  const bytes: number[] = [];
  for (let rest = length; rest > 0; rest = Math.floor(rest / 256)) bytes.unshift(rest & 0xff);
  return [0x80 | bytes.length, ...bytes];
}

export function encodeTlv(tag: number, ...content: Uint8Array[]): Uint8Array<ArrayBuffer> {
  const length = content.reduce((sum, part) => sum + part.length, 0);
  const header = [tag, ...encodeLength(length)];
  const out = new Uint8Array(header.length + length);
  out.set(header);
  let offset = header.length;
  for (const part of content) {
    out.set(part, offset);
    offset += part.length;
  }
  return out;
}

/** `rsaEncryption` (1.2.840.113549.1.1.1) with NULL parameters. */
const RSA_ALGORITHM = encodeTlv(
  TAG.sequence,
  new Uint8Array([0x06, 0x09, 0x2a, 0x86, 0x48, 0x86, 0xf7, 0x0d, 0x01, 0x01, 0x01]),
  new Uint8Array([TAG.null, 0x00])
);

/** PKCS#1 `RSAPublicKey` → SubjectPublicKeyInfo, the format Web Crypto imports. */
export function rsaPublicKeyToSpki(pkcs1: Uint8Array): Uint8Array<ArrayBuffer> {
  return encodeTlv(
    TAG.sequence,
    RSA_ALGORITHM,
    encodeTlv(TAG.bitString, new Uint8Array([0]), pkcs1)
  );
}

/** PKCS#1 `RSAPrivateKey` → PKCS#8 `PrivateKeyInfo`. */
export function rsaPrivateKeyToPkcs8(pkcs1: Uint8Array): Uint8Array<ArrayBuffer> {
  return encodeTlv(
    TAG.sequence,
    new Uint8Array([TAG.integer, 0x01, 0x00]),
    RSA_ALGORITHM,
    encodeTlv(TAG.octetString, pkcs1)
  );
}

/** The SubjectPublicKeyInfo inside an X.509 certificate, as its own DER element. */
export function certificateSpki(der: Uint8Array): Uint8Array<ArrayBuffer> {
  const certificate = expectTag(readTlv(der, 0), TAG.sequence, 'a certificate');
  const tbs = expectTag(children(der, certificate)[0], TAG.sequence, 'the certificate body');
  const fields = children(der, tbs);
  // version [0] is optional; then serial, signature algorithm, issuer, validity, subject, key.
  const keyIndex = fields[0]?.tag === TAG.context0 ? 6 : 5;
  const spki = expectTag(fields[keyIndex], TAG.sequence, 'the certificate’s public key');
  return der.slice(spki.start, spki.end);
}

export type PemBlock = { label: string; der: Uint8Array<ArrayBuffer> };

const PEM_BLOCK = /-----BEGIN ([A-Z0-9 ]+)-----([\s\S]*?)-----END \1-----/;

/** The first PEM block in `text`, or null if there is none. */
export function parsePem(text: string): PemBlock | null {
  const match = PEM_BLOCK.exec(text);
  if (!match) return null;
  const decoded = decodeBase64(match[2]);
  if (!decoded.ok) {
    throw new KeyFormatError(`The ${match[1]} block is not valid base64: ${decoded.error.message}`);
  }
  return { label: match[1], der: decoded.value.bytes };
}

export function toPem(label: string, der: ArrayBuffer | Uint8Array): string {
  const body = encodeBase64(der instanceof Uint8Array ? der : new Uint8Array(der), {
    lineLength: 64,
  });
  return `-----BEGIN ${label}-----\n${body}\n-----END ${label}-----`;
}
