import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans, Inter, JetBrains_Mono } from 'next/font/google';
import { SkipLink } from '@/components/reusable/skip-link';
import { SchemaScript } from '@/components/reusable/schema-script';
import { GoogleAnalytics } from '@/components/reusable/google-analytics';
import { ThemeProvider } from '@/components/reusable/theme-provider';
import { generateWebsiteSchema } from '@/lib/schema';
import { CV_DATA } from '@/lib/cv-data';
import { OG_IMAGE, SITE_NAME, SITE_URL } from '@/lib/site';
import { THEME_COLORS, THEME_INIT_SCRIPT } from '@/lib/theme';
import { AppShell } from '@/components/layout/app-shell';
import './globals.css';

// Variable fonts: one file per family covers every weight used.
const jakartaSans = Plus_Jakarta_Sans({
  variable: '--font-jakarta',
  subsets: ['latin'],
  display: 'swap',
});

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
});

// Only used for small labels; don't let it compete with critical fonts.
const jetbrainsMono = JetBrains_Mono({
  variable: '--font-jetbrains',
  subsets: ['latin'],
  display: 'swap',
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${CV_DATA.name} | ${CV_DATA.title}`,
    template: `%s | ${CV_DATA.name}`,
  },
  description: CV_DATA.shortBio,
  applicationName: SITE_NAME,
  authors: [{ name: CV_DATA.name, url: SITE_URL }],
  creator: CV_DATA.name,
  category: 'technology',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-32x32.png', type: 'image/png', sizes: '32x32' },
      { url: '/favicon-16x16.png', type: 'image/png', sizes: '16x16' },
    ],
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    type: 'website',
    siteName: SITE_NAME,
    locale: 'en_US',
    images: [{ ...OG_IMAGE, alt: `${CV_DATA.name} — ${CV_DATA.title}` }],
  },
  twitter: { card: 'summary_large_image' },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  formatDetection: { telephone: false, address: false, email: false },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  // Lets content use the full screen on notched devices; safe-area padding is in globals.css.
  viewportFit: 'cover',
  colorScheme: 'dark light',
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: THEME_COLORS.dark },
    { media: '(prefers-color-scheme: light)', color: THEME_COLORS.light },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      data-theme="dark"
      className={`${jakartaSans.variable} ${inter.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        <SchemaScript schema={generateWebsiteSchema()} />
        <GoogleAnalytics />
      </head>
      <body className="flex min-h-dvh flex-col">
        <ThemeProvider>
          <SkipLink />
          <AppShell>
            <main id="main-content" className="flex flex-1 flex-col">
              {children}
            </main>
          </AppShell>
        </ThemeProvider>
      </body>
    </html>
  );
}
