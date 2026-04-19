import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const isProduction = process.env.NODE_ENV === 'production';
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://saniuzzaman.dev';

  if (!isProduction) {
    // Block all indexing in non-production environments
    return {
      rules: {
        userAgent: '*',
        disallow: '/',
      },
    };
  }

  // Allow indexing in production
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: '/api/',
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
