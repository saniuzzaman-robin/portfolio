import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site';

/**
 * Index only real production deployments. Vercel preview deployments also run with
 * NODE_ENV=production, so prefer VERCEL_ENV when it is available.
 */
function isIndexable(): boolean {
  if (process.env.VERCEL_ENV) return process.env.VERCEL_ENV === 'production';
  return process.env.NODE_ENV === 'production';
}

export default function robots(): MetadataRoute.Robots {
  if (!isIndexable()) {
    return { rules: { userAgent: '*', disallow: '/' } };
  }

  // Crawlers must be able to fetch /_next assets (JS/CSS) to render pages.
  return {
    rules: { userAgent: '*', allow: '/', disallow: '/api/' },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
