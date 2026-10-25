import { encodeHex } from '@/lib/tools/encode/hex';
import { GREGORIAN_OFFSET, TICKS_PER_MS, formatUuid, parseUuid } from './uuid';
import { decodeUlid } from './ulid';
import { decodeObjectId } from './objectid';

export type UuidVariant = 'ncs' | 'rfc' | 'microsoft' | 'future';

export type InspectedId =
  | {
      kind: 'uuid';
      canonical: string;
      special: 'nil' | 'max' | null;
      variant: UuidVariant;
      /** Version nibble; only meaningful for the RFC variant. */
      version: number;
      /** Embedded time in Unix ms (v1, v6, v7). */
      time: number | null;
      /** v1/v6 timestamp in 100 ns ticks since 1582-10-15, for full precision. */
      ticks: bigint | null;
      clockSeq: number | null;
      node: string | null;
    }
  | { kind: 'ulid'; time: number; randomness: string; uuid: string }
  | { kind: 'objectid'; time: number; random: string; counter: number };

function variantOf(byte: number): UuidVariant {
  if ((byte & 0x80) === 0) return 'ncs';
  if ((byte & 0xc0) === 0x80) return 'rfc';
  if ((byte & 0xe0) === 0xc0) return 'microsoft';
  return 'future';
}

function readUint(bytes: Uint8Array, from: number, to: number): bigint {
  let value = 0;
  for (let i = from; i < to; i++) value = value * 256 + bytes[i];
  return BigInt(value);
}

const shl = (value: bigint, bits: number) => value << BigInt(bits);

function inspectUuid(bytes: Uint8Array): InspectedId {
  const variant = variantOf(bytes[8]);
  const version = bytes[6] >> 4;
  const special = bytes.every((byte) => byte === 0)
    ? 'nil'
    : bytes.every((byte) => byte === 0xff)
      ? 'max'
      : null;
  const base = {
    kind: 'uuid',
    canonical: formatUuid(bytes),
    special,
    variant,
    version,
    time: null,
    ticks: null,
    clockSeq: null,
    node: null,
  } as const;
  if (special || variant !== 'rfc') return base;

  if (version === 1 || version === 6) {
    const high = readUint(bytes, 0, 4);
    const mid = readUint(bytes, 4, 6);
    const low = BigInt.asUintN(12, readUint(bytes, 6, 8));
    const ticks =
      version === 1 ? shl(low, 48) | shl(mid, 32) | high : shl(high, 28) | shl(mid, 12) | low;
    return {
      ...base,
      ticks,
      time: Number((ticks - GREGORIAN_OFFSET) / TICKS_PER_MS),
      clockSeq: ((bytes[8] & 0x3f) << 8) | bytes[9],
      node: encodeHex(bytes.subarray(10), { separator: 'colon' }),
    };
  }
  if (version === 7) return { ...base, time: Number(readUint(bytes, 0, 6)) };
  return base;
}

/** Recognizes a UUID (any common spelling), ULID or ObjectId and takes it apart. */
export function inspectId(text: string): InspectedId | null {
  const uuid = parseUuid(text);
  if (uuid) return inspectUuid(uuid);
  const ulid = decodeUlid(text);
  if (ulid) {
    return {
      kind: 'ulid',
      time: ulid.time,
      randomness: encodeHex(ulid.bytes.subarray(6)),
      uuid: formatUuid(ulid.bytes),
    };
  }
  const objectId = decodeObjectId(text);
  if (objectId) {
    return {
      kind: 'objectid',
      time: objectId.seconds * 1000,
      random: objectId.random,
      counter: objectId.counter,
    };
  }
  return null;
}
