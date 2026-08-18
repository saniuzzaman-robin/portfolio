import type { Metadata } from 'next';
import { HomeView } from '@/components/craft/home-view';
import { SchemaScript } from '@/components/reusable/schema-script';
import { generatePersonSchema, generateWebPageSchema } from '@/lib/schema';
import { CV_DATA } from '@/lib/cv-data';

export const metadata: Metadata = {
  title: `${CV_DATA.name} | ${CV_DATA.title}`,
  description: CV_DATA.summary,
  keywords: [
    'Md. Saniuzzaman Robin',
    'portfolio',
    'software engineer',
    'full-stack',
    'next.js',
    'nestjs',
    'angular',
    'competitive programming',
    'icpc',
  ],
  alternates: { canonical: 'https://saniuzzaman.dev' },
  openGraph: {
    type: 'website',
    url: 'https://saniuzzaman.dev',
    title: `${CV_DATA.name} | ${CV_DATA.title}`,
    description: CV_DATA.summary,
    siteName: 'Saniuzzaman Robin Portfolio',
    images: [
      { url: 'https://saniuzzaman.dev/og_image.png', width: 1200, height: 630, alt: CV_DATA.name },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${CV_DATA.name} | ${CV_DATA.title}`,
    description: CV_DATA.summary,
    creator: '@saniuzzaman_robin',
    images: ['https://saniuzzaman.dev/og_image.png'],
  },
};

export default function Home() {
  return (
    <>
      <SchemaScript schema={generatePersonSchema()} />
      <SchemaScript
        schema={generateWebPageSchema({
          title: `Home | ${CV_DATA.name}`,
          description: `${CV_DATA.title} with 5+ years of engineering experience`,
          url: 'https://saniuzzaman.dev',
        })}
      />
      <HomeView />
    </>
  );
}
