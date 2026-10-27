'use client';

import Link from 'next/link';
import { DEFAULT_LOCALE, localePath } from '@/i18n/config';
import { useLocale } from '@/i18n/use-locale';

/**
 * `next/link` for internal pages: takes an unprefixed `href` and adds the current locale.
 * `englishOnly` pages exist at the unprefixed URL only, so from another locale it is a plain
 * `<a>` (a full load, like the language switcher).
 */
export function LocaleLink({
  href,
  englishOnly,
  ...props
}: React.ComponentProps<typeof Link> & { href: string; englishOnly?: boolean }) {
  const locale = useLocale();
  if (englishOnly && locale !== DEFAULT_LOCALE) {
    return <a href={href} {...(props as React.ComponentProps<'a'>)} />;
  }
  return <Link href={localePath(locale, href)} {...props} />;
}
