import { CV_DATA } from '@/lib/cv-data';
import { PROJECTS, type Project } from '@/lib/data/projects';
import { SKILL_DOMAINS, type SkillDomain } from '@/lib/data/skills';
import type { Locale } from '@/i18n/config';
import type { Messages } from '@/i18n/messages/en';

/** Text-only mirror of `T`: arrays align by index with the English source; icons/URLs are omitted. */
export type DeepPartial<T> = T extends string
  ? string
  : T extends readonly (infer U)[]
    ? DeepPartial<U>[]
    : T extends object
      ? { [K in keyof T]?: DeepPartial<T[K]> }
      : T;

/** Translated content for a non-default locale. Must stay serializable (it is sent to the client). */
export type ContentOverrides = {
  cv: DeepPartial<typeof CV_DATA>;
  projects: DeepPartial<Project>[];
  skills: DeepPartial<SkillDomain>[];
};

export type Dictionary = {
  locale: Locale;
  t: Messages;
  cv: typeof CV_DATA;
  projects: Project[];
  skills: SkillDomain[];
};

/**
 * Overlays `override` onto `base`. Only keys present in the override are touched, so
 * non-text values (icons, numbers, URLs) always come from the English source.
 */
export function deepMerge<T>(base: T, override: unknown): T {
  if (override === undefined || override === null) return base;
  if (Array.isArray(base)) {
    const items = override as unknown[];
    return base.map((item, i) => deepMerge(item, items[i])) as T;
  }
  if (typeof base === 'object' && base !== null) {
    const result = { ...base } as Record<string, unknown>;
    for (const [key, value] of Object.entries(override as Record<string, unknown>)) {
      result[key] = deepMerge(result[key], value);
    }
    return result as T;
  }
  return override as T;
}

export function buildDictionary(
  locale: Locale,
  t: Messages,
  overrides: ContentOverrides | null
): Dictionary {
  return {
    locale,
    t,
    cv: deepMerge(CV_DATA, overrides?.cv),
    projects: deepMerge(PROJECTS, overrides?.projects),
    skills: deepMerge(SKILL_DOMAINS, overrides?.skills),
  };
}

/** Fills `{name}` placeholders: `fmt('since {year}', { year: 2024 })`. */
export function fmt(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in values ? String(values[key]) : match
  );
}
