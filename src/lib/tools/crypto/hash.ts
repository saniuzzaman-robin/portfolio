import { encodeBase64 } from '@/lib/tools/encode/base64';
import { encodeHex } from '@/lib/tools/encode/hex';
import { hmacHasher, type HasherFactory } from './hasher';
import { Md5 } from './md5';
import { keccak, keccakRate, sha3 } from './sha3';
import { Crc32 } from './crc32';

export const HASH_ALGORITHMS = [
  'md5',
  'sha1',
  'sha256',
  'sha384',
  'sha512',
  'sha3-224',
  'sha3-256',
  'sha3-384',
  'sha3-512',
  'keccak-256',
  'keccak-512',
  'crc32',
] as const;
export type HashAlgorithm = (typeof HASH_ALGORITHMS)[number];

export const DEFAULT_HASH_ALGORITHMS: HashAlgorithm[] = [
  'md5',
  'sha1',
  'sha256',
  'sha512',
  'sha3-256',
  'crc32',
];

type HashInfo = {
  label: string;
  bits: number;
  /** HMAC block size in bytes; 0 when HMAC doesn't apply (CRC-32 isn't a hash function). */
  blockSize: number;
} & ({ subtle: 'SHA-1' | 'SHA-256' | 'SHA-384' | 'SHA-512' } | { create: HasherFactory });

const INFO: Record<HashAlgorithm, HashInfo> = {
  md5: { label: 'MD5', bits: 128, blockSize: 64, create: () => new Md5() },
  sha1: { label: 'SHA-1', bits: 160, blockSize: 64, subtle: 'SHA-1' },
  sha256: { label: 'SHA-256', bits: 256, blockSize: 64, subtle: 'SHA-256' },
  sha384: { label: 'SHA-384', bits: 384, blockSize: 128, subtle: 'SHA-384' },
  sha512: { label: 'SHA-512', bits: 512, blockSize: 128, subtle: 'SHA-512' },
  'sha3-224': { label: 'SHA3-224', bits: 224, blockSize: keccakRate(28), create: () => sha3(28) },
  'sha3-256': { label: 'SHA3-256', bits: 256, blockSize: keccakRate(32), create: () => sha3(32) },
  'sha3-384': { label: 'SHA3-384', bits: 384, blockSize: keccakRate(48), create: () => sha3(48) },
  'sha3-512': { label: 'SHA3-512', bits: 512, blockSize: keccakRate(64), create: () => sha3(64) },
  'keccak-256': {
    label: 'Keccak-256',
    bits: 256,
    blockSize: keccakRate(32),
    create: () => keccak(32),
  },
  'keccak-512': {
    label: 'Keccak-512',
    bits: 512,
    blockSize: keccakRate(64),
    create: () => keccak(64),
  },
  crc32: { label: 'CRC-32', bits: 32, blockSize: 0, create: () => new Crc32() },
};

export function hashLabel(algorithm: HashAlgorithm): string {
  return INFO[algorithm].label;
}

export function hashBits(algorithm: HashAlgorithm): number {
  return INFO[algorithm].bits;
}

export function supportsHmac(algorithm: HashAlgorithm): boolean {
  return INFO[algorithm].blockSize > 0;
}

export function isHashAlgorithm(value: unknown): value is HashAlgorithm {
  return HASH_ALGORITHMS.includes(value as HashAlgorithm);
}

/** Own (JavaScript) hashes are fed in chunks this size, yielding in between to keep the tab responsive. */
const CHUNK_BYTES = 4 * 1024 * 1024;

const yieldToEventLoop = () => new Promise<void>((resolve) => setTimeout(resolve, 0));

export type HashOptions = {
  /** When set, every digest is HMAC-<algorithm> with this key (CRC-32 is skipped). */
  hmacKey?: Uint8Array<ArrayBuffer>;
  /** Bytes processed so far by the JavaScript hashes, reported after each chunk. */
  onProgress?: (done: number) => void;
  signal?: AbortSignal;
};

export type Digests = Partial<Record<HashAlgorithm, Uint8Array<ArrayBuffer>>>;

async function subtleDigest(
  name: string,
  blockSize: number,
  data: Uint8Array<ArrayBuffer>,
  hmacKey?: Uint8Array<ArrayBuffer>
): Promise<Uint8Array<ArrayBuffer>> {
  if (!hmacKey) return new Uint8Array(await crypto.subtle.digest(name, data));
  // Web Crypto rejects empty HMAC keys; HMAC zero-pads keys to the block size, so a block of
  // zeros gives the same result.
  const raw = hmacKey.length > 0 ? hmacKey : new Uint8Array(blockSize);
  const key = await crypto.subtle.importKey('raw', raw, { name: 'HMAC', hash: name }, false, [
    'sign',
  ]);
  return new Uint8Array(await crypto.subtle.sign('HMAC', key, data));
}

/**
 * Digests `data` with every algorithm in one pass. SHA-1/SHA-2 use Web Crypto; the rest run
 * in JavaScript, chunk by chunk, so a large file never blocks the page for long.
 */
export async function hashAll(
  algorithms: readonly HashAlgorithm[],
  data: Uint8Array<ArrayBuffer>,
  { hmacKey, onProgress, signal }: HashOptions = {}
): Promise<Digests> {
  const wanted = algorithms.filter((algorithm) => !hmacKey || supportsHmac(algorithm));
  const native = Promise.all(
    wanted.flatMap((algorithm) => {
      const info = INFO[algorithm];
      if (!('subtle' in info)) return [];
      return [
        subtleDigest(info.subtle, info.blockSize, data, hmacKey).then(
          (digest) => [algorithm, digest] as const
        ),
      ];
    })
  );

  const own = wanted.flatMap((algorithm) => {
    const info = INFO[algorithm];
    if (!('create' in info)) return [];
    const hasher = hmacKey ? hmacHasher(info.create, info.blockSize, hmacKey) : info.create();
    return [[algorithm, hasher] as const];
  });
  for (let offset = 0; own.length > 0 && offset < data.length; offset += CHUNK_BYTES) {
    if (offset > 0) {
      await yieldToEventLoop();
      signal?.throwIfAborted();
    }
    const chunk = data.subarray(offset, offset + CHUNK_BYTES);
    for (const [, hasher] of own) hasher.update(chunk);
    onProgress?.(offset + chunk.length);
  }

  const digests: Digests = {};
  for (const [algorithm, hasher] of own) digests[algorithm] = hasher.digest();
  for (const [algorithm, digest] of await native) digests[algorithm] = digest;
  return digests;
}

export type DigestFormat = 'hex' | 'HEX' | 'base64';

export function formatDigest(digest: Uint8Array, format: DigestFormat): string {
  if (format === 'base64') return encodeBase64(digest);
  return encodeHex(digest, { upper: format === 'HEX' });
}

/**
 * Whether `expected` (pasted from a checksum file or a website) is this digest, as hex in any
 * case (an optional "0x" and spaces/colons allowed) or as base64 / base64url.
 */
export function digestMatches(expected: string, digest: Uint8Array): boolean {
  const compact = expected.trim();
  if (!compact) return false;
  const hex = compact.replace(/^0x/i, '').replace(/[\s:]/g, '').toLowerCase();
  if (hex === encodeHex(digest)) return true;
  const base64 = compact.replace(/\s/g, '').replace(/=+$/, '');
  return (
    base64 === encodeBase64(digest, { padding: false }) ||
    base64 === encodeBase64(digest, { urlSafe: true, padding: false })
  );
}
