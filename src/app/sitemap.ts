import type { MetadataRoute } from 'next';
import { DEFAULT_LOCALE, LOCALES } from '@/i18n/config';
import { languageAlternates, localeUrl } from '@/lib/metadata';
import { TOOLS, TOOLS_PATH, toolPath } from '@/lib/data/tools';
import { TOOL_PRESETS, presetPath } from '@/lib/data/tool-presets';

const PAGES: { path: `/${string}`; priority: number }[] = [
  { path: '/', priority: 1 },
  { path: '/projects', priority: 0.9 },
  { path: '/resume', priority: 0.9 },
];

// The tools section is English-only: one unprefixed URL each, no language alternates.
const TOOL_PAGES: { path: `/${string}`; priority: number }[] = [
  { path: TOOLS_PATH, priority: 0.8 },
  ...TOOLS.map((tool) => ({ path: toolPath(tool.slug), priority: 0.7 })),
  ...TOOL_PRESETS.map((preset) => ({ path: presetPath(preset), priority: 0.6 })),
];

// No lastModified: a per-build timestamp is always "now", which Google learns to ignore.
// One entry per page per locale, each listing all its language alternates.
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    ...PAGES.flatMap(({ path, priority }) =>
      LOCALES.map((locale) => ({
        url: localeUrl(locale, path),
        changeFrequency: 'monthly' as const,
        priority,
        alternates: { languages: languageAlternates(path) },
      }))
    ),
    ...TOOL_PAGES.map(({ path, priority }) => ({
      url: localeUrl(DEFAULT_LOCALE, path),
      changeFrequency: 'monthly' as const,
      priority,
    })),
  ];
}
