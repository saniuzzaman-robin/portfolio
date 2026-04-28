import type { Metadata } from 'next';
import { Navigation } from '@/components/sections/navigation';
import { SkillsShowcase } from '@/components/sections/skills-showcase';
import { Footer } from '@/components/sections/footer';
import { SchemaScript } from '@/components/reusable/schema-script';
import { AdUnit } from '@/components/reusable/ad-unit';
import { generateWebPageSchema } from '@/lib/schema';
import { AD_SLOTS } from '@/lib/ads-config';

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
    url: 'https://saniuzzaman.dev/skills',
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
          url: 'https://saniuzzaman.dev/skills',
        })}
      />
      <main className="bg-neutral-5 text-neutral-90">
        <Navigation />
        <SkillsShowcase />
        <div className="px-4 py-8 border-t border-white/5">
          <AdUnit slot={AD_SLOTS.SKILLS_BANNER} format="horizontal" className="max-w-4xl mx-auto" />
        </div>
        <Footer />
      </main>
    </>
  );
}
