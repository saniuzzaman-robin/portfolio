import type { AnalyticsConsent } from '@/lib/consent';
import { TOOLS_PATH } from '@/lib/data/tools';

declare global {
  interface Window {
    /** Both defined by `GoogleTagManager`, only on the production host. */
    dataLayer?: unknown[];
    gtag?: (
      command: 'consent',
      action: 'update',
      params: { analytics_storage: AnalyticsConsent }
    ) => void;
  }
}

export type ToolAction = 'run' | 'copy' | 'download';

/**
 * Pushes a custom event to GTM's dataLayer (a GA4 Event tag in the container forwards it); a
 * no-op wherever GTM isn't loaded (dev, previews, blocked). Never pass user input or other
 * personal data in `params`. GTM keeps each key's last value across pushes, so pass `undefined`
 * for keys that don't apply to this event rather than leaving them out.
 */
export function trackEvent(name: string, params?: Record<string, string | undefined>) {
  if (typeof window === 'undefined') return;
  window.dataLayer?.push({ event: name, ...params });
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
  trackEvent(`tool_${action}`, { tool, preset });
}
