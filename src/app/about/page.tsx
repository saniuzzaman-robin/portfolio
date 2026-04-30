import type { Metadata } from 'next';
import { Navigation } from '@/components/sections/navigation';
import { AboutHero } from '@/components/sections/about-hero';
import { Footer } from '@/components/sections/footer';
import { SchemaScript } from '@/components/reusable/schema-script';
import { AdUnit } from '@/components/reusable/ad-unit';
import { generatePersonSchema, generateWebPageSchema } from '@/lib/schema';
import { CV_DATA } from '@/lib/cv-data';
import { AD_SLOTS } from '@/lib/ads-config';

export const metadata: Metadata = {
  title: 'About Me | Md. Saniuzzaman Robin',
  description: CV_DATA.summary,
  keywords: [
    'about',
    'software engineer',
    'background',
    'experience',
    'competitive programming',
    'B.Sc. Computer Science',
  ],
  alternates: {
    canonical: 'https://saniuzzaman.dev/about',
  },
  openGraph: {
    type: 'profile',
    url: 'https://saniuzzaman.dev/about',
    title: 'About Me | Saniuzzaman Robin',
    description: CV_DATA.aboutMeDesc,
    siteName: 'Saniuzzaman Robin Portfolio',
    images: [
      {
        url: 'https://saniuzzaman.dev/og_image.png',
        width: 1200,
        height: 630,
        alt: CV_DATA.name,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About Me | Saniuzzaman Robin',
    description: CV_DATA.aboutMeDesc,
    creator: '@saniuzzaman_robin',
    images: ['https://saniuzzaman.dev/og_image.png'],
  },
};

export default function About() {
  return (
    <>
      <SchemaScript schema={generatePersonSchema()} />
      <SchemaScript
        schema={generateWebPageSchema({
          title: 'About Me | Md. Saniuzzaman Robin',
          description: CV_DATA.aboutMeDesc,
          url: 'https://saniuzzaman.dev/about',
        })}
      />
      <main className="bg-neutral-5 text-neutral-90">
        <Navigation />
        <AboutHero />
        <div className="px-4 py-8 border-t border-white/5">
          <AdUnit slot={AD_SLOTS.ABOUT_BANNER} format="horizontal" className="max-w-4xl mx-auto" />
        </div>
        <Footer />
      </main>
    </>
  );
}
