import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/metadata';
import { SITE_URL } from '@/lib/site';
import { PageHeader } from '@/components/ui/section';
import { ProjectsExplorer } from '@/components/projects/projects-explorer';
import { ContactCta } from '@/components/home/contact-cta';
import { Footer } from '@/components/layout/footer';
import { SchemaScript } from '@/components/reusable/schema-script';
import { generateBreadcrumbSchema, generateCollectionSchema } from '@/lib/schema';
import { PROJECTS } from '@/lib/data/projects';

export const metadata: Metadata = pageMetadata({
  title: 'Platforms & Deliveries',
  description:
    'Production platforms built by Md. Saniuzzaman Robin: MuslimPro Prayer Times, the Giving donation platform, Qalbox streaming, enterprise admin consoles and test automation, built with Next.js, NestJS and Angular.',
  path: '/projects',
  keywords: ['portfolio projects', 'Next.js', 'NestJS', 'Angular', 'microservices', 'MuslimPro'],
});

export default function Projects() {
  return (
    <>
      <SchemaScript
        schema={generateBreadcrumbSchema([
          { name: 'Home', url: SITE_URL },
          { name: 'Platforms', url: `${SITE_URL}/projects` },
        ])}
      />
      <SchemaScript
        schema={generateCollectionSchema({
          name: 'Platforms',
          description: 'Engineering platforms and production applications',
          url: `${SITE_URL}/projects`,
          items: PROJECTS.map((p) => ({
            name: p.title,
            description: p.description,
            url: p.link.startsWith('http') ? p.link : `${SITE_URL}/projects`,
          })),
        })}
      />
      <PageHeader
        label="Platforms"
        title="Systems I've"
        accent="designed & shipped."
        description="Production platforms, internal tooling and test infrastructure across Bitsmedia (MuslimPro), KONA Software Lab and SELISE — filter by discipline below."
      />
      <ProjectsExplorer />
      <ContactCta />
      <Footer />
    </>
  );
}
