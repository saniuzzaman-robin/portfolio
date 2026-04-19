import type { Metadata } from 'next';
import { Navigation } from '@/components/sections/navigation';
import { AboutHero } from '@/components/sections/about-hero';
import { Footer } from '@/components/sections/footer';
import { SchemaScript } from '@/components/reusable/schema-script';
import { generatePersonSchema, generateWebPageSchema } from '@/lib/schema';

export const metadata: Metadata = {
  title: 'About Me | Md. Saniuzzaman Robin',
  description:
    'Learn about my background as a software engineer with 5+ years of experience. Competitive programming enthusiast with 1700+ problems solved. Passionate about building scalable, production-grade applications.',
  keywords: [
    'about',
    'software engineer',
    'background',
    'experience',
    'competitive programming',
    'B.Sc. Computer Science',
  ],
  openGraph: {
    url: 'https://saniuzzaman.dev/about',
    title: 'About Me | Saniuzzaman Robin',
    description:
      'Software engineer with deep expertise in system architecture and competitive programming.',
  },
};

export default function About() {
  return (
    <>
      <SchemaScript schema={generatePersonSchema()} />
      <SchemaScript
        schema={generateWebPageSchema({
          title: 'About Me | Md. Saniuzzaman Robin',
          description:
            'Software engineer with 5+ years of experience and competitive programming expertise',
          url: 'https://saniuzzaman.dev/about',
        })}
      />
      <main className="bg-neutral-5 text-neutral-90">
        <Navigation />
        <AboutHero />
        <Footer />
      </main>
    </>
  );
}
