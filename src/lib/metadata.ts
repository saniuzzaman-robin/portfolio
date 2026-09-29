import type { Metadata } from 'next';
import { CV_DATA } from '@/lib/cv-data';
import { OG_IMAGE, SITE_NAME, SITE_URL } from '@/lib/site';
import { DEFAULT_LOCALE, LOCALES, LOCALE_META, localePath, type Locale } from '@/i18n/config';
import { getDictionary } from '@/i18n/server';

/** Absolute URL of a page in a locale (no trailing slash on the home page). */
export function localeUrl(locale: Locale, path: `/${string}`): string {
  const localized = localePath(locale, path);
  return localized === '/' ? SITE_URL : `${SITE_URL}${localized}`;
}

/** hreflang map for a page: every locale plus `x-default` (the unprefixed English URL). */
export function languageAlternates(path: `/${string}`): Record<string, string> {
  return {
    ...Object.fromEntries(LOCALES.map((locale) => [locale, localeUrl(locale, path)])),
    'x-default': localeUrl(DEFAULT_LOCALE, path),
  };
}

/**
 * Per-page metadata with canonical URL, Open Graph and Twitter cards.
 * Relative URLs resolve against `metadataBase` set in the root layout.
 */
export function pageMetadata({
  lang,
  title,
  description,
  path,
  keywords,
  type = 'website',
}: {
  lang: Locale;
  /** Page title; the root layout template appends the site owner's name. */
  title?: string;
  description: string;
  /** Unprefixed path; the locale prefix is added here. */
  path: `/${string}`;
  keywords?: string[];
  type?: 'website' | 'profile';
}): Metadata {
  const { cv } = getDictionary(lang);
  const fullTitle = title ? `${title} | ${CV_DATA.name}` : `${CV_DATA.name} | ${cv.title}`;
  const image = { ...OG_IMAGE, alt: `${CV_DATA.name} — ${cv.title}` };

  return {
    ...(title ? { title } : { title: { absolute: fullTitle } }),
    description,
    keywords,
    alternates: { canonical: localeUrl(lang, path), languages: languageAlternates(path) },
    openGraph: {
      type,
      url: localeUrl(lang, path),
      title: fullTitle,
      description,
      siteName: SITE_NAME,
      locale: LOCALE_META[lang].ogLocale,
      alternateLocale: LOCALES.filter((l) => l !== lang).map((l) => LOCALE_META[l].ogLocale),
      images: [image],
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [image.url],
    },
  };
}
