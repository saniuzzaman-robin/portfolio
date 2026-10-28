const BASE64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

/** Decodes one source map segment: a run of base64 VLQ numbers. */
function decodeSegment(segment: string): number[] {
  const values: number[] = [];
  let value = 0;
  let shift = 0;
  for (const char of segment) {
    const digit = BASE64.indexOf(char);
    if (digit < 0) throw new Error(`Invalid character "${char}" in source map mappings.`);
    value += (digit & 31) * 2 ** shift;
    if (digit & 32) {
      shift += 5;
    } else {
      values.push(value % 2 ? -(value - 1) / 2 : value / 2);
      value = 0;
      shift = 0;
    }
  }
  return values;
}

/**
 * Turns a source map's `mappings` into the source line of each generated line (1-based; index 0
 * is generated line 1). A line is mapped to where its first segment comes from; a line without
 * segments (e.g. an emitted `export {};`) takes the line before it.
 */
export function sourceLineMap(mappings: string, lineCount: number): number[] {
  const groups = mappings.split(';');
  const map: number[] = [];
  // Source lines are relative to the previous segment, across generated lines.
  let sourceLine = 0;
  let previous = 1;
  for (let index = 0; index < lineCount; index++) {
    let first: number | null = null;
    for (const segment of (groups[index] ?? '').split(',')) {
      if (!segment) continue;
      const fields = decodeSegment(segment);
      if (fields.length < 4) continue;
      sourceLine += fields[2];
      first ??= sourceLine + 1;
    }
    previous = first ?? previous;
    map.push(previous);
  }
  return map;
}
