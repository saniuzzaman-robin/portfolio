import type { Metadata } from 'next';
import { localeUrl, pageMetadata } from '@/lib/metadata';
import { toLocale } from '@/i18n/config';
import { getDictionary } from '@/i18n/server';
import { PageHeader } from '@/components/ui/section';
import { ProjectsExplorer } from '@/components/projects/projects-explorer';
import { ContactCta } from '@/components/home/contact-cta';
import { Footer } from '@/components/layout/footer';
import { SchemaScript } from '@/components/reusable/schema-script';
import { generateBreadcrumbSchema, generateCollectionSchema } from '@/lib/schema';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const lang = toLocale((await params).lang);
  const { t } = getDictionary(lang);
  return pageMetadata({
    lang,
    title: t.meta.projectsTitle,
    description: t.meta.projectsDescription,
    path: '/projects',
    keywords: ['portfolio projects', 'Next.js', 'NestJS', 'Angular', 'microservices', 'MuslimPro'],
  });
}

export default async function Projects({ params }: { params: Promise<{ lang: string }> }) {
  const lang = toLocale((await params).lang);
  const { t, projects } = getDictionary(lang);
  const url = localeUrl(lang, '/projects');
  return (
    <>
      <SchemaScript
        schema={generateBreadcrumbSchema([
          { name: t.meta.home, url: localeUrl(lang, '/') },
          { name: t.projects.label, url },
        ])}
      />
      <SchemaScript
        schema={generateCollectionSchema({
          name: t.projects.label,
          description: t.meta.projectsCollection,
          url,
          inLanguage: lang,
          items: projects.map((p) => ({
            name: p.title,
            description: p.description,
            url: p.link.startsWith('http') ? p.link : url,
          })),
        })}
      />
      <PageHeader
        label={t.projects.label}
        title={t.projects.title}
        accent={t.projects.accent}
        description={t.projects.description}
      />
      <ProjectsExplorer />
      <ContactCta />
      <Footer lang={lang} />
    </>
  );
}
