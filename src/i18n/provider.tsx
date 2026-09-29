'use client';

import { createContext, useContext, useMemo } from 'react';
import type { Locale } from '@/i18n/config';
import { buildDictionary, type ContentOverrides, type Dictionary } from '@/i18n/dictionary';
import type { Messages } from '@/i18n/messages/en';

const I18nContext = createContext<Dictionary | null>(null);

export function I18nProvider({
  locale,
  messages,
  overrides,
  children,
}: {
  locale: Locale;
  messages: Messages;
  overrides: ContentOverrides | null;
  children: React.ReactNode;
}) {
  const dictionary = useMemo(
    () => buildDictionary(locale, messages, overrides),
    [locale, messages, overrides]
  );
  return <I18nContext.Provider value={dictionary}>{children}</I18nContext.Provider>;
}

/** Localized UI strings and content for client components (server code uses `getDictionary`). */
export function useDictionary(): Dictionary {
  const dictionary = useContext(I18nContext);
  if (!dictionary) throw new Error('useDictionary must be used inside <I18nProvider>.');
  return dictionary;
}
