/**
 * Locale config. Kept dependency-free: it is imported by the proxy as well as by pages.
 * The default locale is served at unprefixed URLs; every other locale is prefixed (`/bn/…`).
 */
export const LOCALES = ['en', 'bn', 'ar'] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'en';

export const LOCALE_META: Record<
  Locale,
  { dir: 'ltr' | 'rtl'; ogLocale: string; label: string; short: string }
> = {
  en: { dir: 'ltr', ogLocale: 'en_US', label: 'English', short: 'EN' },
  bn: { dir: 'ltr', ogLocale: 'bn_BD', label: 'বাংলা', short: 'বাং' },
  ar: { dir: 'rtl', ogLocale: 'ar_AR', label: 'العربية', short: 'عر' },
};

export function isLocale(value: string | undefined): value is Locale {
  return (LOCALES as readonly string[]).includes(value ?? '');
}

/** Narrows a route param; `[lang]` only prerenders valid locales, so the fallback never triggers. */
export function toLocale(value: string): Locale {
  return isLocale(value) ? value : DEFAULT_LOCALE;
}

/** Locale-prefixed path for an unprefixed one: `localePath('bn', '/projects')` → `/bn/projects`. */
export function localePath(locale: Locale, path: string): string {
  if (locale === DEFAULT_LOCALE) return path;
  return path === '/' ? `/${locale}` : `/${locale}${path}`;
}

/** Splits `/bn/projects` into `{ locale: 'bn', path: '/projects' }`; unprefixed paths are English. */
export function splitLocale(pathname: string): { locale: Locale; path: string } {
  const [, first, ...rest] = pathname.split('/');
  if (isLocale(first)) return { locale: first, path: `/${rest.join('/')}` };
  return { locale: DEFAULT_LOCALE, path: pathname };
}
