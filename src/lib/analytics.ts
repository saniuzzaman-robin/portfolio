import type { AnalyticsConsent } from '@/lib/consent';
import { TOOLS_PATH } from '@/lib/data/tools';

declare global {
  interface Window {
    /** Defined by `GoogleAnalytics` only on the production host. */
    gtag?: {
      (command: 'event', name: string, params?: Record<string, string>): void;
      (command: 'consent', action: 'update', params: { analytics_storage: AnalyticsConsent }): void;
    };
  }
}

export type ToolAction = 'run' | 'copy' | 'download';

/**
 * Sends a GA4 event; a no-op wherever gtag isn't loaded (dev, previews, blocked). Never pass
 * user input or other personal data in `params`.
 */
export function trackEvent(name: string, params?: Record<string, string>) {
  if (typeof window === 'undefined') return;
  window.gtag?.('event', name, params);
}

export type CvDownloadLocation =
  'hero' | 'navbar' | 'mobile_nav' | 'footer' | 'resume' | 'command_menu';

/** `cv_download`, tagged with the control that started it. */
export function trackCvDownload(location: CvDownloadLocation) {
  trackEvent('cv_download', { location });
}

/** `tool_<action>` with the tool (and preset, on a preset page) read from the current URL. */
export function trackToolEvent(action: ToolAction) {
  if (typeof window === 'undefined') return;
  const prefix = `${TOOLS_PATH}/`;
  const { pathname } = window.location;
  if (!pathname.startsWith(prefix)) return;
  const [tool, preset] = pathname.slice(prefix.length).split('/').filter(Boolean);
  if (!tool) return;
  trackEvent(`tool_${action}`, preset ? { tool, preset } : { tool });
}
