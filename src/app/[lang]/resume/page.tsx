import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/metadata';
import { SITE_URL } from '@/lib/site';
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

export const metadata: Metadata = pageMetadata({
  title: 'Experience & Resume',
  description:
    'Resume of Md. Saniuzzaman Robin: 5+ years of software engineering across Bitsmedia (MuslimPro), KONA Software Lab and SELISE Digital Platforms. Skills, experience, education and achievements.',
  path: '/resume',
  type: 'profile',
  keywords: ['resume', 'CV', 'software engineer', 'Bitsmedia', 'KONA Software Lab', 'SELISE'],
});

export default function Resume() {
  return (
    <>
      <SchemaScript
        schema={generateBreadcrumbSchema([
          { name: 'Home', url: SITE_URL },
          { name: 'Resume', url: `${SITE_URL}/resume` },
        ])}
      />
      <SchemaScript schema={generatePersonSchema()} />
      <SchemaScript
        schema={generateWebPageSchema({
          title: `Resume | ${CV_DATA.name}`,
          description: 'Complete resume with work experience, technical skills, and education',
          url: `${SITE_URL}/resume`,
        })}
      />
      <ResumeDocument />
      <ContactCta />
      <Footer />
    </>
  );
}
