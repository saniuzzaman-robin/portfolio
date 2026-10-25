import { ByteSink, fail, hexByte, type CodecResult, type DecodedBytes } from './types';

/** RFC 2045: encoded lines are at most 76 characters, including a soft break's trailing `=`. */
const MAX_LINE = 76;

const encoder = new TextEncoder();
// Spaces/tabs up to the end of the line (sticky: matched at `lastIndex`).
const TO_LINE_END = /[ \t]*(?:\r?\n|$)/y;

function lineEndAt(text: string, index: number): number {
  TO_LINE_END.lastIndex = index;
  return TO_LINE_END.test(text) ? TO_LINE_END.lastIndex : -1;
}

function encodeLine(line: string): string {
  const bytes = encoder.encode(line);
  let out = '';
  let width = 0;
  for (let i = 0; i < bytes.length; i++) {
    const byte = bytes[i];
    const last = i === bytes.length - 1;
    const literal =
      (byte >= 33 && byte <= 126 && byte !== 0x3d) || ((byte === 0x20 || byte === 0x09) && !last);
    const token = literal ? String.fromCharCode(byte) : `=${hexByte(byte)}`;
    // Leave room for the soft break's `=`, unless this token ends the line.
    const room = last ? MAX_LINE : MAX_LINE - 1;
    if (width + token.length > room) {
      out += '=\n';
      width = 0;
    }
    out += token;
    width += token.length;
  }
  return out;
}

/** Text → UTF-8 → quoted-printable. Line breaks in the text stay hard line breaks. */
export function encodeQuotedPrintable(text: string): string {
  return text.split(/\r?\n/).map(encodeLine).join('\n');
}

/**
 * Quoted-printable → bytes. Soft breaks (`=` at line end) are removed, and so is trailing
 * whitespace on a line (transport padding). A stray `=` is an error.
 */
export function decodeQuotedPrintableBytes(text: string, track = false): CodecResult<DecodedBytes> {
  const sink = new ByteSink(text.length * 3, track);
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === '=') {
      const softBreakEnd = lineEndAt(text, i + 1);
      if (softBreakEnd >= 0) {
        i = softBreakEnd - 1;
        continue;
      }
      const pair = text.slice(i + 1, i + 3);
      if (!/^[0-9a-fA-F]{2}$/.test(pair)) {
        return fail(
          '“=” must be followed by two hex digits or a line break.',
          i,
          i + 1 + pair.length
        );
      }
      sink.push(parseInt(pair, 16), i);
      i += 2;
    } else if ((char === ' ' || char === '\t') && lineEndAt(text, i) >= 0) {
      // Trailing whitespace: skip to the line break.
      while (text[i + 1] === ' ' || text[i + 1] === '\t') i++;
    } else {
      const code = text.codePointAt(i)!;
      const unit = code > 0xffff ? text.slice(i, i + 2) : char;
      for (const byte of encoder.encode(unit)) sink.push(byte, i);
      if (code > 0xffff) i++;
    }
  }
  return { ok: true, value: sink.result() };
}
