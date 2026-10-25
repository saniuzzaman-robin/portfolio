import { describe, it, expect } from 'vitest';
import {
  compileRegex,
  isFlags,
  splitLiteral,
  toggleFlag,
  withFlags,
} from '@/lib/tools/regex/flags';

describe('isFlags', () => {
  it('accepts distinct toggleable flags', () => {
    expect(isFlags('')).toBe(true);
    expect(isFlags('gimsuy')).toBe(true);
    expect(isFlags('gv')).toBe(true);
  });

  it('rejects unknown, repeated and conflicting flags', () => {
    expect(isFlags('gx')).toBe(false);
    expect(isFlags('gg')).toBe(false);
    expect(isFlags('uv')).toBe(false);
    expect(isFlags('d')).toBe(false);
    expect(isFlags(3)).toBe(false);
  });
});

describe('toggleFlag', () => {
  it('adds and removes in canonical order', () => {
    expect(toggleFlag('y', 'g')).toBe('gy');
    expect(toggleFlag('gim', 'i')).toBe('gm');
  });

  it('makes u and v replace each other', () => {
    expect(toggleFlag('gu', 'v')).toBe('gv');
    expect(toggleFlag('gv', 'u')).toBe('gu');
  });
});

describe('withFlags', () => {
  it('merges without duplicates, d first', () => {
    expect(withFlags('gi', 'dg')).toBe('dgi');
    expect(withFlags('yv', 'd')).toBe('dvy');
  });
});

describe('splitLiteral', () => {
  it('splits a pasted regex literal', () => {
    expect(splitLiteral('/a+b/gi')).toEqual({ pattern: 'a+b', flags: 'gi' });
    expect(splitLiteral(' /https?:\\/\\/\\w+/ ')).toEqual({
      pattern: 'https?:\\/\\/\\w+',
      flags: '',
    });
  });

  it('leaves anything else alone', () => {
    expect(splitLiteral('a/b/')).toBeNull();
    expect(splitLiteral('//g')).toBeNull();
    expect(splitLiteral('/a/x')).toBeNull();
    expect(splitLiteral('/abc')).toBeNull();
  });
});

describe('compileRegex', () => {
  it('compiles valid patterns', () => {
    const result = compileRegex('a(b)c', 'gi');
    expect(result.ok && result.regex.flags).toBe('gi');
  });

  it('returns the engine message without the repeated pattern', () => {
    expect(compileRegex('a(b', '')).toEqual({ ok: false, error: 'Unterminated group' });
    expect(compileRegex('x{2,1}', 'g')).toEqual({
      ok: false,
      error: 'numbers out of order in {} quantifier',
    });
  });

  it('reports invalid flag combinations', () => {
    const result = compileRegex('a', 'uv');
    expect(result.ok).toBe(false);
  });
});
