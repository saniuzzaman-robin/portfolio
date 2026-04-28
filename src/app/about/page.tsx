import type { Metadata } from 'next';
import { Navigation } from '@/components/sections/navigation';
import { AboutHero } from '@/components/sections/about-hero';
import { Footer } from '@/components/sections/footer';
import { SchemaScript } from '@/components/reusable/schema-script';
import { generatePersonSchema, generateWebPageSchema } from '@/lib/schema';
import { CV_DATA } from '@/lib/cv-data';

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
  openGraph: {
    url: 'https://saniuzzaman.dev/about',
    title: 'About Me | Saniuzzaman Robin',
    description: CV_DATA.aboutMeDesc,
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
        <Footer />
      </main>
    </>
  );
}
