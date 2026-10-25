import { fail, type CodecResult } from './types';

// RFC 3492 parameters.
const BASE = 36;
const T_MIN = 1;
const T_MAX = 26;
const SKEW = 38;
const DAMP = 700;
const INITIAL_BIAS = 72;
const INITIAL_N = 128;
const MAX_INT = 0x7fffffff;
const ACE_PREFIX = 'xn--';

function adapt(delta: number, points: number, first: boolean): number {
  let d = first ? Math.floor(delta / DAMP) : delta >> 1;
  d += Math.floor(d / points);
  let k = 0;
  while (d > ((BASE - T_MIN) * T_MAX) >> 1) {
    d = Math.floor(d / (BASE - T_MIN));
    k += BASE;
  }
  return k + Math.floor(((BASE - T_MIN + 1) * d) / (d + SKEW));
}

const digitChar = (d: number) => String.fromCharCode(d + (d < 26 ? 97 : 22));

function digitValue(code: number): number {
  if (code >= 0x30 && code <= 0x39) return code - 22;
  if (code >= 0x41 && code <= 0x5a) return code - 0x41;
  if (code >= 0x61 && code <= 0x7a) return code - 0x61;
  return BASE;
}

/** RFC 3492 encode of one label (without the `xn--` prefix). */
export function punycodeEncode(input: string): string {
  const points = Array.from(input, (char) => char.codePointAt(0)!);
  let output = points
    .filter((code) => code < 0x80)
    .map((code) => String.fromCharCode(code))
    .join('');
  const basic = output.length;
  let handled = basic;
  if (basic > 0) output += '-';
  let n = INITIAL_N;
  let delta = 0;
  let bias = INITIAL_BIAS;
  while (handled < points.length) {
    let m = MAX_INT;
    for (const code of points) if (code >= n && code < m) m = code;
    delta += (m - n) * (handled + 1);
    n = m;
    for (const code of points) {
      if (code < n) delta++;
      if (code !== n) continue;
      let q = delta;
      for (let k = BASE; ; k += BASE) {
        const t = k <= bias ? T_MIN : k >= bias + T_MAX ? T_MAX : k - bias;
        if (q < t) break;
        output += digitChar(t + ((q - t) % (BASE - t)));
        q = Math.floor((q - t) / (BASE - t));
      }
      output += digitChar(q);
      bias = adapt(delta, handled + 1, handled === basic);
      delta = 0;
      handled++;
    }
    delta++;
    n++;
  }
  return output;
}

/** RFC 3492 decode of one label (without the `xn--` prefix). `offset` positions errors. */
export function punycodeDecode(input: string, offset = 0): CodecResult {
  const output: number[] = [];
  const dash = input.lastIndexOf('-');
  for (let i = 0; i < Math.max(0, dash); i++) {
    const code = input.charCodeAt(i);
    if (code >= 0x80) return fail('Non-ASCII character in a punycode label.', offset + i);
    output.push(code);
  }
  let n = INITIAL_N;
  let bias = INITIAL_BIAS;
  let i = 0;
  for (let index = dash >= 0 ? dash + 1 : 0; index < input.length;) {
    const old = i;
    let w = 1;
    for (let k = BASE; ; k += BASE) {
      if (index >= input.length) {
        return fail(
          'The punycode label ends in the middle of a number.',
          offset + input.length - 1
        );
      }
      const digit = digitValue(input.charCodeAt(index++));
      if (digit >= BASE) return fail('Invalid punycode digit.', offset + index - 1);
      if (digit > Math.floor((MAX_INT - i) / w))
        return fail('Punycode overflow.', offset + index - 1);
      i += digit * w;
      const t = k <= bias ? T_MIN : k >= bias + T_MAX ? T_MAX : k - bias;
      if (digit < t) break;
      w *= BASE - t;
    }
    const length = output.length + 1;
    bias = adapt(i - old, length, old === 0);
    n += Math.floor(i / length);
    i %= length;
    if (n > 0x10ffff) return fail('Punycode decodes to a code point above U+10FFFF.', offset);
    output.splice(i++, 0, n);
  }
  return { ok: true, value: String.fromCodePoint(...output) };
}

// Label separators IDNA accepts: full stop, ideographic, fullwidth and halfwidth full stops.
const SEPARATOR = /[.。．｡]/;

/** Applies `convert` to each label of the domain on each line (an email's part before `@` is kept). */
function mapDomains(
  text: string,
  convert: (label: string, offset: number) => CodecResult
): CodecResult {
  const out: string[] = [];
  let offset = 0;
  for (const line of text.split('\n')) {
    const at = line.lastIndexOf('@');
    let result = line.slice(0, at + 1);
    let position = offset + at + 1;
    const labels = line.slice(at + 1).split(SEPARATOR);
    for (const [index, label] of labels.entries()) {
      const converted = convert(label, position);
      if (!converted.ok) return converted;
      result += (index > 0 ? '.' : '') + converted.value;
      position += label.length + 1;
    }
    out.push(result);
    offset += line.length + 1;
  }
  return { ok: true, value: out.join('\n') };
}

/**
 * Domain names → ASCII (`münchen.de` → `xn--mnchen-3ya.de`), one per line. Labels are lowercased
 * and NFC-normalized; this is not the full UTS #46 mapping browsers apply.
 */
export function domainToAscii(text: string): CodecResult {
  return mapDomains(text, (label) => {
    const normalized = label.normalize('NFC');
    if (/^[\x00-\x7f]*$/.test(normalized)) return { ok: true, value: label };
    return { ok: true, value: ACE_PREFIX + punycodeEncode(normalized.toLowerCase()) };
  });
}

/** `xn--` labels → Unicode, one domain per line. */
export function domainToUnicode(text: string): CodecResult {
  return mapDomains(text, (label, offset) => {
    if (label.slice(0, ACE_PREFIX.length).toLowerCase() !== ACE_PREFIX) {
      return { ok: true, value: label };
    }
    return punycodeDecode(label.slice(ACE_PREFIX.length), offset + ACE_PREFIX.length);
  });
}
