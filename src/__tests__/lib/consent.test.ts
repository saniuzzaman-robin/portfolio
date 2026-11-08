// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  CONSENT_STORAGE_KEY,
  isEditingConsent,
  openConsentSettings,
  readConsent,
  setAnalyticsConsent,
  subscribeConsent,
} from '@/lib/consent';

describe('consent store', () => {
  afterEach(() => {
    localStorage.clear();
    delete window.gtag;
  });

  it('has no choice until one is saved', () => {
    expect(readConsent()).toBeNull();
  });

  it('ignores unknown stored values', () => {
    localStorage.setItem(CONSENT_STORAGE_KEY, 'maybe');
    expect(readConsent()).toBeNull();
  });

  it('saves the choice, updates gtag and notifies subscribers', () => {
    const gtag = vi.fn();
    window.gtag = gtag;
    const listener = vi.fn();
    const unsubscribe = subscribeConsent(listener);

    setAnalyticsConsent('granted');

    expect(readConsent()).toBe('granted');
    expect(gtag).toHaveBeenCalledWith('consent', 'update', { analytics_storage: 'granted' });
    expect(listener).toHaveBeenCalledOnce();
    unsubscribe();
  });

  it('works before gtag has loaded', () => {
    expect(() => setAnalyticsConsent('denied')).not.toThrow();
    expect(readConsent()).toBe('denied');
  });

  it('reopens the banner until a new choice is made', () => {
    setAnalyticsConsent('denied');
    openConsentSettings();
    expect(isEditingConsent()).toBe(true);
    setAnalyticsConsent('granted');
    expect(isEditingConsent()).toBe(false);
  });
});
