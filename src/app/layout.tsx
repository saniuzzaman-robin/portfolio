import type { Metadata } from 'next';
import { Space_Grotesk, Manrope } from 'next/font/google';
import Script from 'next/script';
import { SkipLink } from '@/components/reusable/skip-link';
import { SchemaScript } from '@/components/reusable/schema-script';
import { GoogleAnalytics } from '@/components/reusable/google-analytics';
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
  openGraph: {
    type: 'website',
    url: 'https://saniuzzaman.dev',
    title: 'Md. Saniuzzaman Robin | Software Engineer',
    description:
      'Full-stack software engineer with 5+ years of experience. Building scalable solutions with NestJS & Next.js.',
    siteName: 'Saniuzzaman Robin Portfolio',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Md. Saniuzzaman Robin | Software Engineer',
    description:
      'Full-stack software engineer with 5+ years of experience building production-grade applications.',
    creator: '@saniuzzaman_robin',
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
      className={`${spaceGrotesk.variable} ${manrope.variable} h-full antialiased`}
    >
      <head>
        <SchemaScript schema={generateOrganizationSchema()} />
        <GoogleAnalytics />
      </head>
      <body className="min-h-full flex flex-col">
        <SkipLink />
        <main id="main-content">{children}</main>
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6258584982158882"
          crossOrigin="anonymous"
          strategy="lazyOnload"
        />
      </body>
    </html>
  );
}
