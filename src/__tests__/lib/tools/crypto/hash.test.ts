// @vitest-environment node
// Web Crypto (crypto.subtle) is only available in the Node environment, not in jsdom.
import { createHash, createHmac } from 'node:crypto';
import { describe, it, expect } from 'vitest';
import {
  HASH_ALGORITHMS,
  digestMatches,
  formatDigest,
  hashAll,
  type HashAlgorithm,
} from '@/lib/tools/crypto/hash';
import { md5 } from '@/lib/tools/crypto/md5';
import { encodeHex } from '@/lib/tools/encode/hex';

const encoder = new TextEncoder();
const bytes = (text: string) => encoder.encode(text);

async function hexDigest(
  algorithm: HashAlgorithm,
  data: Uint8Array<ArrayBuffer>,
  hmacKey?: Uint8Array<ArrayBuffer>
) {
  const digests = await hashAll([algorithm], data, { hmacKey });
  return encodeHex(digests[algorithm]!);
}

/** Node (OpenSSL) names for the algorithms it also has, for cross-checking. */
const NODE_NAMES: Partial<Record<HashAlgorithm, string>> = {
  md5: 'md5',
  sha1: 'sha1',
  sha256: 'sha256',
  sha384: 'sha384',
  sha512: 'sha512',
  'sha3-224': 'sha3-224',
  'sha3-256': 'sha3-256',
  'sha3-384': 'sha3-384',
  'sha3-512': 'sha3-512',
};

/** Deterministic pseudo-random bytes. */
function filler(length: number): Uint8Array<ArrayBuffer> {
  const out = new Uint8Array(length);
  let x = 0x12345678;
  for (let i = 0; i < length; i++) {
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    out[i] = x & 0xff;
  }
  return out;
}

describe('MD5 (RFC 1321 §A.5)', () => {
  it.each([
    ['', 'd41d8cd98f00b204e9800998ecf8427e'],
    ['a', '0cc175b9c0f1b6a831c399e269772661'],
    ['abc', '900150983cd24fb0d6963f7d28e17f72'],
    ['message digest', 'f96b697d7cb7938d525a2f31aaf161d0'],
    ['abcdefghijklmnopqrstuvwxyz', 'c3fcd3d76192e4007dfb496cca67e13b'],
    [
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
      'd174ab98d277d9f5a5611c2c9f419d9f',
    ],
    ['1234567890'.repeat(8), '57edf4a22be3c955ac49da2e2107b67a'],
  ])('md5(%j)', (input, expected) => {
    expect(encodeHex(md5(bytes(input)))).toBe(expected);
  });
});

describe('SHA-3 (FIPS 202 examples)', () => {
  it.each([
    ['sha3-224', '', '6b4e03423667dbb73b6e15454f0eb1abd4597f9a1b078e3f5b5a6bc7'],
    ['sha3-256', '', 'a7ffc6f8bf1ed76651c14756a061d662f580ff4de43b49fa82d80a4b80f8434a'],
    ['sha3-256', 'abc', '3a985da74fe225b2045c172d6bd390bd855f086e3e9d525b46bfe24511431532'],
    ['sha3-224', 'abc', 'e642824c3f8cf24ad09234ee7d3c766fc9a3a5168d0c94ad73b46fdf'],
    [
      'sha3-384',
      'abc',
      'ec01498288516fc926459f58e2c6ad8df9b473cb0fc08c2596da7cf0e49be4b298d88cea927ac7f539f1edf228376d25',
    ],
    [
      'sha3-512',
      'abc',
      'b751850b1a57168a5693cd924b6b096e08f621827444f70d884f5d0240d2712e10e116e9192af3c91a7ec57647e3934057340b4cf408d5a56592f8274eec53f0',
    ],
  ] as const)('%s(%j)', async (algorithm, input, expected) => {
    expect(await hexDigest(algorithm, bytes(input))).toBe(expected);
  });
});

describe('Keccak (pre-standard padding)', () => {
  it.each([
    ['', 'c5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470'],
    ['abc', '4e03657aea45a94fc7d47ba826c8d667c0d1e6e33a64a036ec44f58fa12d6c45'],
  ])('keccak-256(%j)', async (input, expected) => {
    expect(await hexDigest('keccak-256', bytes(input))).toBe(expected);
  });
});

describe('CRC-32', () => {
  it('matches the standard check value', async () => {
    expect(await hexDigest('crc32', bytes('123456789'))).toBe('cbf43926');
    expect(await hexDigest('crc32', bytes(''))).toBe('00000000');
  });
});

