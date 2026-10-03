import type { Metadata } from 'next';
import { localeUrl } from '@/lib/metadata';
import { toLocale } from '@/i18n/config';
import { Container, PageHeader } from '@/components/ui/section';
import { Footer } from '@/components/layout/footer';
import { CV_DATA } from '@/lib/cv-data';
import { CHANGELOOM_PRIVACY, type PolicyBlock } from '@/lib/data/changeloom-privacy';

const PATH = '/changeloom/privacy';

// Linked only from the Play Store listing: not in the sitemap or navigation, and not indexed.
// The policy is English only, so every locale points its canonical URL at the English page.
export const metadata: Metadata = {
  title: { absolute: `${CHANGELOOM_PRIVACY.app} Privacy Policy` },
  description: `How the ${CHANGELOOM_PRIVACY.app} Android app collects, uses and shares information.`,
  robots: { index: false, follow: false },
  alternates: { canonical: localeUrl('en', PATH) },
};

const updated = new Date(`${CHANGELOOM_PRIVACY.updated}T00:00:00Z`).toLocaleDateString('en-US', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  timeZone: 'UTC',
});

function Block({ block }: { block: PolicyBlock }) {
  if (typeof block === 'string') return <p>{block}</p>;
  return (
    <ul className="list-disc space-y-2 ps-5 marker:text-fg-subtle">
      {block.map(({ label, text }) => (
        <li key={label}>
          <span className="font-semibold text-fg">{label}:</span> {text}
        </li>
      ))}
    </ul>
  );
}

export default async function ChangeloomPrivacy({ params }: { params: Promise<{ lang: string }> }) {
  const lang = toLocale((await params).lang);
  return (
    <>
      <div lang="en" dir="ltr">
        <PageHeader
          label={CHANGELOOM_PRIVACY.app}
          title="Privacy"
          accent="Policy"
          description={<>Last updated {updated}</>}
        />
        <Container className="pb-20">
          <article className="space-y-10 text-base leading-relaxed text-fg-muted">
            <div className="space-y-4">
              {CHANGELOOM_PRIVACY.intro.map((text) => (
                <p key={text}>{text}</p>
              ))}
            </div>
            {CHANGELOOM_PRIVACY.sections.map(({ id, heading, blocks }) => (
              <section key={id} id={id} aria-labelledby={`${id}-heading`} className="space-y-4">
                <h2 id={`${id}-heading`} className="text-xl font-bold tracking-tight text-fg">
                  {heading}
                </h2>
                {blocks.map((block, i) => (
                  <Block key={i} block={block} />
                ))}
              </section>
            ))}
            <section id="contact" aria-labelledby="contact-heading" className="space-y-4">
              <h2 id="contact-heading" className="text-xl font-bold tracking-tight text-fg">
                Contact
              </h2>
              <p>
                For questions about this policy or your data, contact {CV_DATA.name} at{' '}
                <a
                  href={`mailto:${CV_DATA.email}`}
                  className="font-medium text-primary-text underline underline-offset-4"
                >
                  {CV_DATA.email}
                </a>
                .
              </p>
            </section>
          </article>
        </Container>
      </div>
      <Footer lang={lang} />
    </>
  );
}
