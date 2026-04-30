import type { Metadata } from 'next';
import { Navigation } from '@/components/sections/navigation';
import { Hero } from '@/components/sections/hero';
import { Achievements } from '@/components/sections/achievements';
import { ProfessionalJourney } from '@/components/sections/professional-journey';
import { FeaturedProjects } from '@/components/sections/featured-projects';
import { CTA } from '@/components/sections/cta';
import { Footer } from '@/components/sections/footer';
import { SchemaScript } from '@/components/reusable/schema-script';
import { AdUnit } from '@/components/reusable/ad-unit';
import { generatePersonSchema, generateWebPageSchema } from '@/lib/schema';
import { CV_DATA } from '@/lib/cv-data';
import { AD_SLOTS } from '@/lib/ads-config';

export const metadata: Metadata = {
  title: `Home | ${CV_DATA.name} - ${CV_DATA.title}`,
  description: `Explore my portfolio showcasing ${CV_DATA.yearsOfExperience} years of software engineering expertise. Specialized in building scalable applications with NestJS, Next.js, Angular, and competitive programming.`,
  keywords: [
    'portfolio',
    'software engineer',
    'full-stack',
    'next.js',
    'nestjs',
    'angular',
    'web development',
  ],
  alternates: {
    canonical: 'https://saniuzzaman.dev',
  },
  openGraph: {
    type: 'website',
    url: 'https://saniuzzaman.dev',
    title: `Home | ${CV_DATA.name}`,
    description: `${CV_DATA.title} with expertise in Next.js, NestJS, Angular, and system architecture.`,
    siteName: 'Saniuzzaman Robin Portfolio',
    images: [
      {
        url: 'https://saniuzzaman.dev/logo.png',
        width: 1200,
        height: 630,
        alt: CV_DATA.name,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `Home | ${CV_DATA.name}`,
    description: `${CV_DATA.title} - Full-stack software engineer`,
    creator: '@saniuzzaman_robin',
    images: ['https://saniuzzaman.dev/logo.png'],
  },
};

export default function Home() {
  return (
    <>
      <SchemaScript schema={generatePersonSchema()} />
      <SchemaScript
        schema={generateWebPageSchema({
          title: `Home | ${CV_DATA.name}`,
          description: `${CV_DATA.title} showcasing ${CV_DATA.yearsOfExperience} years of expertise`,
          url: 'https://saniuzzaman.dev',
        })}
      />
      <main className="bg-neutral-5 text-neutral-90">
        <Navigation />
        <Hero />
        <Achievements />
        <ProfessionalJourney />
        <FeaturedProjects />
        <div className="px-4 py-8 border-t border-white/5">
          <AdUnit slot={AD_SLOTS.HOME_BANNER} format="horizontal" className="max-w-4xl mx-auto" />
        </div>
        <CTA />
        <Footer />
      </main>
    </>
  );
}
