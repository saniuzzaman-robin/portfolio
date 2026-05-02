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
              // Scripts: self + inline (Next.js needs unsafe-inline for its runtime) + unsafe-eval (React dev) + GA
              `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''} https://www.googletagmanager.com https://www.google-analytics.com`,
              // Styles: self + inline (Tailwind / Next.js inlines critical CSS)
              "style-src 'self' 'unsafe-inline'",
              // Images: self + data URIs + GA pixel
              "img-src 'self' data: https://www.googletagmanager.com https://www.google-analytics.com",
              // Fonts loaded from same origin
              "font-src 'self'",
              // Frames: none needed
              "frame-src 'none'",
              // Web Workers (OffscreenCanvas particle animation)
              "worker-src 'self'",
              // Fetch/XHR: GA
              "connect-src 'self' https://www.google-analytics.com https://analytics.google.com https://stats.g.doubleclick.net",
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
