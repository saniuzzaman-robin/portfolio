import type { Hasher } from './hasher';

// CRC-32/ISO-HDLC (zip, gzip, PNG): reflected polynomial 0xEDB88320.
const TABLE = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  TABLE[n] = c;
}

/** CRC-32 as a 4-byte big-endian digest (the usual "cbf43926" form). Not a cryptographic hash. */
export class Crc32 implements Hasher {
  private crc = 0xffffffff;

  update(data: Uint8Array) {
    let crc = this.crc;
    for (let i = 0; i < data.length; i++) crc = TABLE[(crc ^ data[i]) & 0xff] ^ (crc >>> 8);
    this.crc = crc;
  }

  digest(): Uint8Array<ArrayBuffer> {
    const out = new Uint8Array(4);
    new DataView(out.buffer).setUint32(0, (this.crc ^ 0xffffffff) >>> 0);
    return out;
  }
}
