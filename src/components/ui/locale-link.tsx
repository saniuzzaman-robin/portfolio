'use client';

import Link from 'next/link';
import { localePath } from '@/i18n/config';
import { useLocale } from '@/i18n/use-locale';

/** `next/link` for internal pages: takes an unprefixed `href` and adds the current locale. */
export function LocaleLink({
  href,
  ...props
}: React.ComponentProps<typeof Link> & { href: string }) {
  return <Link href={localePath(useLocale(), href)} {...props} />;
}
