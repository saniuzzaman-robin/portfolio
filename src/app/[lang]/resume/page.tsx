import type { Metadata } from 'next';
import { localeUrl, pageMetadata } from '@/lib/metadata';
import { toLocale } from '@/i18n/config';
import { getDictionary } from '@/i18n/server';
import { ResumeDocument } from '@/components/resume/resume-document';
import { ContactCta } from '@/components/home/contact-cta';
import { Footer } from '@/components/layout/footer';
import { SchemaScript } from '@/components/reusable/schema-script';
import {
  generateBreadcrumbSchema,
  generatePersonSchema,
  generateWebPageSchema,
} from '@/lib/schema';
import { CV_DATA } from '@/lib/cv-data';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const lang = toLocale((await params).lang);
  const { t } = getDictionary(lang);
  return pageMetadata({
    lang,
    title: t.meta.resumeTitle,
    description: t.meta.resumeDescription,
    path: '/resume',
    type: 'profile',
    keywords: ['resume', 'CV', 'software engineer', 'Bitsmedia', 'KONA Software Lab', 'SELISE'],
  });
}

export default async function Resume({ params }: { params: Promise<{ lang: string }> }) {
  const lang = toLocale((await params).lang);
  const { t } = getDictionary(lang);
  const url = localeUrl(lang, '/resume');
  return (
    <>
      <SchemaScript
        schema={generateBreadcrumbSchema([
          { name: t.meta.home, url: localeUrl(lang, '/') },
          { name: t.meta.resumePage, url },
        ])}
      />
      <SchemaScript schema={generatePersonSchema()} />
      <SchemaScript
        schema={generateWebPageSchema({
          title: `${t.meta.resumePage} | ${CV_DATA.name}`,
          description: t.meta.resumePageDescription,
          url,
          inLanguage: lang,
        })}
      />
      <ResumeDocument lang={lang} />
      <ContactCta />
      <Footer lang={lang} />
    </>
  );
}
