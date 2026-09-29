'use client';

import { useParams, usePathname } from 'next/navigation';
import { splitLocale, toLocale, type Locale } from '@/i18n/config';

/** Current locale from the `[lang]` route param (also set for rewritten unprefixed URLs). */
export function useLocale(): Locale {
  const { lang } = useParams<{ lang?: string }>();
  return toLocale(lang ?? '');
}

/**
 * Current path without its locale prefix. `usePathname` can report either the browser URL
 * (`/projects`) or the rewritten route (`/en/projects`); both normalize to `/projects`.
 */
export function useUnprefixedPath(): string {
  return splitLocale(usePathname()).path;
}
