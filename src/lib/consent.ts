export type AnalyticsConsent = 'granted' | 'denied';

export const CONSENT_STORAGE_KEY = 'analytics-consent';

/**
 * Where analytics cookies wait for consent (Consent Mode v2 `region`, matched by Google from the
 * visitor's IP): the EEA, the UK and Switzerland. Everywhere else defaults to granted.
 */
export const CONSENT_REGIONS = [
  'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR', 'HU', 'IE', 'IT', 'LV',
  'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE', 'IS', 'LI', 'NO', 'GB', 'CH',
] as const; // prettier-ignore

export function isAnalyticsConsent(value: unknown): value is AnalyticsConsent {
  return value === 'granted' || value === 'denied';
}

/* ---------- choice store (localStorage, synced across tabs) ---------- */

const listeners = new Set<() => void>();
let editing = false;

export function readConsent(): AnalyticsConsent | null {
  try {
    const stored = localStorage.getItem(CONSENT_STORAGE_KEY);
    return isAnalyticsConsent(stored) ? stored : null;
  } catch {
    // Storage unavailable (privacy mode): ask again next visit.
    return null;
  }
}

/** True while the visitor has reopened the banner to change an earlier choice. */
export function isEditingConsent(): boolean {
  return editing;
}

export function subscribeConsent(listener: () => void): () => void {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (event.key === CONSENT_STORAGE_KEY) listener();
  };
  window.addEventListener('storage', onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener('storage', onStorage);
  };
}

/** Saves the choice and applies it to gtag right away (if loaded; the loader reads it otherwise). */
export function setAnalyticsConsent(choice: AnalyticsConsent) {
  try {
    localStorage.setItem(CONSENT_STORAGE_KEY, choice);
  } catch {
    // Not persisted, but still applied for this page view.
  }
  window.gtag?.('consent', 'update', { analytics_storage: choice });
  editing = false;
  listeners.forEach((listener) => listener());
}

export function openConsentSettings() {
  editing = true;
  listeners.forEach((listener) => listener());
}
