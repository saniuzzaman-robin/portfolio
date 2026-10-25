import type { Random } from './random';
import { WORDLIST } from './wordlist';

export const CHARSETS = {
  lower: 'abcdefghijklmnopqrstuvwxyz',
  upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  digits: '0123456789',
  symbols: '!"#$%&\'()*+,-./:;<=>?@[\\]^_`{|}~',
} as const;
export type Charset = keyof typeof CHARSETS;
export const CHARSET_KEYS = Object.keys(CHARSETS) as Charset[];

/** Characters that are easy to confuse in many fonts. */
export const AMBIGUOUS = 'Il1|O0o';

export const PASSWORD_MIN_LENGTH = 4;
export const PASSWORD_MAX_LENGTH = 128;

export type PasswordOptions = Record<Charset, boolean> & {
  length: number;
  excludeAmbiguous: boolean;
};

export const DEFAULT_PASSWORD_OPTIONS: PasswordOptions = {
  length: 20,
  lower: true,
  upper: true,
  digits: true,
  symbols: true,
  excludeAmbiguous: false,
};

export function isPasswordOptions(value: unknown): value is PasswordOptions {
  if (typeof value !== 'object' || value === null) return false;
  const options = value as Record<string, unknown>;
  return (
    typeof options.length === 'number' &&
    typeof options.excludeAmbiguous === 'boolean' &&
    CHARSET_KEYS.every((key) => typeof options[key] === 'boolean')
  );
}

export type PasswordResult =
  { ok: true; password: string; bits: number } | { ok: false; error: 'noCharsets' | 'length' };

/** The selected sets, each filtered for ambiguous characters. Empty sets are dropped. */
function activeSets(options: PasswordOptions): string[][] {
  return CHARSET_KEYS.filter((key) => options[key])
    .map((key) =>
      Array.from(CHARSETS[key]).filter(
        (char) => !options.excludeAmbiguous || !AMBIGUOUS.includes(char)
      )
    )
    .filter((set) => set.length > 0);
}

/** log2 of a positive BigInt, accurate to double precision. */
function log2Big(value: bigint): number {
  const bits = value.toString(2).length;
  if (bits <= 53) return Math.log2(Number(value));
  return bits - 53 + Math.log2(Number(value >> BigInt(bits - 53)));
}

/**
 * Exact entropy of a uniformly chosen password of `length` characters drawn from the union of
 * `sizes`, containing at least one character of each set (inclusion–exclusion over the sets left
 * out).
 */
export function passwordBits(sizes: number[], length: number): number {
  let count = BigInt(0);
  for (let mask = 0; mask < 1 << sizes.length; mask++) {
    let pool = 0;
    let excluded = 0;
    sizes.forEach((size, i) => {
      if (mask & (1 << i)) excluded++;
      else pool += size;
    });
    const term = BigInt(pool) ** BigInt(length);
    count += excluded % 2 === 0 ? term : -term;
  }
  return count > BigInt(0) ? log2Big(count) : 0;
}

/**
 * Random password with at least one character from every selected set. Drawing whole passwords
 * and rejecting those missing a set keeps every valid password equally likely.
 */
export function generatePassword(random: Random, options: PasswordOptions): PasswordResult {
  const sets = activeSets(options);
  if (sets.length === 0) return { ok: false, error: 'noCharsets' };
  const { length } = options;
  if (
    !Number.isInteger(length) ||
    length < Math.max(PASSWORD_MIN_LENGTH, sets.length) ||
    length > PASSWORD_MAX_LENGTH
  ) {
    return { ok: false, error: 'length' };
  }
  const pool = sets.flat();
  let chars: string[];
  do {
    chars = Array.from({ length }, () => random.pick(pool));
  } while (!sets.every((set) => chars.some((char) => set.includes(char))));
  return {
    ok: true,
    password: chars.join(''),
    bits: passwordBits(
      sets.map((set) => set.length),
      length
    ),
  };
}

export const PASSPHRASE_SEPARATORS = ['-', ' ', '.', '_', ''] as const;
export type PassphraseSeparator = (typeof PASSPHRASE_SEPARATORS)[number];

export const PASSPHRASE_MIN_WORDS = 3;
export const PASSPHRASE_MAX_WORDS = 20;

export type PassphraseOptions = {
  words: number;
  separator: PassphraseSeparator;
  capitalize: boolean;
  /** Append one random digit to one random word. */
  number: boolean;
};

/** 7 words ≈ 72 bits with the 1,296-word list. */
export const DEFAULT_PASSPHRASE_OPTIONS: PassphraseOptions = {
  words: 7,
  separator: '-',
  capitalize: false,
  number: false,
};

export function isPassphraseOptions(value: unknown): value is PassphraseOptions {
  if (typeof value !== 'object' || value === null) return false;
  const options = value as Record<string, unknown>;
  return (
    typeof options.words === 'number' &&
    PASSPHRASE_SEPARATORS.includes(options.separator as PassphraseSeparator) &&
    typeof options.capitalize === 'boolean' &&
    typeof options.number === 'boolean'
  );
}

export type PassphraseResult =
  { ok: true; password: string; bits: number } | { ok: false; error: 'words' };

export function generatePassphrase(random: Random, options: PassphraseOptions): PassphraseResult {
  const { words } = options;
  if (!Number.isInteger(words) || words < PASSPHRASE_MIN_WORDS || words > PASSPHRASE_MAX_WORDS) {
    return { ok: false, error: 'words' };
  }
  const picked = Array.from({ length: words }, () => {
    const word = random.pick(WORDLIST);
    return options.capitalize ? word[0].toUpperCase() + word.slice(1) : word;
  });
  let bits = words * Math.log2(WORDLIST.length);
  if (options.number) {
    picked[random.int(words)] += String(random.int(10));
    bits += Math.log2(10 * words);
  }
  return { ok: true, password: picked.join(options.separator), bits };
}

export type Strength = 'weak' | 'fair' | 'strong' | 'veryStrong';

/** Rough rating against offline guessing; 80+ bits is out of reach for any attacker today. */
export function strengthOf(bits: number): Strength {
  if (bits < 45) return 'weak';
  if (bits < 64) return 'fair';
  if (bits < 80) return 'strong';
  return 'veryStrong';
}
