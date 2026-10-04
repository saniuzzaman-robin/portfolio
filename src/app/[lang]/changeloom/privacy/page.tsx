import type { Metadata } from 'next';
import { localeUrl } from '@/lib/metadata';
import { toLocale } from '@/i18n/config';
import { Footer } from '@/components/layout/footer';
import { PolicyDocument } from '@/components/changeloom/policy-document';
import { CHANGELOOM_PRIVACY } from '@/lib/data/changeloom-privacy';

const PATH = '/changeloom/privacy';

// Linked only from the Play Store listing: not in the sitemap or navigation, and not indexed.
// The policy is English only, so every locale points its canonical URL at the English page.
export const metadata: Metadata = {
  title: { absolute: `${CHANGELOOM_PRIVACY.app} Privacy Policy` },
  description: `How the ${CHANGELOOM_PRIVACY.app} Android app collects, uses and shares information.`,
  robots: { index: false, follow: false },
  alternates: { canonical: localeUrl('en', PATH) },
};

export default async function ChangeloomPrivacy({ params }: { params: Promise<{ lang: string }> }) {
  const lang = toLocale((await params).lang);
  return (
    <>
      <PolicyDocument
        app={CHANGELOOM_PRIVACY.app}
        title="Privacy"
        accent="Policy"
        updated={CHANGELOOM_PRIVACY.updated}
        intro={CHANGELOOM_PRIVACY.intro}
        sections={CHANGELOOM_PRIVACY.sections}
        contactText="For questions about this policy or your data, contact"
      />
      <Footer lang={lang} />
    </>
  );
}
