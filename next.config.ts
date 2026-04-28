import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* Production optimizations */
  reactCompiler: true,
  compress: true,
  productionBrowserSourceMaps: true,

  /* Image optimization */
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60 * 60 * 24 * 365, // 1 year
  },

  /* Headers for security and performance */
  async headers() {
    const isDev = process.env.NODE_ENV === 'development';
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              // Scripts: self + inline (Next.js needs unsafe-inline for its runtime) + unsafe-eval (React dev) + GA + AdSense + AdSense Quality Check
              `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''} https://www.googletagmanager.com https://www.google-analytics.com https://pagead2.googlesyndication.com https://partner.googleadservices.com https://tpc.googlesyndication.com https://*.adtrafficquality.google`,
              // Styles: self + inline (Tailwind / Next.js inlines critical CSS)
              "style-src 'self' 'unsafe-inline'",
              // Images: self + data URIs + GA pixel + AdSense + AdSense Quality Check
              "img-src 'self' data: https://www.googletagmanager.com https://www.google-analytics.com https://*.googlesyndication.com https://*.doubleclick.net https://*.adtrafficquality.google",
              // Fonts loaded from same origin
              "font-src 'self'",
              // Frames: Google services (Analytics, AdSense), AdSense Quality Check
              'frame-src https://www.google.com https://googleads.g.doubleclick.net https://tpc.googlesyndication.com https://*.adtrafficquality.google',
              // Fetch/XHR: GA, AdSense, AdSense Quality Check
              "connect-src 'self' https://www.google-analytics.com https://analytics.google.com https://stats.g.doubleclick.net https://pagead2.googlesyndication.com https://*.adtrafficquality.google",
            ].join('; '),
          },
        ],
      },
      {
        source: '/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },

  /* Redirects */
  async redirects() {
    return [];
  },

  /* Rewrites */
  async rewrites() {
    return [];
  },
};

export default nextConfig;
