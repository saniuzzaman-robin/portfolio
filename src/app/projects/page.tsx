import type { Metadata } from 'next';
import { Navigation } from '@/components/sections/navigation';
import { ProjectsGrid } from '@/components/sections/projects-grid';
import { Footer } from '@/components/sections/footer';
import { SchemaScript } from '@/components/reusable/schema-script';
import { generateCollectionSchema } from '@/lib/schema';

export const metadata: Metadata = {
  title: 'Projects | Md. Saniuzzaman Robin',
  description:
    'Explore my portfolio of web development projects built with Next.js, Angular, and NestJS. Featuring MuslimPro, scalable APIs, and responsive applications.',
  keywords: [
    'projects',
    'portfolio',
    'web development',
    'next.js',
    'angular',
    'nestjs',
    'full-stack',
  ],
  openGraph: {
    url: 'https://saniuzzaman.dev/projects',
    title: 'Projects | Saniuzzaman Robin',
    description: 'Showcase of production-grade web applications and full-stack projects.',
  },
};

export default function Projects() {
  const projectItems = [
    {
      name: 'MuslimPro Web Platform',
      description: 'Full-stack prayer times platform with 180M+ downloads',
      url: 'https://app.muslimpro.com',
    },
    {
      name: 'KONA Admin Panel',
      description: 'Enterprise-grade admin panel with Angular',
      url: '#',
    },
    {
      name: 'Automated Testing Suite',
      description: 'Selenium and JMeter-based testing automation',
      url: '#',
    },
  ];

  return (
    <>
      <SchemaScript
        schema={generateCollectionSchema({
          name: 'Projects',
          description: 'Collection of projects showcasing my expertise',
          url: 'https://saniuzzaman.dev/projects',
          items: projectItems,
        })}
      />
      <main className="bg-neutral-5 text-neutral-90">
        <Navigation />
        <ProjectsGrid />
        <Footer />
      </main>
    </>
  );
}