describe('hashAll', () => {
  // Lengths around every block and rate boundary (64, 72, 104, 128, 136, 144 bytes).
  const lengths = [0, 1, 55, 56, 63, 64, 65, 71, 72, 73, 103, 104, 111, 112, 127, 128, 135, 136];
  const nodeAlgorithms = HASH_ALGORITHMS.filter((algorithm) => NODE_NAMES[algorithm]);

  it.each(lengths)('matches node:crypto for %i bytes', async (length) => {
    const data = filler(length);
    const digests = await hashAll(nodeAlgorithms, data);
    for (const algorithm of nodeAlgorithms) {
      const expected = createHash(NODE_NAMES[algorithm]!).update(data).digest('hex');
      expect(encodeHex(digests[algorithm]!), algorithm).toBe(expected);
    }
  });

  it('hashes input larger than one chunk and reports progress', async () => {
    const data = filler(4 * 1024 * 1024 + 1000);
    const progress: number[] = [];
    const digests = await hashAll(['md5', 'sha3-256', 'sha256'], data, {
      onProgress: (done) => progress.push(done),
    });
    expect(encodeHex(digests.md5!)).toBe(createHash('md5').update(data).digest('hex'));
    expect(encodeHex(digests['sha3-256']!)).toBe(createHash('sha3-256').update(data).digest('hex'));
    expect(encodeHex(digests.sha256!)).toBe(createHash('sha256').update(data).digest('hex'));
    expect(progress).toEqual([4 * 1024 * 1024, data.length]);
  });

  it('stops when aborted between chunks', async () => {
    const controller = new AbortController();
    const run = hashAll(['md5'], filler(9 * 1024 * 1024), {
      signal: controller.signal,
      onProgress: () => controller.abort(),
    });
    await expect(run).rejects.toThrow();
  });
});

describe('HMAC', () => {
  it.each([
    // RFC 2202 test cases 1 and 2.
    ['md5', new Uint8Array(16).fill(0x0b), 'Hi There', '9294727a3638bb1c13f48ef8158bfc9d'],
    ['md5', bytes('Jefe'), 'what do ya want for nothing?', '750c783e6ab0b503eaa86e310a5db738'],
    // RFC 4231 test case 2.
    [
      'sha256',
      bytes('Jefe'),
      'what do ya want for nothing?',
      '5bdcc146bf60754e6a042426089575c75a003f089d2739839dec58b964ec3843',
    ],
  ] as const)('HMAC-%s published vector', async (algorithm, key, message, expected) => {
    expect(await hexDigest(algorithm, bytes(message), new Uint8Array(key))).toBe(expected);
  });

  it.each(['sha3-224', 'sha3-256', 'sha3-384', 'sha3-512', 'sha1', 'sha512'] as const)(
    'HMAC-%s matches node:crypto, including keys longer than a block and empty keys',
    async (algorithm) => {
      for (const keyLength of [0, 20, 200]) {
        const key = filler(keyLength);
        const data = bytes('The quick brown fox jumps over the lazy dog');
        const expected = createHmac(NODE_NAMES[algorithm]!, key).update(data).digest('hex');
        expect(await hexDigest(algorithm, data, key), `${keyLength}-byte key`).toBe(expected);
      }
    }
  );

  it('skips CRC-32, which has no HMAC', async () => {
    const digests = await hashAll(['crc32', 'md5'], bytes('x'), { hmacKey: bytes('k') });
    expect(digests.crc32).toBeUndefined();
    expect(digests.md5).toBeDefined();
  });
});

describe('formatDigest and digestMatches', () => {
  const digest = md5(bytes('abc'));

  it('formats hex, uppercase hex and base64', () => {
    expect(formatDigest(digest, 'hex')).toBe('900150983cd24fb0d6963f7d28e17f72');
    expect(formatDigest(digest, 'HEX')).toBe('900150983CD24FB0D6963F7D28E17F72');
    expect(formatDigest(digest, 'base64')).toBe('kAFQmDzST7DWlj99KOF/cg==');
  });

  it.each([
    '900150983cd24fb0d6963f7d28e17f72',
    '  900150983CD24FB0D6963F7D28E17F72\n',
    '0x900150983cd24fb0d6963f7d28e17f72',
    '90:01:50:98:3c:d2:4f:b0:d6:96:3f:7d:28:e1:7f:72',
    'kAFQmDzST7DWlj99KOF/cg==',
    'kAFQmDzST7DWlj99KOF_cg',
  ])('accepts %j', (expected) => {
    expect(digestMatches(expected, digest)).toBe(true);
  });

  it.each(['', '900150983cd24fb0d6963f7d28e17f73', 'abc'])('rejects %j', (expected) => {
    expect(digestMatches(expected, digest)).toBe(false);
  });
});
