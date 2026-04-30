import type { Metadata } from 'next';
import { Space_Grotesk, Manrope } from 'next/font/google';
import { SkipLink } from '@/components/reusable/skip-link';
import { SchemaScript } from '@/components/reusable/schema-script';
import { GoogleAnalytics } from '@/components/reusable/google-analytics';
import { AdSenseLoader } from '@/components/reusable/adsense-loader';
import { generateOrganizationSchema } from '@/lib/schema';
import './globals.css';

const spaceGrotesk = Space_Grotesk({
  variable: '--font-space-grotesk',
  subsets: ['latin'],
});

const manrope = Manrope({
  variable: '--font-manrope',
  subsets: ['latin'],
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
  alternates: {
    canonical: 'https://saniuzzaman.dev',
  },
  openGraph: {
    type: 'website',
    url: 'https://saniuzzaman.dev',
    title: 'Md. Saniuzzaman Robin | Software Engineer',
    description:
      'Full-stack software engineer with 5+ years of experience. Building scalable solutions with NestJS & Next.js.',
    siteName: 'Saniuzzaman Robin Portfolio',
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
      className={`${spaceGrotesk.variable} ${manrope.variable} antialiased`}
    >
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#080d1a" />
        <SchemaScript schema={generateOrganizationSchema()} />
        <GoogleAnalytics />
      </head>
      <body className="min-h-dvh flex flex-col">
        <AdSenseLoader />
        <SkipLink />
        <main id="main-content">{children}</main>
      </body>
    </html>
  );
}
