import type { Metadata, Viewport } from 'next';
import {
  Plus_Jakarta_Sans,
  Inter,
  JetBrains_Mono,
  Noto_Sans_Arabic,
  Noto_Sans_Bengali,
} from 'next/font/google';
import { SkipLink } from '@/components/reusable/skip-link';
import { SchemaScript } from '@/components/reusable/schema-script';
import { GoogleAnalytics } from '@/components/reusable/google-analytics';
import { ThemeProvider } from '@/components/reusable/theme-provider';
import { generateWebsiteSchema } from '@/lib/schema';
import { CV_DATA } from '@/lib/cv-data';
import { OG_IMAGE, SITE_NAME, SITE_URL } from '@/lib/site';
import { THEME_COLORS, THEME_INIT_SCRIPT } from '@/lib/theme';
import { AppShell } from '@/components/layout/app-shell';
import { LOCALES, LOCALE_META, toLocale, type Locale } from '@/i18n/config';
import { I18nProvider } from '@/i18n/provider';
import { getDictionary, getI18nPayload } from '@/i18n/server';
import { cn } from '@/lib/cn';
import '../globals.css';

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

// Script fonts share one variable (`--font-script`, the fallback in the sans/heading stacks) and
// only the current locale's class is applied, so other locales never download them.
const notoBengali = Noto_Sans_Bengali({
  variable: '--font-script',
  subsets: ['bengali'],
  display: 'swap',
  preload: false,
});

const notoArabic = Noto_Sans_Arabic({
  variable: '--font-script',
  subsets: ['arabic'],
  display: 'swap',
  preload: false,
});

const SCRIPT_FONT: Partial<Record<Locale, string>> = {
  bn: notoBengali.variable,
  ar: notoArabic.variable,
};

// Every locale is prerendered; anything else 404s.
export const dynamicParams = false;

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { locale, cv } = getDictionary(toLocale((await params).lang));
  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: `${CV_DATA.name} | ${cv.title}`,
      template: `%s | ${CV_DATA.name}`,
    },
    description: cv.shortBio,
    applicationName: SITE_NAME,
    authors: [{ name: CV_DATA.name, url: SITE_URL }],
    creator: CV_DATA.name,
    category: 'technology',
    icons: {
      icon: [
        { url: '/favicon.ico', sizes: 'any' },
        { url: '/favicon.svg', type: 'image/svg+xml' },
        { url: '/favicon-32x32.png', type: 'image/png', sizes: '32x32' },
        { url: '/favicon-16x16.png', type: 'image/png', sizes: '16x16' },
      ],
      apple: '/apple-touch-icon.png',
    },
    openGraph: {
      type: 'website',
      siteName: SITE_NAME,
      locale: LOCALE_META[locale].ogLocale,
      images: [{ ...OG_IMAGE, alt: `${CV_DATA.name} — ${cv.title}` }],
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
}

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

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}>) {
  const lang = toLocale((await params).lang);
  return (
    <html
      lang={lang}
      dir={LOCALE_META[lang].dir}
      data-scroll-behavior="smooth"
      data-theme="dark"
      className={cn(
        jakartaSans.variable,
        inter.variable,
        jetbrainsMono.variable,
        SCRIPT_FONT[lang]
      )}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        <SchemaScript schema={generateWebsiteSchema()} />
        <GoogleAnalytics />
      </head>
      <body className="flex min-h-dvh flex-col">
        <ThemeProvider>
          <I18nProvider {...getI18nPayload(lang)}>
            <SkipLink label={getDictionary(lang).t.a11y.skipToContent} />
            <AppShell>
              <main id="main-content" className="flex flex-1 flex-col">
                {children}
              </main>
            </AppShell>
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
