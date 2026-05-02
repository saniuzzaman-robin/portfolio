import { describe, it, expect } from 'vitest';
import { av, ava, ACCENT_CLASSES, type AccentToken } from '@/lib/accent';

describe('av', () => {
  it('returns the CSS variable for primary', () => {
    expect(av('primary')).toBe('var(--color-primary-50)');
  });

  it('returns the CSS variable for secondary', () => {
    expect(av('secondary')).toBe('var(--color-secondary-50)');
  });

  it('returns the CSS variable for tertiary', () => {
    expect(av('tertiary')).toBe('var(--color-tertiary-50)');
  });
});

describe('ava', () => {
  it('wraps the CSS variable in an rgb() with the given alpha', () => {
    expect(ava('primary', 0.5)).toBe('rgb(from var(--color-primary-50) r g b / 0.5)');
  });

  it('handles alpha = 0', () => {
    expect(ava('secondary', 0)).toBe('rgb(from var(--color-secondary-50) r g b / 0)');
  });

  it('handles alpha = 1', () => {
    expect(ava('tertiary', 1)).toBe('rgb(from var(--color-tertiary-50) r g b / 1)');
  });
});

describe('ACCENT_CLASSES', () => {
  const tokens: AccentToken[] = ['primary', 'secondary', 'tertiary'];

  it('has entries for all three tokens', () => {
    expect(Object.keys(ACCENT_CLASSES)).toEqual(tokens);
  });

  it.each(tokens)('%s entry has all required shape keys', (token) => {
    const classes = ACCENT_CLASSES[token];
    expect(classes).toHaveProperty('text');
    expect(classes).toHaveProperty('textHover');
    expect(classes).toHaveProperty('neon');
    expect(classes).toHaveProperty('border');
    expect(classes).toHaveProperty('borderSoft');
    expect(classes).toHaveProperty('borderMedium');
    expect(classes).toHaveProperty('tag');
    expect(classes).toHaveProperty('glow');
  });

  it('primary text class is text-primary-50', () => {
    expect(ACCENT_CLASSES.primary.text).toBe('text-primary-50');
  });

  it('secondary tag class contains background and text', () => {
    expect(ACCENT_CLASSES.secondary.tag).toContain('bg-secondary-50');
    expect(ACCENT_CLASSES.secondary.tag).toContain('text-secondary-50');
  });
});
