import type { Metadata } from 'next';
import { localeUrl, pageMetadata } from '@/lib/metadata';
import { toLocale } from '@/i18n/config';
import { fmt } from '@/i18n/dictionary';
import { getDictionary } from '@/i18n/server';
import { Hero } from '@/components/home/hero';
import { TechMarquee } from '@/components/home/tech-marquee';
import { SelectedWork } from '@/components/home/selected-work';
import { ExperienceTimeline } from '@/components/home/experience-timeline';
import { Capabilities } from '@/components/home/capabilities';
import { ContactCta } from '@/components/home/contact-cta';
import { Footer } from '@/components/layout/footer';
import { SchemaScript } from '@/components/reusable/schema-script';
import { generatePersonSchema, generateWebPageSchema } from '@/lib/schema';
import { CV_DATA } from '@/lib/cv-data';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const lang = toLocale((await params).lang);
  const { cv } = getDictionary(lang);
  return pageMetadata({
    lang,
    description: cv.shortBio,
    path: '/',
    keywords: [
      'Md. Saniuzzaman Robin',
      'Saniuzzaman Robin',
      'software engineer',
      'full-stack engineer',
      'Next.js developer',
      'NestJS developer',
      'Angular developer',
      'Dhaka',
      'Bangladesh',
    ],
  });
}

export default async function Home({ params }: { params: Promise<{ lang: string }> }) {
  const lang = toLocale((await params).lang);
  const { t, cv } = getDictionary(lang);
  return (
    <>
      <SchemaScript schema={generatePersonSchema()} />
      <SchemaScript
        schema={generateWebPageSchema({
          title: `${t.meta.home} | ${CV_DATA.name}`,
          description: fmt(t.meta.homeDescription, { title: cv.title }),
          url: localeUrl(lang, '/'),
          inLanguage: lang,
        })}
      />
      <Hero />
      <TechMarquee lang={lang} />
      <SelectedWork lang={lang} />
      <ExperienceTimeline />
      <Capabilities lang={lang} />
      <ContactCta index="04" />
      <Footer lang={lang} />
    </>
  );
}
