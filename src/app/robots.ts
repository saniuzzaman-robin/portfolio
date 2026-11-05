import type { MetadataRoute } from 'next';
import { SITE_URL, isProductionDeploy } from '@/lib/site';

export default function robots(): MetadataRoute.Robots {
  // Index only real production deployments.
  if (!isProductionDeploy()) {
    return { rules: { userAgent: '*', disallow: '/' } };
  }

  // Crawlers must be able to fetch /_next assets (JS/CSS) to render pages.
  return {
    rules: { userAgent: '*', allow: '/', disallow: '/api/' },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
