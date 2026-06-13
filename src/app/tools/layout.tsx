import type { Metadata } from 'next';
import { ReactNode } from 'react';
import { Navigation } from '@/components/sections/navigation';
import { Footer } from '@/components/sections/footer';

export const metadata: Metadata = {
  title: 'Developer Tools | Saniuzzaman Robin',
  description:
    'Free in-browser developer utilities — Base64 encoder/decoder, UUID & ULID generator, JSON formatter with diff, HTML/CSS/JS minifier, JWT decoder, URL encoder, cryptographic hash generator, Unix timestamp converter, regex tester, and color converter. No installs, no telemetry.',
  keywords: [
    'base64',
    'uuid',
    'ulid',
    'nanoid',
    'json formatter',
    'json diff',
    'jwt decoder',
    'url encoder',
    'hash generator',
    'md5',
    'sha256',
    'timestamp converter',
    'unix time',
    'regex tester',
    'color converter',
    'developer tools',
    'web tools',
    'free tools',
    'utility',
    'online tools',
  ],
  authors: [{ name: 'Saniuzzaman Robin' }],
  openGraph: {
    type: 'website',
    url: 'https://saniuzzaman.dev/tools',
    title: 'Developer Tools | Saniuzzaman Robin',
    description:
      '10 free in-browser developer utilities. Base64, UUID, JSON, JWT, URL, Hash, Timestamp, Regex, Color converters.',
    siteName: 'Saniuzzaman Robin Portfolio',
    images: [
      {
        url: 'https://saniuzzaman.dev/og_image.png',
        width: 1200,
        height: 630,
        alt: 'Saniuzzaman Robin - Developer Tools',
      },
    ],
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Developer Tools | Saniuzzaman Robin',
    description: 'Free Base64, UUID, JSON, JWT, URL, Hash, Timestamp, Regex, Color utilities',
    creator: '@saniuzzaman_robin',
    images: ['https://saniuzzaman.dev/og_image.png'],
  },
  robots: { index: true, follow: true, nocache: false },
  alternates: { canonical: 'https://saniuzzaman.dev/tools' },
};

export default function ToolsLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Navigation />
      {children}
      <Footer />
    </>
  );
}
