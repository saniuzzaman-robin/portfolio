import { ArrowUpRight } from 'lucide-react';
import { Container } from '@/components/ui/section';
import { buttonClass } from '@/components/ui/button';
import { LocaleLink } from '@/components/ui/locale-link';
import { CHANGELOOM } from '@/lib/data/changeloom';

/** Promo card for the Changeloom Android app. English only, like the app's own pages. */
export function AndroidApp() {
  return (
    <section aria-labelledby="android-app-heading" className="py-6 sm:py-8 print:hidden">
      <Container>
        <div
          lang="en"
          dir="ltr"
          className="flex flex-col gap-6 rounded-2xl border border-line bg-surface p-6 shadow-card sm:flex-row sm:items-center sm:justify-between sm:p-8"
        >
          <div className="flex items-start gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element -- small static SVG, nothing to optimize */}
            <img
              src="/changeloom-icon.svg"
              alt=""
              width={48}
              height={48}
              className="size-12 shrink-0 rounded-xl"
            />
            <div className="space-y-1">
              <p className="font-mono text-[11px] font-medium tracking-wider text-fg-subtle uppercase">
                Android app
              </p>
              <h2 id="android-app-heading" className="text-xl font-bold tracking-tight text-fg">
                {CHANGELOOM.app}
              </h2>
              <p className="max-w-xl text-sm leading-relaxed text-fg-muted">{CHANGELOOM.tagline}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <a
              href={CHANGELOOM.playStoreUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonClass({ variant: 'primary' })}
            >
              Get it on Google Play
              <ArrowUpRight className="size-4" aria-hidden />
            </a>
            <LocaleLink href="/changeloom" className={buttonClass({ variant: 'secondary' })}>
              Learn more
            </LocaleLink>
          </div>
        </div>
      </Container>
    </section>
  );
}
