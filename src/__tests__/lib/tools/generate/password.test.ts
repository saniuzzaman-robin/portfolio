import { describe, it, expect } from 'vitest';
import { Random } from '@/lib/tools/generate/random';
import {
  AMBIGUOUS,
  CHARSETS,
  DEFAULT_PASSPHRASE_OPTIONS,
  DEFAULT_PASSWORD_OPTIONS,
  generatePassphrase,
  generatePassword,
  passwordBits,
  strengthOf,
  type PasswordOptions,
} from '@/lib/tools/generate/password';
import { WORDLIST } from '@/lib/tools/generate/wordlist';

const random = new Random();
const password = (options: Partial<PasswordOptions>) =>
  generatePassword(random, { ...DEFAULT_PASSWORD_OPTIONS, ...options });

describe('generatePassword', () => {
  it('always includes every selected set', () => {
    for (let i = 0; i < 200; i++) {
      const result = password({ length: 4 });
      if (!result.ok) throw new Error(result.error);
      for (const set of Object.values(CHARSETS)) {
        expect([...result.password].some((char) => set.includes(char))).toBe(true);
      }
    }
  });

  it('uses only the selected sets and skips ambiguous characters', () => {
    for (let i = 0; i < 100; i++) {
      const result = password({
        length: 64,
        upper: false,
        symbols: false,
        excludeAmbiguous: true,
      });
      if (!result.ok) throw new Error(result.error);
      expect(result.password).toMatch(/^[a-z0-9]{64}$/);
      for (const char of AMBIGUOUS) expect(result.password).not.toContain(char);
    }
  });

  it('reports invalid options', () => {
    expect(password({ lower: false, upper: false, digits: false, symbols: false })).toEqual({
      ok: false,
      error: 'noCharsets',
    });
    expect(password({ length: 3 })).toEqual({ ok: false, error: 'length' });
    expect(password({ length: 129 })).toEqual({ ok: false, error: 'length' });
    expect(password({ length: 10.5 })).toEqual({ ok: false, error: 'length' });
  });
});

describe('passwordBits', () => {
  it('is length × log2(pool) for a single set', () => {
    expect(passwordBits([10], 6)).toBeCloseTo(6 * Math.log2(10), 10);
  });

  it('counts only passwords containing every set', () => {
    // Length 2 over {a} ∪ {0}: "a0" and "0a" are the only valid ones → 1 bit.
    expect(passwordBits([1, 1], 2)).toBeCloseTo(1, 10);
    // 26 + 10, length 2: 36² − 26² − 10² = 520 valid passwords.
    expect(passwordBits([26, 10], 2)).toBeCloseTo(Math.log2(520), 10);
  });

  it('handles long passwords without overflow', () => {
    const bits = passwordBits([26, 26, 10, 32], 128);
    expect(bits).toBeGreaterThan(838);
    expect(bits).toBeLessThan(128 * Math.log2(94));
  });
});

describe('generatePassphrase', () => {
  it('joins dictionary words with the separator', () => {
    const result = generatePassphrase(random, { ...DEFAULT_PASSPHRASE_OPTIONS, words: 6 });
    if (!result.ok) throw new Error(result.error);
    const words = result.password.split('-');
    // "yo-yo" is the one word containing the separator.
    if (!result.password.includes('yo-yo')) {
      expect(words).toHaveLength(6);
      for (const word of words) expect(WORDLIST).toContain(word);
    }
    expect(result.bits).toBeCloseTo(6 * Math.log2(1296), 10);
  });

  it('capitalizes and adds a digit', () => {
    const result = generatePassphrase(random, {
      words: 4,
      separator: ' ',
      capitalize: true,
      number: true,
    });
    if (!result.ok) throw new Error(result.error);
    const words = result.password.split(' ');
    for (const word of words) expect(word[0]).toBe(word[0].toUpperCase());
    expect(result.password.match(/\d/g)).toHaveLength(1);
    expect(result.bits).toBeCloseTo(4 * Math.log2(1296) + Math.log2(40), 10);
  });

  it('rejects word counts out of range', () => {
    expect(generatePassphrase(random, { ...DEFAULT_PASSPHRASE_OPTIONS, words: 2 })).toEqual({
      ok: false,
      error: 'words',
    });
  });

  it('uses the EFF short list', () => {
    expect(WORDLIST).toHaveLength(1296);
    expect(new Set(WORDLIST).size).toBe(1296);
  });
});

describe('strengthOf', () => {
  it('rates by entropy', () => {
    expect(strengthOf(30)).toBe('weak');
    expect(strengthOf(50)).toBe('fair');
    expect(strengthOf(70)).toBe('strong');
    expect(strengthOf(128)).toBe('veryStrong');
  });
});
