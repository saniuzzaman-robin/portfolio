import type { Metadata } from 'next';
import { Navigation } from '@/components/sections/navigation';
import { SkillsShowcase } from '@/components/sections/skills-showcase';
import { Footer } from '@/components/sections/footer';
import { SchemaScript } from '@/components/reusable/schema-script';
import { generateWebPageSchema } from '@/lib/schema';

export const metadata: Metadata = {
  title: 'Technical Skills | Md. Saniuzzaman Robin',
  description:
    'Comprehensive breakdown of my technical expertise: Next.js, Angular, NestJS, TypeScript, Tailwind CSS, MongoDB, Redis, and more. Proficiency levels and competencies.',
  keywords: [
    'skills',
    'technical skills',
    'next.js',
    'angular',
    'nestjs',
    'typescript',
    'tailwind',
    'backend',
    'frontend',
  ],
  alternates: {
    canonical: 'https://saniuzzaman.dev/skills',
  },
  openGraph: {
    type: 'website',
    url: 'https://saniuzzaman.dev/skills',
    title: 'Technical Skills | Saniuzzaman Robin',
    description: 'Frontend, backend, and tools expertise with proficiency levels.',
    siteName: 'Saniuzzaman Robin Portfolio',
    images: [
      {
        url: 'https://saniuzzaman.dev/og_image.png',
        width: 1200,
        height: 630,
        alt: 'Saniuzzaman Robin - Skills',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Technical Skills | Saniuzzaman Robin',
    description: 'Full-stack development expertise and technical proficiencies',
    creator: '@saniuzzaman_robin',
    images: ['https://saniuzzaman.dev/og_image.png'],
  },
};

export default function Skills() {
  return (
    <>
      <SchemaScript
        schema={generateWebPageSchema({
          title: 'Skills | Md. Saniuzzaman Robin',
          description: 'Technical skills in frontend, backend, and testing technologies',
          url: 'https://saniuzzaman.dev/skills',
        })}
      />
      <main className="bg-neutral-5 text-neutral-90">
        <Navigation />
        <SkillsShowcase />
        <Footer />
      </main>
    </>
  );
}
