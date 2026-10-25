import { encodeHex } from '@/lib/tools/encode/hex';
import type { Random } from './random';

/*
 * MongoDB ObjectId (12 bytes): 4-byte Unix seconds, a 5-byte random value fixed per process,
 * and a 3-byte counter that starts at a random value.
 */

const COUNTER_LIMIT = 0x1000000;

export class ObjectIdGenerator {
  private readonly now: () => number;
  private readonly processValue: Uint8Array;
  private counter: number;

  constructor(random: Random, now: () => number = Date.now) {
    this.now = now;
    this.processValue = random.bytes(5);
    this.counter = random.int(COUNTER_LIMIT);
  }

  next(): string {
    const bytes = new Uint8Array(12);
    const seconds = Math.floor(this.now() / 1000) >>> 0;
    new DataView(bytes.buffer).setUint32(0, seconds);
    bytes.set(this.processValue, 4);
    this.counter = (this.counter + 1) % COUNTER_LIMIT;
    bytes[9] = this.counter >> 16;
    bytes[10] = (this.counter >> 8) & 0xff;
    bytes[11] = this.counter & 0xff;
    return encodeHex(bytes);
  }
}

export type DecodedObjectId = { seconds: number; random: string; counter: number };

export function decodeObjectId(text: string): DecodedObjectId | null {
  const hex = text.trim();
  if (!/^[0-9a-f]{24}$/i.test(hex)) return null;
  return {
    seconds: parseInt(hex.slice(0, 8), 16),
    random: hex.slice(8, 18).toLowerCase(),
    counter: parseInt(hex.slice(18), 16),
  };
}
