import type { Random } from './random';

/** Preset alphabets; `url` is NanoID's default (A–Z, a–z, 0–9, `_`, `-`). */
export const NANOID_ALPHABETS = {
  url: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-',
  alphanumeric: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
  lowercase: 'abcdefghijklmnopqrstuvwxyz0123456789',
  hex: '0123456789abcdef',
  numbers: '0123456789',
  // No 0/O, 1/l/I, and no vowels, so IDs can't spell words.
  readable: '6789BCDFGHJKLMNPQRTWbcdfghjkmnpqrtwz',
} as const;
export type NanoidAlphabet = keyof typeof NANOID_ALPHABETS;

export const NANOID_DEFAULT_SIZE = 21;
export const NANOID_MAX_SIZE = 256;
export const NANOID_MAX_ALPHABET = 1024;

/** The alphabet's characters (code points, so emoji count once), or an error. */
export function parseAlphabet(
  alphabet: string
): { ok: true; chars: string[] } | { ok: false; error: string } {
  const chars = Array.from(alphabet);
  if (chars.length < 2) return { ok: false, error: 'The alphabet needs at least 2 characters.' };
  if (chars.length > NANOID_MAX_ALPHABET) {
    return { ok: false, error: `The alphabet can have at most ${NANOID_MAX_ALPHABET} characters.` };
  }
  const seen = new Set<string>();
  for (const char of chars) {
    if (seen.has(char)) {
      return { ok: false, error: `“${char}” appears more than once in the alphabet.` };
    }
    seen.add(char);
  }
  return { ok: true, chars };
}

export function nanoid(random: Random, chars: readonly string[], size: number): string {
  let out = '';
  for (let i = 0; i < size; i++) out += chars[random.int(chars.length)];
  return out;
}

/** Entropy of one ID in bits. */
export function nanoidBits(alphabetSize: number, size: number): number {
  return size * Math.log2(alphabetSize);
}
