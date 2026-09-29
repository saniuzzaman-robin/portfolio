import type { MetadataRoute } from 'next';
import { LOCALES } from '@/i18n/config';
import { languageAlternates, localeUrl } from '@/lib/metadata';

const PAGES: { path: `/${string}`; priority: number }[] = [
  { path: '/', priority: 1 },
  { path: '/projects', priority: 0.9 },
  { path: '/resume', priority: 0.9 },
];

// No lastModified: a per-build timestamp is always "now", which Google learns to ignore.
// One entry per page per locale, each listing all its language alternates.
export default function sitemap(): MetadataRoute.Sitemap {
  return PAGES.flatMap(({ path, priority }) =>
    LOCALES.map((locale) => ({
      url: localeUrl(locale, path),
      changeFrequency: 'monthly' as const,
      priority,
      alternates: { languages: languageAlternates(path) },
    }))
  );
}
