'use client';

import { LOCALES, LOCALE_META, localePath } from '@/i18n/config';
import { useLocale, useUnprefixedPath } from '@/i18n/use-locale';
import { cn } from '@/lib/cn';
import { useDictionary } from '@/i18n/provider';

/**
 * Links to the current page in every locale. Plain `<a>` on purpose: all locales share the
 * `[lang]` root layout, so `next/link` would re-render `<html>`/`<head>` (lang, dir, fonts,
 * inline scripts) on the client. A full page load swaps them cleanly.
 */
export function LanguageSwitcher({
  variant = 'compact',
  onNavigate,
  className,
}: {
  variant?: 'compact' | 'full';
  onNavigate?: () => void;
  className?: string;
}) {
  const current = useLocale();
  const path = useUnprefixedPath();
  const { t } = useDictionary();

  return (
    <ul
      aria-label={t.common.language}
      className={cn(
        'flex items-center gap-1 rounded-full border border-line bg-surface-2 p-1',
        variant === 'full' && 'grid grid-cols-3 rounded-2xl',
        className
      )}
    >
      {LOCALES.map((locale) => {
        const active = locale === current;
        const { label, short } = LOCALE_META[locale];
        return (
          <li key={locale}>
            <a
              href={localePath(locale, path)}
              hrefLang={locale}
              lang={locale}
              onClick={onNavigate}
              aria-current={active ? 'true' : undefined}
              aria-label={variant === 'compact' ? label : undefined}
              className={cn(
                'block text-center font-semibold transition-colors',
                variant === 'compact'
                  ? 'rounded-full px-2.5 py-1 text-[11px]'
                  : 'rounded-xl py-2.5 text-xs',
                active ? 'bg-elevated text-primary-text shadow-sm' : 'text-fg-subtle hover:text-fg'
              )}
            >
              {variant === 'compact' ? short : label}
            </a>
          </li>
        );
      })}
    </ul>
  );
}
