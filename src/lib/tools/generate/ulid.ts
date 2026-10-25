import type { Random } from './random';

/*
 * ULID (github.com/ulid/spec): 48-bit Unix milliseconds + 80 random bits, as 26 Crockford
 * base32 characters (10 for the time, 16 for the randomness). Lexicographic order = time order.
 */

const ALPHABET = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
const MAX_TIME = 2 ** 48 - 1;
const RANDOM_BYTES = 10;

export function encodeUlidTime(ms: number): string {
  if (!Number.isInteger(ms) || ms < 0 || ms > MAX_TIME) {
    throw new RangeError(`A ULID time must be a whole number from 0 to 2^48 − 1, got ${ms}.`);
  }
  let out = '';
  let rest = ms;
  for (let i = 0; i < 10; i++) {
    out = ALPHABET[rest % 32] + out;
    rest = Math.floor(rest / 32);
  }
  return out;
}

/** 80 bits → 16 characters, 5 bits at a time from the most significant end. */
function encodeRandom(bytes: Uint8Array): string {
  let out = '';
  let buffer = 0;
  let bits = 0;
  for (const byte of bytes) {
    buffer = (buffer << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      bits -= 5;
      out += ALPHABET[(buffer >> bits) & 31];
    }
    buffer &= (1 << bits) - 1;
  }
  return out;
}

export function formatUlid(ms: number, randomness: Uint8Array): string {
  return encodeUlidTime(ms) + encodeRandom(randomness);
}

/** Adds one to a big-endian byte string; false when it wraps around to zero. */
function increment(bytes: Uint8Array): boolean {
  for (let i = bytes.length - 1; i >= 0; i--) {
    if (bytes[i] < 0xff) {
      bytes[i]++;
      return true;
    }
    bytes[i] = 0;
  }
  return false;
}

/**
 * Monotonic ULIDs: within one millisecond (or if the clock goes backwards) the randomness of the
 * previous ID is incremented instead of redrawn, so IDs keep sorting in creation order. On the
 * (practically impossible) 80-bit overflow the time moves on by one millisecond.
 */
export class UlidGenerator {
  private readonly random: Random;
  private readonly now: () => number;
  private lastMs = -1;
  private last = new Uint8Array(RANDOM_BYTES);

  constructor(random: Random, now: () => number = Date.now) {
    this.random = random;
    this.now = now;
  }

  next(): string {
    const now = this.now();
    if (now > this.lastMs) {
      this.lastMs = now;
      this.last = this.random.bytes(RANDOM_BYTES);
    } else if (!increment(this.last)) {
      this.lastMs++;
      this.last = this.random.bytes(RANDOM_BYTES);
    }
    return formatUlid(this.lastMs, this.last);
  }
}

export type DecodedUlid = { time: number; bytes: Uint8Array<ArrayBuffer> };

/** Decodes a ULID (any case) into its time and all 16 bytes; null if it isn't one. */
export function decodeUlid(text: string): DecodedUlid | null {
  const value = text.trim().toUpperCase();
  // The first character carries only 3 bits (128 = 26 × 5 − 2), so it can't exceed 7.
  if (!/^[0-7][0-9A-HJKMNP-TV-Z]{25}$/.test(value)) return null;
  const bytes = new Uint8Array(16);
  // 130 bits of base32 with the top 2 always zero: fill the 16 bytes from the least significant end.
  let buffer = 0;
  let bits = 0;
  let index = 15;
  for (let i = value.length - 1; i >= 0 && index >= 0; i--) {
    buffer |= ALPHABET.indexOf(value[i]) << bits;
    bits += 5;
    while (bits >= 8 && index >= 0) {
      bytes[index--] = buffer & 0xff;
      buffer >>>= 8;
      bits -= 8;
    }
  }
  if (index >= 0) bytes[index] = buffer & 0xff;
  let time = 0;
  for (let i = 0; i < 6; i++) time = time * 256 + bytes[i];
  return { time, bytes };
}
