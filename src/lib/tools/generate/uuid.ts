import { md5 } from '@/lib/tools/crypto/md5';
import { concatBytes } from '@/lib/tools/crypto/bytes';
import { encodeHex } from '@/lib/tools/encode/hex';
import type { Random } from './random';

/*
 * UUIDs per RFC 9562. Bytes are big-endian, as in the canonical text form. Time-based versions
 * come from a stateful generator so IDs made in the same millisecond still sort in creation order.
 */

export const NIL_UUID = '00000000-0000-0000-0000-000000000000';
export const MAX_UUID = 'ffffffff-ffff-ffff-ffff-ffffffffffff';

/** RFC 9562 §6.6 namespaces for v3/v5. */
export const UUID_NAMESPACES = {
  dns: '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
  url: '6ba7b811-9dad-11d1-80b4-00c04fd430c8',
  oid: '6ba7b812-9dad-11d1-80b4-00c04fd430c8',
  x500: '6ba7b814-9dad-11d1-80b4-00c04fd430c8',
} as const;
export type UuidNamespace = keyof typeof UUID_NAMESPACES;

/** 100 ns intervals from the Gregorian epoch (1582-10-15) to the Unix epoch. */
export const GREGORIAN_OFFSET = BigInt('122192928000000000');
export const TICKS_PER_MS = BigInt(10_000);

/** `bits` bits of a 60-bit timestamp, starting `shift` bits from the least significant end. */
function tickBits(ticks: bigint, shift: number, bits: number): number {
  return Number(BigInt.asUintN(bits, ticks >> BigInt(shift)));
}

/** Lowercase, hyphenated 8-4-4-4-12 form. */
export function formatUuid(bytes: Uint8Array): string {
  const hex = encodeHex(bytes);
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

/** Accepts any case, with or without hyphens, `{…}` braces or a `urn:uuid:` prefix. */
export function parseUuid(text: string): Uint8Array<ArrayBuffer> | null {
  let value = text.trim();
  if (/^urn:uuid:/i.test(value)) value = value.slice(9);
  else if (value.startsWith('{') && value.endsWith('}')) value = value.slice(1, -1);
  const hex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)
    ? value.replaceAll('-', '')
    : value;
  if (!/^[0-9a-f]{32}$/i.test(hex)) return null;
  const bytes = new Uint8Array(16);
  for (let i = 0; i < 16; i++) bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  return bytes;
}

export type UuidStyle = { upper: boolean; hyphens: boolean; braces: boolean };

/** Restyles a canonical UUID string. */
export function styleUuid(canonical: string, { upper, hyphens, braces }: UuidStyle): string {
  let text = hyphens ? canonical : canonical.replaceAll('-', '');
  if (upper) text = text.toUpperCase();
  return braces ? `{${text}}` : text;
}

/** Sets the version nibble and the RFC 9562 variant bits (10xx) in place. */
function stamp(bytes: Uint8Array, version: number): Uint8Array {
  bytes[6] = (bytes[6] & 0x0f) | (version << 4);
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  return bytes;
}

/** Writes `value` (up to 2^53) big-endian into `length` bytes at `offset`. */
function writeUint(bytes: Uint8Array, offset: number, length: number, value: number) {
  let rest = value;
  for (let i = length - 1; i >= 0; i--) {
    bytes[offset + i] = rest % 256;
    rest = Math.floor(rest / 256);
  }
}

export function uuidV4(random: Random): Uint8Array {
  return stamp(random.bytes(16), 4);
}

function nameBased(digest: Uint8Array, version: number): Uint8Array {
  return stamp(digest.slice(0, 16), version);
}

const encoder = new TextEncoder();

export function uuidV3(namespace: Uint8Array, name: string): Uint8Array {
  return nameBased(md5(concatBytes(namespace, encoder.encode(name))), 3);
}

export async function uuidV5(namespace: Uint8Array, name: string): Promise<Uint8Array> {
  const data = concatBytes(namespace, encoder.encode(name));
  return nameBased(new Uint8Array(await crypto.subtle.digest('SHA-1', data)), 5);
}

