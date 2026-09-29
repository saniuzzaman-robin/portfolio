import { describe, it, expect } from 'vitest';
import { buildDictionary, deepMerge, fmt } from '@/i18n/dictionary';
import { CV_DATA } from '@/lib/cv-data';
import { PROJECTS } from '@/lib/data/projects';
import { SKILL_DOMAINS } from '@/lib/data/skills';
import { en } from '@/i18n/messages/en';
import { bn } from '@/i18n/messages/bn';
import { ar } from '@/i18n/messages/ar';
import { bnContent } from '@/i18n/content/bn';
import { arContent } from '@/i18n/content/ar';

/** Paths where an override array's length differs from the English source it aligns with. */
function misalignedArrays(base: unknown, override: unknown, path = ''): string[] {
  if (Array.isArray(override)) {
    if (!Array.isArray(base) || base.length !== override.length) return [path];
    return override.flatMap((item, i) => misalignedArrays(base[i], item, `${path}[${i}]`));
  }
  if (override && typeof override === 'object') {
    return Object.entries(override).flatMap(([key, value]) =>
      misalignedArrays((base as Record<string, unknown>)?.[key], value, `${path}.${key}`)
    );
  }
  return [];
}

describe.each([
  ['bn', bnContent],
  ['ar', arContent],
])('%s content overrides', (_, content) => {
  it('align index-for-index with the English source', () => {
    expect(misalignedArrays(CV_DATA, content.cv, 'cv')).toEqual([]);
    expect(misalignedArrays(PROJECTS, content.projects, 'projects')).toEqual([]);
    expect(misalignedArrays(SKILL_DOMAINS, content.skills, 'skills')).toEqual([]);
  });

  it('keep icons and non-text fields from the English source', () => {
    const dict = buildDictionary('bn', bn, content);
    expect(dict.projects.map((p) => p.icon)).toEqual(PROJECTS.map((p) => p.icon));
    expect(dict.projects.map((p) => p.link)).toEqual(PROJECTS.map((p) => p.link));
    expect(dict.cv.stats.map((s) => s.numeric)).toEqual(CV_DATA.stats.map((s) => s.numeric));
  });
});

describe('messages', () => {
  it.each([
    ['bn', bn],
    ['ar', ar],
  ])('%s keeps every placeholder used by English', (_, messages) => {
    const placeholders = (value: unknown): string[] =>
      typeof value === 'string'
        ? (value.match(/\{\w+\}/g) ?? []).sort()
        : Object.values(value as object).flatMap(placeholders);
    expect(placeholders(messages)).toEqual(placeholders(en));
  });
});

describe('deepMerge', () => {
  it('overrides only the keys present and keeps the rest', () => {
    const base = { a: 'x', b: [{ c: 'y', d: 1 }], e: 'z' };
    expect(deepMerge(base, { a: 'X', b: [{ c: 'Y' }] })).toEqual({
      a: 'X',
      b: [{ c: 'Y', d: 1 }],
      e: 'z',
    });
  });
});

describe('fmt', () => {
  it('fills known placeholders and leaves unknown ones', () => {
    expect(fmt('since {year} {x}', { year: 2024 })).toBe('since 2024 {x}');
  });
});
