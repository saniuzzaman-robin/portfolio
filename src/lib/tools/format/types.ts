/** A problem in the input, as UTF-16 offsets into it. */
export type FormatIssue = { message: string; from: number; to: number };

/** Errors come back as values; `warnings` are parts left unchanged (e.g. inline code that failed). */
export type FormatResult =
  { ok: true; text: string; warnings: FormatIssue[] } | { ok: false; error: FormatIssue };

export const formatted = (text: string, warnings: FormatIssue[] = []): FormatResult => ({
  ok: true,
  text,
  warnings,
});

export const failed = (message: string, from: number, to = from): FormatResult => ({
  ok: false,
  error: { message, from, to },
});

/** Offset of a 1-based line and column; `\r\n`, `\r` and `\n` each end a line. Clamped to the text. */
export function offsetAt(text: string, line: number, col: number): number {
  let offset = 0;
  for (let current = 1; current < line; offset++) {
    if (offset >= text.length) return text.length;
    const code = text.charCodeAt(offset);
    if (code === 10 || (code === 13 && text.charCodeAt(offset + 1) !== 10)) current++;
  }
  return Math.min(text.length, offset + Math.max(0, col - 1));
}
