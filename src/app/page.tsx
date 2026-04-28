import type { Metadata } from 'next';
import { Navigation } from '@/components/sections/navigation';
import { Hero } from '@/components/sections/hero';
import { Achievements } from '@/components/sections/achievements';
import { ProfessionalJourney } from '@/components/sections/professional-journey';
import { FeaturedProjects } from '@/components/sections/featured-projects';
import { CTA } from '@/components/sections/cta';
import { Footer } from '@/components/sections/footer';
import { SchemaScript } from '@/components/reusable/schema-script';
import { generatePersonSchema, generateWebPageSchema } from '@/lib/schema';

export const metadata: Metadata = {
  title: 'Home | Md. Saniuzzaman Robin - Full-Stack Software Engineer',
  description:
    'Explore my portfolio showcasing 5+ years of software engineering expertise. Specialized in building scalable applications with NestJS, Next.js, Angular, and competitive programming.',
  openGraph: {
    url: 'https://saniuzzaman.dev',
    title: 'Home | Md. Saniuzzaman Robin',
    description:
      'Full-stack software engineer with expertise in Next.js, NestJS, Angular, and system architecture.',
  },
};

export default function Home() {
  return (
    <>
      <SchemaScript schema={generatePersonSchema()} />
      <SchemaScript
        schema={generateWebPageSchema({
          title: 'Home | Md. Saniuzzaman Robin',
          description: 'Full-stack software engineer showcasing 5+ years of expertise',
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
