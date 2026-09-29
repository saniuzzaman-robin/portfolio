import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/metadata';
import { SITE_URL } from '@/lib/site';
import { Hero } from '@/components/home/hero';
import { TechMarquee } from '@/components/home/tech-marquee';
import { SelectedWork } from '@/components/home/selected-work';
import { ExperienceTimeline } from '@/components/home/experience-timeline';
import { Capabilities } from '@/components/home/capabilities';
import { ContactCta } from '@/components/home/contact-cta';
import { Footer } from '@/components/layout/footer';
import { SchemaScript } from '@/components/reusable/schema-script';
import { generatePersonSchema, generateWebPageSchema } from '@/lib/schema';
import { CV_DATA } from '@/lib/cv-data';

export const metadata: Metadata = pageMetadata({
  description: CV_DATA.summary,
  path: '/',
  keywords: [
    'Md. Saniuzzaman Robin',
    'Saniuzzaman Robin',
    'software engineer',
    'full-stack engineer',
    'Next.js developer',
    'NestJS developer',
    'Angular developer',
    'Dhaka',
    'Bangladesh',
  ],
});

export default function Home() {
  return (
    <>
      <SchemaScript schema={generatePersonSchema()} />
      <SchemaScript
        schema={generateWebPageSchema({
          title: `Home | ${CV_DATA.name}`,
          description: `${CV_DATA.title} with 5+ years of engineering experience`,
          url: SITE_URL,
        })}
      />
      <Hero />
      <TechMarquee />
      <SelectedWork />
      <ExperienceTimeline />
      <Capabilities />
      <ContactCta index="04" />
      <Footer />
    </>
  );
}
