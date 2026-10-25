/** Fills the array with random bytes. Swappable so tests can be deterministic. */
export type RandomSource = (bytes: Uint8Array<ArrayBuffer>) => void;

/** `crypto.getRandomValues` refuses more than 65,536 bytes per call. */
const MAX_CHUNK = 65_536;

export const cryptoSource: RandomSource = (bytes) => {
  for (let offset = 0; offset < bytes.length; offset += MAX_CHUNK) {
    crypto.getRandomValues(bytes.subarray(offset, offset + MAX_CHUNK));
  }
};

const POOL_SIZE = 1024;
const UINT32_RANGE = 2 ** 32;

/**
 * Buffered CSPRNG. `int(n)` uses rejection sampling, so every value in `[0, n)` is exactly as
 * likely (no modulo bias).
 */
export class Random {
  private readonly source: RandomSource;
  private pool = new Uint8Array(POOL_SIZE);
  private position = POOL_SIZE;

  constructor(source: RandomSource = cryptoSource) {
    this.source = source;
  }

  bytes(length: number): Uint8Array<ArrayBuffer> {
    const out = new Uint8Array(length);
    this.source(out);
    return out;
  }

  uint32(): number {
    if (this.position + 4 > POOL_SIZE) {
      this.source(this.pool);
      this.position = 0;
    }
    const p = this.position;
    this.position += 4;
    return (
      ((this.pool[p] << 24) |
        (this.pool[p + 1] << 16) |
        (this.pool[p + 2] << 8) |
        this.pool[p + 3]) >>>
      0
    );
  }

  /** Uniform integer in `[0, max)`, for `1 <= max <= 2^32`. */
  int(max: number): number {
    if (!Number.isInteger(max) || max < 1 || max > UINT32_RANGE) {
      throw new RangeError(`Random.int needs a whole number from 1 to 2^32, got ${max}.`);
    }
    // Largest multiple of `max` that fits: values at or above it would favor small results.
    const limit = UINT32_RANGE - (UINT32_RANGE % max);
    let value = this.uint32();
    while (value >= limit) value = this.uint32();
    return value % max;
  }

  /** Uniform integer in `[0, 2^bits)` for up to 53 bits (two draws above 32). */
  bits(count: number): number {
    if (count <= 32) return count === 32 ? this.uint32() : this.uint32() % 2 ** count;
    return (this.uint32() % 2 ** (count - 32)) * UINT32_RANGE + this.uint32();
  }

  pick<T>(items: readonly T[]): T {
    return items[this.int(items.length)];
  }
}
