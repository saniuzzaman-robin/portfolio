import type { Metadata } from 'next';
import { Navbar } from '@/components/craft/navbar';
import { PlatformsGallery } from '@/components/craft/platforms-gallery';
import { ContactCard } from '@/components/craft/contact-card';
import { FooterColophon } from '@/components/craft/footer-colophon';
import { SchemaScript } from '@/components/reusable/schema-script';
import { generateCollectionSchema } from '@/lib/schema';
import { PROJECTS } from '@/lib/data/projects';
import { CV_DATA } from '@/lib/cv-data';

export const metadata: Metadata = {
  title: `Platforms & Deliveries | ${CV_DATA.name}`,
  description:
    'Featured projects and engineering platforms built with Next.js, NestJS, Angular, TypeScript, Redis, and MongoDB by Md. Saniuzzaman Robin.',
  keywords: [
    'projects',
    'portfolio',
    'Next.js',
    'NestJS',
    'Angular',
    'microservices',
    'Prayer Times',
    'Giving platform',
    'Qalbox',
    'Admin Console',
  ],
  alternates: {
    canonical: 'https://saniuzzaman.dev/projects',
  },
  openGraph: {
    type: 'website',
    url: 'https://saniuzzaman.dev/projects',
    title: `Platforms & Deliveries | ${CV_DATA.name}`,
    description: 'Engineering deliveries across scalable web applications and microservices.',
    siteName: 'Saniuzzaman Robin Portfolio',
    images: [
      {
        url: 'https://saniuzzaman.dev/og_image.png',
        width: 1200,
        height: 630,
        alt: 'Saniuzzaman Robin - Projects',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `Platforms & Deliveries | ${CV_DATA.name}`,
    description: 'Scalable engineering platforms and microservices',
    creator: '@saniuzzaman_robin',
    images: ['https://saniuzzaman.dev/og_image.png'],
  },
};

export default function Projects() {
  return (
    <>
      <SchemaScript
        schema={generateCollectionSchema({
          name: 'Platforms',
          description: 'Engineering platforms and production applications',
          url: 'https://saniuzzaman.dev/projects',
          items: PROJECTS.map((p) => ({
            name: p.title,
            description: p.description,
            url: p.link.startsWith('http') ? p.link : 'https://saniuzzaman.dev/projects',
          })),
        })}
      />
      <div className="min-h-dvh flex flex-col">
        <Navbar />
        <PlatformsGallery />
        <ContactCard />
        <FooterColophon />
      </div>
    </>
  );
}
