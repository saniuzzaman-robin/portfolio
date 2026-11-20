'use client';

import { useSyncExternalStore } from 'react';
import { buttonClass } from '@/components/ui/button';
import { useDictionary } from '@/i18n/provider';
import {
  isEditingConsent,
  openConsentSettings,
  readConsent,
  setAnalyticsConsent,
  subscribeConsent,
} from '@/lib/consent';

/**
 * Asks once for analytics cookies; "Cookie settings" in the footer reopens it. Rendered only
 * when `isAnalyticsEnabled()`. Hidden until
 * hydrated (the server can't know the saved choice), so returning visitors never see it flash.
 */
export function ConsentBanner() {
  const { t } = useDictionary();
  const visible = useSyncExternalStore(
    subscribeConsent,
    () => readConsent() === null || isEditingConsent(),
    () => false
  );
  if (!visible) return null;

  return (
    <section
      aria-label={t.consent.label}
      className="enter enter-up fixed inset-x-4 bottom-4 z-50 rounded-2xl border border-line-strong bg-elevated p-4 shadow-pop [--enter-duration:0.5s] sm:inset-x-auto sm:end-4 sm:max-w-sm print:hidden"
    >
      <p className="text-sm leading-relaxed text-fg-muted">{t.consent.message}</p>
      <div className="mt-3 flex justify-end gap-2">
        <button
          type="button"
          onClick={() => setAnalyticsConsent('denied')}
          className={buttonClass({ variant: 'secondary', size: 'sm' })}
        >
          {t.consent.decline}
        </button>
        <button
          type="button"
          onClick={() => setAnalyticsConsent('granted')}
          className={buttonClass({ size: 'sm' })}
        >
          {t.consent.accept}
        </button>
      </div>
    </section>
  );
}

/** Footer link that reopens the banner so a choice can be changed or withdrawn. */
export function ConsentSettingsButton({ label }: { label: string }) {
  return (
    <button
      type="button"
      onClick={openConsentSettings}
      className="cursor-pointer py-2 transition-colors hover:text-fg print:hidden"
    >
      {label}
    </button>
  );
}
