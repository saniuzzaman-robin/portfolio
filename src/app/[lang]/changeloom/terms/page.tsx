import type { Metadata } from 'next';
import { localeUrl } from '@/lib/metadata';
import { toLocale } from '@/i18n/config';
import { Footer } from '@/components/layout/footer';
import { PolicyDocument } from '@/components/changeloom/policy-document';
import { CHANGELOOM_TERMS } from '@/lib/data/changeloom-terms';

const PATH = '/changeloom/terms';

// Linked only from the Play Store listing and the Changeloom pages: not in the sitemap or navigation,
// and not indexed. The terms are English only, so every locale points its canonical URL at the English page.
export const metadata: Metadata = {
  title: { absolute: `${CHANGELOOM_TERMS.app} Terms of Service` },
  description: `The terms for using the ${CHANGELOOM_TERMS.app} Android app.`,
  robots: { index: false, follow: false },
  alternates: { canonical: localeUrl('en', PATH) },
};

export default async function ChangeloomTerms({ params }: { params: Promise<{ lang: string }> }) {
  const lang = toLocale((await params).lang);
  return (
    <>
      <PolicyDocument
        app={CHANGELOOM_TERMS.app}
        title="Terms of"
        accent="Service"
        updated={CHANGELOOM_TERMS.updated}
        intro={CHANGELOOM_TERMS.intro}
        sections={CHANGELOOM_TERMS.sections}
        contactText="For questions about these terms, contact"
      />
      <Footer lang={lang} />
    </>
  );
}
