import type { Metadata } from 'next';
import { localeUrl } from '@/lib/metadata';
import { toLocale } from '@/i18n/config';
import { Container, PageHeader } from '@/components/ui/section';
import { buttonClass } from '@/components/ui/button';
import { LocaleLink } from '@/components/ui/locale-link';
import { Footer } from '@/components/layout/footer';
import { CHANGELOOM } from '@/lib/data/changeloom';

const PATH = '/changeloom';

// English only, so every locale points its canonical URL at the English page. Not in the sitemap or navigation.
export const metadata: Metadata = {
  title: { absolute: `${CHANGELOOM.app}: ${CHANGELOOM.tagline}` },
  description: CHANGELOOM.description,
  alternates: { canonical: localeUrl('en', PATH) },
};

export default async function ChangeloomHome({ params }: { params: Promise<{ lang: string }> }) {
  const lang = toLocale((await params).lang);
  return (
    <>
      <div lang="en" dir="ltr">
        <PageHeader
          label="Android app"
          title={CHANGELOOM.app}
          description={
            <>
              {CHANGELOOM.tagline} {CHANGELOOM.description}
            </>
          }
        >
          <div className="flex flex-wrap gap-3">
            <LocaleLink
              href="/changeloom/privacy"
              className={buttonClass({ variant: 'secondary' })}
            >
              Privacy Policy
            </LocaleLink>
            <LocaleLink href="/changeloom/terms" className={buttonClass({ variant: 'secondary' })}>
              Terms of Service
            </LocaleLink>
          </div>
        </PageHeader>
        <Container className="pb-20">
          <h2 className="sr-only">Features</h2>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {CHANGELOOM.features.map(({ title, text }) => (
              <li key={title} className="rounded-xl border border-line bg-surface p-5">
                <h3 className="text-base font-bold tracking-tight text-fg">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-fg-muted">{text}</p>
              </li>
            ))}
          </ul>
        </Container>
      </div>
      <Footer lang={lang} />
    </>
  );
}
