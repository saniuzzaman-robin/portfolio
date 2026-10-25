import { BlockBuffer, type Hasher } from './hasher';

/*
 * Keccak-f[1600] on 32-bit halves: lane i is (state[2i] = low word, state[2i + 1] = high word),
 * so bytes absorb little-endian straight into the word array.
 */

/** ρ rotation offsets, indexed by lane x + 5y. */
const ROTATIONS = [
  0, 1, 62, 28, 27, 36, 44, 6, 55, 20, 3, 10, 43, 25, 39, 41, 45, 15, 21, 8, 18, 2, 61, 56, 14,
];

/** ι round constants as (high, low) word pairs. */
const ROUND_CONSTANTS = new Uint32Array([
  0x00000000, 0x00000001, 0x00000000, 0x00008082, 0x80000000, 0x0000808a, 0x80000000, 0x80008000,
  0x00000000, 0x0000808b, 0x00000000, 0x80000001, 0x80000000, 0x80008081, 0x80000000, 0x00008009,
  0x00000000, 0x0000008a, 0x00000000, 0x00000088, 0x00000000, 0x80008009, 0x00000000, 0x8000000a,
  0x00000000, 0x8000808b, 0x80000000, 0x0000008b, 0x80000000, 0x00008089, 0x80000000, 0x00008003,
  0x80000000, 0x00008002, 0x80000000, 0x00000080, 0x00000000, 0x0000800a, 0x80000000, 0x8000000a,
  0x80000000, 0x80008081, 0x80000000, 0x00008080, 0x00000000, 0x80000001, 0x80000000, 0x80008008,
]);

const columns = new Uint32Array(10);
const lanes = new Uint32Array(50);

function keccakF(state: Uint32Array) {
  for (let round = 0; round < 24; round++) {
    // θ: XOR each lane with the parities of two neighbouring columns.
    for (let x = 0; x < 5; x++) {
      for (let half = 0; half < 2; half++) {
        const i = 2 * x + half;
        columns[i] = state[i] ^ state[i + 10] ^ state[i + 20] ^ state[i + 30] ^ state[i + 40];
      }
    }
    for (let x = 0; x < 5; x++) {
      const previous = 2 * ((x + 4) % 5);
      const next = 2 * ((x + 1) % 5);
      const low = columns[next];
      const high = columns[next + 1];
      const dLow = columns[previous] ^ ((low << 1) | (high >>> 31));
      const dHigh = columns[previous + 1] ^ ((high << 1) | (low >>> 31));
      for (let y = 0; y < 25; y += 5) {
        state[2 * (x + y)] ^= dLow;
        state[2 * (x + y) + 1] ^= dHigh;
      }
    }
    // ρ and π: rotate each lane and move (x, y) to (y, 2x + 3y).
    for (let x = 0; x < 5; x++) {
      for (let y = 0; y < 5; y++) {
        const from = x + 5 * y;
        const to = y + 5 * ((2 * x + 3 * y) % 5);
        const low = state[2 * from];
        const high = state[2 * from + 1];
        const r = ROTATIONS[from];
        if (r === 0) {
          lanes[2 * to] = low;
          lanes[2 * to + 1] = high;
        } else if (r < 32) {
          lanes[2 * to] = (low << r) | (high >>> (32 - r));
          lanes[2 * to + 1] = (high << r) | (low >>> (32 - r));
        } else {
          // No offset is exactly 32, so `r - 32` is always 1…31.
          const s = r - 32;
          lanes[2 * to] = (high << s) | (low >>> (32 - s));
          lanes[2 * to + 1] = (low << s) | (high >>> (32 - s));
        }
      }
    }
    // χ: non-linear mix along each row.
    for (let y = 0; y < 25; y += 5) {
      for (let x = 0; x < 5; x++) {
        const i = 2 * (x + y);
        const a = 2 * (((x + 1) % 5) + y);
        const b = 2 * (((x + 2) % 5) + y);
        state[i] = lanes[i] ^ (~lanes[a] & lanes[b]);
        state[i + 1] = lanes[i + 1] ^ (~lanes[a + 1] & lanes[b + 1]);
      }
    }
    // ι
    state[0] ^= ROUND_CONSTANTS[2 * round + 1];
    state[1] ^= ROUND_CONSTANTS[2 * round];
  }
}

/** Keccak sponge. `domain` is the padding's first byte: 0x06 for SHA-3, 0x01 for original Keccak. */
class Keccak implements Hasher {
  private readonly state = new Uint32Array(50);
  private readonly buffer: BlockBuffer;

  constructor(
    private readonly outputBytes: number,
    private readonly domain: number
  ) {
    this.buffer = new BlockBuffer(200 - 2 * outputBytes, () => this.absorb());
  }

  update(data: Uint8Array) {
    this.buffer.update(data);
  }

  digest(): Uint8Array<ArrayBuffer> {
    const { block, used } = this.buffer;
    block.fill(0, used);
    block[used] ^= this.domain;
    block[block.length - 1] ^= 0x80;
    this.absorb();
    // Every output size here fits in one block of the rate, so one squeeze is enough.
    const out = new Uint8Array(this.outputBytes);
    for (let i = 0; i < out.length; i++) out[i] = (this.state[i >> 2] >>> ((i & 3) * 8)) & 0xff;
    return out;
  }

  private absorb() {
    const { view, block } = this.buffer;
    for (let w = 0; w < block.length / 4; w++) this.state[w] ^= view.getUint32(w * 4, true);
    keccakF(this.state);
  }
}

/** FIPS 202 SHA3-224/256/384/512, by output size in bytes. */
export function sha3(outputBytes: 28 | 32 | 48 | 64): Hasher {
  return new Keccak(outputBytes, 0x06);
}

/** Pre-standard Keccak (as used by Ethereum's keccak256). */
export function keccak(outputBytes: 32 | 64): Hasher {
  return new Keccak(outputBytes, 0x01);
}

/** Sponge rate in bytes: SHA-3's block size for HMAC. */
export function keccakRate(outputBytes: number): number {
  return 200 - 2 * outputBytes;
}
