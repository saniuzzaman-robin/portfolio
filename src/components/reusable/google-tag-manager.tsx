import Script from 'next/script';
import { CONSENT_REGIONS, CONSENT_STORAGE_KEY } from '@/lib/consent';
import { GTM_CONTAINER_ID, SITE_URL, isAnalyticsEnabled } from '@/lib/site';

const PRODUCTION_HOST = new URL(SITE_URL).hostname;

/**
 * Google Tag Manager (GA4 runs from a Google tag inside the container), loaded with `lazyOnload`
 * (browser idle) so it never competes with first paint or interactivity. Rendered only on
 * production deployments and, as a second guard, only runs on the production hostname, so
 * staging, previews and local builds don't pollute analytics.
 *
 * Consent Mode v2 (advanced): ad signals are always denied; analytics cookies default to denied
 * in `CONSENT_REGIONS` and granted elsewhere, then follow the visitor's saved banner choice. The
 * consent commands go into the dataLayer before gtm.js loads, so every tag sees them.
 */
export function GoogleTagManager() {
  if (!isAnalyticsEnabled()) return null;

  const loader = `(function(){if(location.hostname!==${JSON.stringify(PRODUCTION_HOST)})return;window.dataLayer=window.dataLayer||[];window.gtag=function(){dataLayer.push(arguments);};var ads={ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'};gtag('consent','default',Object.assign({analytics_storage:'denied',region:${JSON.stringify(CONSENT_REGIONS)}},ads));gtag('consent','default',Object.assign({analytics_storage:'granted'},ads));try{var c=localStorage.getItem(${JSON.stringify(CONSENT_STORAGE_KEY)});if(c==='granted'||c==='denied')gtag('consent','update',{analytics_storage:c});}catch(e){}dataLayer.push({'gtm.start':new Date().getTime(),event:'gtm.js'});var s=document.createElement('script');s.async=true;s.src='https://www.googletagmanager.com/gtm.js?id=${GTM_CONTAINER_ID}';document.head.appendChild(s);})();`;

  return (
    <Script id="google-tag-manager" strategy="lazyOnload">
      {loader}
    </Script>
  );
}
