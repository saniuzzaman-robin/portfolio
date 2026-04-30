import type { Metadata } from 'next';
import { Navigation } from '@/components/sections/navigation';
import { ResumeContent } from '@/components/sections/resume-content';
import { Footer } from '@/components/sections/footer';
import { SchemaScript } from '@/components/reusable/schema-script';
import { AdUnit } from '@/components/reusable/ad-unit';
import { generatePersonSchema, generateWebPageSchema } from '@/lib/schema';
import { AD_SLOTS } from '@/lib/ads-config';

export const metadata: Metadata = {
  title: 'Resume | Md. Saniuzzaman Robin',
  description:
    'Professional resume and CV of Md. Saniuzzaman Robin. 5+ years software engineering experience at Bitsmedia, KONA Software Lab, and SELISE Digital Platforms.',
  keywords: [
    'resume',
    'cv',
    'software engineer',
    'experience',
    'education',
    'skills',
    'employment',
  ],
  alternates: {
    canonical: 'https://saniuzzaman.dev/resume',
  },
  openGraph: {
    type: 'profile',
    url: 'https://saniuzzaman.dev/resume',
    title: 'Resume | Saniuzzaman Robin',
    description: 'Complete professional resume with experience, education, and technical skills.',
    siteName: 'Saniuzzaman Robin Portfolio',
    images: [
      {
        url: 'https://saniuzzaman.dev/logo.png',
        width: 1200,
        height: 630,
        alt: 'Saniuzzaman Robin - Resume',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Resume | Saniuzzaman Robin',
    description: 'Professional CV and work experience',
    creator: '@saniuzzaman_robin',
    images: ['https://saniuzzaman.dev/logo.png'],
  },
};

export default function Resume() {
  return (
    <>
      <SchemaScript schema={generatePersonSchema()} />
      <SchemaScript
        schema={generateWebPageSchema({
          title: 'Resume | Md. Saniuzzaman Robin',
          description: 'Complete resume with experience, skills, and education',
          url: 'https://saniuzzaman.dev/resume',
        })}
      />
      <main className="bg-neutral-5 text-neutral-90">
        <Navigation />
        <ResumeContent />
        <div className="px-4 py-8 border-t border-white/5">
          <AdUnit slot={AD_SLOTS.RESUME_BANNER} format="horizontal" className="max-w-4xl mx-auto" />
        </div>
        <Footer />
      </main>
    </>
  );
}
