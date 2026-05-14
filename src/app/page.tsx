import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { Navigation } from '@/components/sections/navigation';
import { Hero } from '@/components/sections/hero';
import { SchemaScript } from '@/components/reusable/schema-script';

// Below-fold sections — code-split to reduce initial JS bundle
const Achievements = dynamic(() =>
  import('@/components/sections/achievements').then((m) => m.Achievements)
);
const ProfessionalJourney = dynamic(() =>
  import('@/components/sections/professional-journey').then((m) => m.ProfessionalJourney)
);
const FeaturedProjects = dynamic(() =>
  import('@/components/sections/featured-projects').then((m) => m.FeaturedProjects)
);
const CTA = dynamic(() => import('@/components/sections/cta').then((m) => m.CTA));
const Footer = dynamic(() => import('@/components/sections/footer').then((m) => m.Footer));
import { generatePersonSchema, generateWebPageSchema } from '@/lib/schema';
import { CV_DATA } from '@/lib/cv-data';

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
        url: 'https://saniuzzaman.dev/og_image.png',
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
        <CTA />
        <Footer />
      </main>
    </>
  );
}
