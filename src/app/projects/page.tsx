import type { Metadata } from 'next';
import { Navigation } from '@/components/sections/navigation';
import { ProjectsGrid } from '@/components/sections/projects-grid';
import { Footer } from '@/components/sections/footer';
import { SchemaScript } from '@/components/reusable/schema-script';
import { generateCollectionSchema } from '@/lib/schema';

export const metadata: Metadata = {
  title: 'Projects | Md. Saniuzzaman Robin',
  description:
    'Portfolio of production projects: Prayer Times migration, Giving donation platform (30% YoY growth), Qalbox video streaming, Islamic Calendar, MuslimPro Admin Console, KONA multi-tenant e-commerce panel, and IPEX AG enterprise platform. Built with Next.js, NestJS, Angular, and more.',
  keywords: [
    'projects',
    'portfolio',
    'muslimpro',
    'prayer times',
    'giving platform',
    'qalbox',
    'next.js',
    'nestjs',
    'angular',
    'full-stack',
  ],
  alternates: {
    canonical: 'https://saniuzzaman.dev/projects',
  },
  openGraph: {
    type: 'website',
    url: 'https://saniuzzaman.dev/projects',
    title: 'Projects | Saniuzzaman Robin',
    description: 'Showcase of production-grade web applications and full-stack projects.',
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
    title: 'Projects | Saniuzzaman Robin',
    description: 'Full-stack projects built with modern technologies',
    creator: '@saniuzzaman_robin',
    images: ['https://saniuzzaman.dev/og_image.png'],
  },
};

export default function Projects() {
  const projectItems = [
    {
      name: 'Prayer Times Web',
      description: 'NestJS microservice migration with MaxMind GeoIP and Google Maps integration',
      url: 'https://app.muslimpro.com/prayer-times',
    },
    {
      name: 'Giving — Donation Platform',
      description: 'Next.js/WooCommerce replatform that drove a 30% YoY donation increase',
      url: 'https://app.muslimpro.com/giving',
    },
    {
      name: 'Qalbox Video Platform',
      description: 'Shorts, live streaming, and search on the MuslimPro video streaming platform',
      url: 'https://app.muslimpro.com/qalbox',
    },
    {
      name: 'Islamic Calendar',
      description: 'Full backend APIs and frontend integration for Hijri dates and Islamic events',
      url: 'https://app.muslimpro.com/islamic-calendar',
    },
    {
      name: 'MuslimPro Admin Console',
      description: 'Enterprise Admin Console built from scratch in Next.js',
      url: '#',
    },
    {
      name: 'KONA Multi-Tenant Admin Panel',
      description: 'Angular multi-tenant e-commerce admin with RBAC and CQRS/SAGA backend',
      url: '#',
    },
    {
      name: 'IPEX AG — SELISE Platform',
      description:
        "Primary frontend engineer for Switzerland's leading building damage management platform",
      url: 'https://www.ipex.ch/en',
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