/** v1 layout from a 60-bit Gregorian timestamp, a 14-bit clock sequence and a 6-byte node. */
export function uuidV1FromFields(ticks: bigint, clockSeq: number, node: Uint8Array): Uint8Array {
  const bytes = new Uint8Array(16);
  writeUint(bytes, 0, 4, tickBits(ticks, 0, 32));
  writeUint(bytes, 4, 2, tickBits(ticks, 32, 16));
  writeUint(bytes, 6, 2, tickBits(ticks, 48, 12));
  writeUint(bytes, 8, 2, clockSeq & 0x3fff);
  bytes.set(node, 10);
  return stamp(bytes, 1);
}

/** v6: the v1 fields with the timestamp reordered most significant first, so IDs sort by time. */
export function uuidV6FromFields(ticks: bigint, clockSeq: number, node: Uint8Array): Uint8Array {
  const bytes = new Uint8Array(16);
  writeUint(bytes, 0, 4, tickBits(ticks, 28, 32));
  writeUint(bytes, 4, 2, tickBits(ticks, 12, 16));
  writeUint(bytes, 6, 2, tickBits(ticks, 0, 12));
  writeUint(bytes, 8, 2, clockSeq & 0x3fff);
  bytes.set(node, 10);
  return stamp(bytes, 6);
}

/** v7 layout: 48-bit Unix milliseconds, then 74 bits split into 12-bit `rand_a` and 62-bit `rand_b`. */
export function uuidV7FromFields(unixMs: number, tail: Uint8Array): Uint8Array {
  const bytes = new Uint8Array(16);
  writeUint(bytes, 0, 6, unixMs);
  bytes.set(tail.subarray(0, 10), 6);
  return stamp(bytes, 7);
}

/** Counter bits in a v7: all 12 of `rand_a` plus the top 30 of `rand_b` (RFC 9562 §6.2, method 1). */
const V7_COUNTER_BITS = 42;
const V7_COUNTER_LIMIT = 2 ** V7_COUNTER_BITS;

/**
 * Stateful generator for the time-based versions. Within one millisecond, v1/v6 borrow
 * sub-millisecond ticks and v7 increments a 42-bit counter seeded at random (top bit clear, so
 * it has room to grow); if the clock goes backwards the last timestamp is reused.
 */
export class TimeUuidGenerator {
  private readonly random: Random;
  private readonly now: () => number;
  /** v1/v6 node: random, with the multicast bit set so it can't clash with a real MAC (§6.10). */
  private readonly node: Uint8Array;
  private readonly clockSeq: number;
  private lastTicks = BigInt(-1);
  private lastMs = -1;
  private counter = 0;

  constructor(random: Random, now: () => number = Date.now) {
    this.random = random;
    this.now = now;
    this.node = random.bytes(6);
    this.node[0] |= 0x01;
    this.clockSeq = random.int(0x4000);
  }

  private nextTicks(): bigint {
    let ticks = BigInt(this.now()) * TICKS_PER_MS + GREGORIAN_OFFSET;
    if (ticks <= this.lastTicks) ticks = this.lastTicks + BigInt(1);
    this.lastTicks = ticks;
    return ticks;
  }

  v1(): Uint8Array {
    return uuidV1FromFields(this.nextTicks(), this.clockSeq, this.node);
  }

  v6(): Uint8Array {
    return uuidV6FromFields(this.nextTicks(), this.clockSeq, this.node);
  }

  v7(): Uint8Array {
    const now = this.now();
    if (now > this.lastMs) {
      this.lastMs = now;
      this.counter = this.random.bits(V7_COUNTER_BITS - 1);
    } else if (++this.counter >= V7_COUNTER_LIMIT) {
      this.lastMs++;
      this.counter = this.random.bits(V7_COUNTER_BITS - 1);
    }
    // Bytes 6–15: the counter's top 12 bits fill rand_a (beside the version nibble), its low 30
    // bits start rand_b (beside the variant bits), and the last 4 bytes are random.
    const tail = new Uint8Array(10);
    const counterHi = Math.floor(this.counter / 2 ** 30);
    tail[0] = (counterHi >> 8) & 0x0f;
    tail[1] = counterHi & 0xff;
    writeUint(tail, 2, 4, this.counter % 2 ** 30);
    tail.set(this.random.bytes(4), 6);
    return uuidV7FromFields(this.lastMs, tail);
  }
}

export function nilUuid(): Uint8Array {
  return new Uint8Array(16);
}

export function maxUuid(): Uint8Array {
  return new Uint8Array(16).fill(0xff);
}
