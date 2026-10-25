/** Incremental hash: feed any number of chunks, then read the digest once. */
export interface Hasher {
  update(data: Uint8Array): void;
  digest(): Uint8Array<ArrayBuffer>;
}

export type HasherFactory = () => Hasher;

/**
 * Splits `data` into `size`-byte blocks for a hash's compression function, carrying a partial
 * block over between `update` calls.
 */
export class BlockBuffer {
  readonly block: Uint8Array<ArrayBuffer>;
  readonly view: DataView;
  used = 0;
  /** Total bytes seen, for the length padding. */
  length = 0;

  constructor(
    size: number,
    private readonly compress: () => void
  ) {
    this.block = new Uint8Array(size);
    this.view = new DataView(this.block.buffer);
  }

  update(data: Uint8Array) {
    this.length += data.length;
    const size = this.block.length;
    let offset = 0;
    while (offset < data.length) {
      const take = Math.min(size - this.used, data.length - offset);
      this.block.set(data.subarray(offset, offset + take), this.used);
      this.used += take;
      offset += take;
      if (this.used === size) {
        this.compress();
        this.used = 0;
      }
    }
  }
}

/** RFC 2104 HMAC over any hash with the given block size (the rate, for SHA-3). */
export function hmacHasher(create: HasherFactory, blockSize: number, key: Uint8Array): Hasher {
  let k = key;
  if (k.length > blockSize) {
    const hasher = create();
    hasher.update(k);
    k = hasher.digest();
  }
  const inner = new Uint8Array(blockSize).fill(0x36);
  const outer = new Uint8Array(blockSize).fill(0x5c);
  for (let i = 0; i < k.length; i++) {
    inner[i] ^= k[i];
    outer[i] ^= k[i];
  }
  const innerHasher = create();
  innerHasher.update(inner);
  return {
    update: (data) => innerHasher.update(data),
    digest: () => {
      const outerHasher = create();
      outerHasher.update(outer);
      outerHasher.update(innerHasher.digest());
      return outerHasher.digest();
    },
  };
}
