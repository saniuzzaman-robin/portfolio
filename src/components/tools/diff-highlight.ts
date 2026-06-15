export type DiffSegment = { text: string; changed: boolean };

function extractValue(line: string): string {
  // Extract just the value part after the colon
  // e.g., '  "key": "value"' -> '"value"'
  const match = line.match(/:\s*(.+)$/);
  return match ? match[1] : line;
}

export function highlightDiff(
  oldStr: string,
  newStr: string
): { old: DiffSegment[]; new: DiffSegment[]; prefix: string } {
  // Extract the key prefix (everything up to and including the colon and space)
  const keyMatch = oldStr.match(/^(.+?:\s*)/);
  const keyPrefix = keyMatch ? keyMatch[1] : '';

  // Extract just the values for comparison
  const oldValue = extractValue(oldStr);
  const newValue = extractValue(newStr);

  // Simple character-level diff: find common prefix and suffix, then highlight middle
  let prefixLen = 0;
  while (
    prefixLen < oldValue.length &&
    prefixLen < newValue.length &&
    oldValue[prefixLen] === newValue[prefixLen]
  ) {
    prefixLen++;
  }

  let suffixLen = 0;
  while (
    suffixLen < oldValue.length - prefixLen &&
    suffixLen < newValue.length - prefixLen &&
    oldValue[oldValue.length - 1 - suffixLen] === newValue[newValue.length - 1 - suffixLen]
  ) {
    suffixLen++;
  }

  const oldPrefix = oldValue.slice(0, prefixLen);
  const oldMiddle = oldValue.slice(prefixLen, oldValue.length - suffixLen);
  const oldSuffix = oldValue.slice(oldValue.length - suffixLen);

  const newPrefix = newValue.slice(0, prefixLen);
  const newMiddle = newValue.slice(prefixLen, newValue.length - suffixLen);
  const newSuffix = newValue.slice(newValue.length - suffixLen);

  const oldSegments: DiffSegment[] = [];
  if (oldPrefix) oldSegments.push({ text: oldPrefix, changed: false });
  if (oldMiddle) oldSegments.push({ text: oldMiddle, changed: true });
  if (oldSuffix) oldSegments.push({ text: oldSuffix, changed: false });

  const newSegments: DiffSegment[] = [];
  if (newPrefix) newSegments.push({ text: newPrefix, changed: false });
  if (newMiddle) newSegments.push({ text: newMiddle, changed: true });
  if (newSuffix) newSegments.push({ text: newSuffix, changed: false });

  return { old: oldSegments, new: newSegments, prefix: keyPrefix };
}
