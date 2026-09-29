import { cache } from 'react';
import type { Locale } from '@/i18n/config';
import { buildDictionary, type ContentOverrides, type Dictionary } from '@/i18n/dictionary';
import type { Messages } from '@/i18n/messages/en';
import { en } from '@/i18n/messages/en';
import { bn } from '@/i18n/messages/bn';
import { ar } from '@/i18n/messages/ar';
import { bnContent } from '@/i18n/content/bn';
import { arContent } from '@/i18n/content/ar';

/**
 * Server-only: bundles every locale. Client components get the current locale's slice
 * through `I18nProvider` instead of importing this module.
 */
const MESSAGES: Record<Locale, Messages> = { en, bn, ar };
const CONTENT: Record<Locale, ContentOverrides | null> = { en: null, bn: bnContent, ar: arContent };

/** What the client provider needs: the current locale's strings and content overrides only. */
export function getI18nPayload(locale: Locale) {
  return { locale, messages: MESSAGES[locale], overrides: CONTENT[locale] };
}

export const getDictionary = cache((locale: Locale): Dictionary =>
  buildDictionary(locale, MESSAGES[locale], CONTENT[locale])
);
