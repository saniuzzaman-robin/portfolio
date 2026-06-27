import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, Inter, JetBrains_Mono } from 'next/font/google';
import { SkipLink } from '@/components/reusable/skip-link';
import { SchemaScript } from '@/components/reusable/schema-script';
import { GoogleAnalytics } from '@/components/reusable/google-analytics';
import { ThemeProvider } from '@/components/reusable/theme-provider';
import { generateOrganizationSchema } from '@/lib/schema';
import './globals.css';

const jakartaSans = Plus_Jakarta_Sans({
  variable: '--font-heading',
  weight: ['700', '800'],
  subsets: ['latin'],
  display: 'swap',
});

const inter = Inter({
  variable: '--font-body',
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-mono',
  weight: ['400', '500'],
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Md. Saniuzzaman Robin | Software Engineer',
  description:
    'Full-stack software engineer with 5+ years of experience building production-grade web applications. Specialized in NestJS, Next.js, Angular, and competitive programming with 1700+ problems solved.',
  keywords: [
    'software engineer',
    'next.js',
    'nestjs',
    'angular',
    'full-stack',
    'web development',
    'competitive programming',
    'dhaka',
  ],
  authors: [{ name: 'Md. Saniuzzaman Robin', url: 'https://saniuzzaman.dev' }],
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
    other: [
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '32x32',
        url: '/favicon-32x32.png',
      },
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '16x16',
        url: '/favicon-16x16.png',
      },
    ],
  },
  openGraph: {
    type: 'website',
    url: 'https://saniuzzaman.dev',
    title: 'Md. Saniuzzaman Robin | Software Engineer',
    description:
      'Full-stack software engineer with 5+ years of experience. Building scalable solutions with NestJS & Next.js.',
    siteName: 'Saniuzzaman Robin Portfolio',
    locale: 'en_US',
    images: [
      {
        url: 'https://saniuzzaman.dev/og_image.png',
        width: 1200,
        height: 630,
        alt: 'Md. Saniuzzaman Robin - Software Engineer',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Md. Saniuzzaman Robin | Software Engineer',
    description:
      'Full-stack software engineer with 5+ years of experience building production-grade applications.',
    creator: '@saniuzzaman_robin',
    images: ['https://saniuzzaman.dev/og_image.png'],
  },
  robots: 'index, follow',
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
      className={`${jakartaSans.variable} ${inter.variable} ${jetbrainsMono.variable} antialiased`}
      suppressHydrationWarning
    >
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#0f172a" />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');if(t==='light'||t==='dark'){document.documentElement.setAttribute('data-theme',t);}}catch(e){}})();`,
          }}
        />
        <SchemaScript schema={generateOrganizationSchema()} />
        <GoogleAnalytics />
      </head>
      <body className="flex min-h-dvh flex-col">
        <ThemeProvider>
          <SkipLink />
          <main id="main-content">{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}
