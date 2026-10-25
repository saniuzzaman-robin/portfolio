/** A problem in the input, as offsets into the input text (for the editor underline). */
export type CodecIssue = { message: string; from: number; to: number };

export type CodecResult<T = string> = { ok: true; value: T } | { ok: false; error: CodecIssue };

/**
 * Bytes decoded from text. `starts[i]` is the input offset where byte `i` came from; decoders
 * only fill it when asked (`track`), to point UTF-8 errors back at the input.
 */
export type DecodedBytes = { bytes: Uint8Array<ArrayBuffer>; starts?: Uint32Array };

export function fail(
  message: string,
  from: number,
  to = from + 1
): { ok: false; error: CodecIssue } {
  return { ok: false, error: { message, from, to } };
}

/** Collects decoded bytes, plus their input offsets when tracking. `capacity` is an upper bound. */
export class ByteSink {
  readonly bytes: Uint8Array<ArrayBuffer>;
  readonly starts?: Uint32Array;
  length = 0;

  constructor(capacity: number, track: boolean) {
    this.bytes = new Uint8Array(capacity);
    if (track) this.starts = new Uint32Array(capacity);
  }

  push(byte: number, from: number) {
    if (this.starts) this.starts[this.length] = from;
    this.bytes[this.length++] = byte;
  }

  result(): DecodedBytes {
    return {
      bytes: this.bytes.subarray(0, this.length),
      starts: this.starts?.subarray(0, this.length),
    };
  }
}

export function hexByte(byte: number): string {
  return byte.toString(16).toUpperCase().padStart(2, '0');
}
