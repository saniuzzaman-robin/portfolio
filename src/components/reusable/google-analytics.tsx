import Script from 'next/script';
import { CONSENT_REGIONS, CONSENT_STORAGE_KEY } from '@/lib/consent';
import { GA_MEASUREMENT_ID, SITE_URL } from '@/lib/site';

const PRODUCTION_HOST = new URL(SITE_URL).hostname;

/**
 * GA4, loaded with `lazyOnload` (browser idle) so the ~170 KB gtag bundle never competes
 * with first paint or interactivity. Only runs on the production hostname, so local
 * builds and preview deployments don't pollute analytics.
 *
 * Consent Mode v2 (advanced): ad signals are always denied; analytics cookies default to denied
 * in `CONSENT_REGIONS` and granted elsewhere, then follow the visitor's saved banner choice.
 */
export function GoogleAnalytics() {
  if (!GA_MEASUREMENT_ID) return null;

  const loader = `(function(){if(location.hostname!==${JSON.stringify(PRODUCTION_HOST)})return;var s=document.createElement('script');s.async=true;s.src='https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}';document.head.appendChild(s);window.dataLayer=window.dataLayer||[];window.gtag=function(){dataLayer.push(arguments);};var ads={ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'};gtag('consent','default',Object.assign({analytics_storage:'denied',region:${JSON.stringify(CONSENT_REGIONS)}},ads));gtag('consent','default',Object.assign({analytics_storage:'granted'},ads));try{var c=localStorage.getItem(${JSON.stringify(CONSENT_STORAGE_KEY)});if(c==='granted'||c==='denied')gtag('consent','update',{analytics_storage:c});}catch(e){}gtag('js',new Date());gtag('config','${GA_MEASUREMENT_ID}');})();`;

  return (
    <Script id="google-analytics" strategy="lazyOnload">
      {loader}
    </Script>
  );
}
