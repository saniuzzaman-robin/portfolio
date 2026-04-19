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
  openGraph: {
    url: 'https://saniuzzaman.com/skills',
    title: 'Technical Skills | Saniuzzaman Robin',
    description: 'Frontend, backend, and tools expertise with proficiency levels.',
  },
};

export default function Skills() {
  return (
    <>
      <SchemaScript
        schema={generateWebPageSchema({
          title: 'Skills | Md. Saniuzzaman Robin',
          description: 'Technical skills in frontend, backend, and testing technologies',
          url: 'https://saniuzzaman.com/skills',
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
