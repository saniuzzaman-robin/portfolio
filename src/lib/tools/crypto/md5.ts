import { BlockBuffer, type Hasher } from './hasher';

// RFC 1321 §3.4: per-round shift amounts and K[i] = floor(|sin(i + 1)| · 2^32).
const SHIFTS = [7, 12, 17, 22, 5, 9, 14, 20, 4, 11, 16, 23, 6, 10, 15, 21];
const K = new Int32Array(64);
for (let i = 0; i < 64; i++) K[i] = Math.floor(Math.abs(Math.sin(i + 1)) * 2 ** 32) | 0;

/** MD5 (RFC 1321). Broken for security; still everywhere as a checksum. */
export class Md5 implements Hasher {
  private readonly state = new Int32Array([0x67452301, 0xefcdab89, 0x98badcfe, 0x10325476]);
  private readonly words = new Int32Array(16);
  private readonly buffer = new BlockBuffer(64, () => this.compress());

  update(data: Uint8Array) {
    this.buffer.update(data);
  }

  digest(): Uint8Array<ArrayBuffer> {
    const { buffer } = this;
    const bits = buffer.length * 8;
    // 0x80, zeros up to 56 mod 64, then the bit length as 64-bit little-endian.
    const padding = new Uint8Array((buffer.used < 56 ? 56 : 120) - buffer.used + 8);
    padding[0] = 0x80;
    const view = new DataView(padding.buffer);
    view.setUint32(padding.length - 8, bits % 2 ** 32, true);
    view.setUint32(padding.length - 4, Math.floor(bits / 2 ** 32), true);
    buffer.update(padding);

    const out = new Uint8Array(16);
    const outView = new DataView(out.buffer);
    for (let i = 0; i < 4; i++) outView.setInt32(i * 4, this.state[i], true);
    return out;
  }

  private compress() {
    const { words, state } = this;
    const { view } = this.buffer;
    for (let i = 0; i < 16; i++) words[i] = view.getInt32(i * 4, true);
    let [a, b, c, d] = state;
    for (let i = 0; i < 64; i++) {
      let f: number;
      let g: number;
      if (i < 16) {
        f = (b & c) | (~b & d);
        g = i;
      } else if (i < 32) {
        f = (d & b) | (~d & c);
        g = (5 * i + 1) & 15;
      } else if (i < 48) {
        f = b ^ c ^ d;
        g = (3 * i + 5) & 15;
      } else {
        f = c ^ (b | ~d);
        g = (7 * i) & 15;
      }
      const sum = (a + f + K[i] + words[g]) | 0;
      const shift = SHIFTS[(i >> 4) * 4 + (i & 3)];
      a = d;
      d = c;
      c = b;
      b = (b + ((sum << shift) | (sum >>> (32 - shift)))) | 0;
    }
    state[0] = (state[0] + a) | 0;
    state[1] = (state[1] + b) | 0;
    state[2] = (state[2] + c) | 0;
    state[3] = (state[3] + d) | 0;
  }
}

/** One-shot MD5 (e.g. OpenSSL's EVP_BytesToKey). */
export function md5(data: Uint8Array): Uint8Array<ArrayBuffer> {
  const hasher = new Md5();
  hasher.update(data);
  return hasher.digest();
}
