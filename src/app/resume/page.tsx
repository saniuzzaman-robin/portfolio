import type { Metadata } from 'next';
import { Navbar } from '@/components/craft/navbar';
import { ResumeSheet } from '@/components/craft/resume-sheet';
import { ContactCard } from '@/components/craft/contact-card';
import { FooterColophon } from '@/components/craft/footer-colophon';
import { SchemaScript } from '@/components/reusable/schema-script';
import { generatePersonSchema, generateWebPageSchema } from '@/lib/schema';
import { CV_DATA } from '@/lib/cv-data';

export const metadata: Metadata = {
  title: `Experience & Resume | ${CV_DATA.name}`,
  description:
    'Professional resume of Md. Saniuzzaman Robin. 5+ years of software engineering experience across Bitsmedia (MuslimPro), KONA Software Lab, and SELISE Digital Platforms.',
  keywords: [
    'resume',
    'cv',
    'software engineer',
    'experience',
    'education',
    'skills',
    'Bitsmedia',
    'KONA Software Lab',
    'SELISE',
    'MuslimPro',
  ],
  alternates: {
    canonical: 'https://saniuzzaman.dev/resume',
  },
  openGraph: {
    type: 'profile',
    url: 'https://saniuzzaman.dev/resume',
    title: `Experience & Resume | ${CV_DATA.name}`,
    description: 'Complete professional resume with work experience, technical skills, and achievements.',
    siteName: 'Saniuzzaman Robin Portfolio',
    images: [
      {
        url: 'https://saniuzzaman.dev/og_image.png',
        width: 1200,
        height: 630,
        alt: 'Saniuzzaman Robin - Resume',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `Experience & Resume | ${CV_DATA.name}`,
    description: 'Professional CV and career experience',
    creator: '@saniuzzaman_robin',
    images: ['https://saniuzzaman.dev/og_image.png'],
  },
};

export default function Resume() {
  return (
    <>
      <SchemaScript schema={generatePersonSchema()} />
      <SchemaScript
        schema={generateWebPageSchema({
          title: `Resume | ${CV_DATA.name}`,
          description: 'Complete resume with work experience, technical skills, and education',
          url: 'https://saniuzzaman.dev/resume',
        })}
      />
      <div className="min-h-dvh flex flex-col">
        <Navbar />
        <ResumeSheet />
        <ContactCard />
        <FooterColophon />
      </div>
    </>
  );
}
