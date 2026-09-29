import Script from 'next/script';
import { GA_MEASUREMENT_ID, SITE_URL } from '@/lib/site';

const PRODUCTION_HOST = new URL(SITE_URL).hostname;

/**
 * GA4, loaded with `lazyOnload` (browser idle) so the ~170 KB gtag bundle never competes
 * with first paint or interactivity. Only runs on the production hostname, so local
 * builds and preview deployments don't pollute analytics.
 */
export function GoogleAnalytics() {
  if (!GA_MEASUREMENT_ID) return null;

  const loader = `(function(){if(location.hostname!==${JSON.stringify(PRODUCTION_HOST)})return;var s=document.createElement('script');s.async=true;s.src='https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}';document.head.appendChild(s);window.dataLayer=window.dataLayer||[];window.gtag=function(){dataLayer.push(arguments);};gtag('js',new Date());gtag('config','${GA_MEASUREMENT_ID}');})();`;

  return (
    <Script id="google-analytics" strategy="lazyOnload">
      {loader}
    </Script>
  );
}
