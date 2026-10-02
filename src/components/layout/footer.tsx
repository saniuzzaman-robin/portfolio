import { LocaleLink } from '@/components/ui/locale-link';
import { BackToTop } from '@/components/layout/back-to-top';
import { Mail } from 'lucide-react';
import { Container } from '@/components/ui/section';
import { Stagger, StaggerItem } from '@/components/ui/motion';
import { SocialIcon } from '@/components/reusable/social-icon';
import { CV_DATA } from '@/lib/cv-data';
import { NAV_LINKS, RESUME_PDF_PATH } from '@/lib/site';
import { cn } from '@/lib/cn';
import type { Locale } from '@/i18n/config';
import { getDictionary } from '@/i18n/server';
import { fmt } from '@/i18n/dictionary';

// Underline grows from the inline start on hover.
const linkClass =
  'inline-block bg-[linear-gradient(currentColor,currentColor)] bg-[length:0%_1px] bg-left-bottom bg-no-repeat rtl:bg-right-bottom py-1 text-sm text-fg-muted transition-[background-size,color] duration-300 ease-out-expo hover:bg-[length:100%_1px] hover:text-fg focus-visible:text-fg';

export function Footer({ lang }: { lang: Locale }) {
  const { t, cv } = getDictionary(lang);
  const connectLinks = [
    { label: 'GitHub', href: CV_DATA.github, icon: 'github' as const, external: true },
    { label: 'LinkedIn', href: CV_DATA.linkedin, icon: 'linkedin' as const, external: true },
    {
      label: t.common.email,
      href: `mailto:${CV_DATA.email}`,
      icon: 'email' as const,
      external: false,
    },
  ];
  return (
    <footer className="border-t border-line print:hidden">
      <Stagger
        stagger={0.1}
        className="mx-auto grid w-full max-w-6xl grid-cols-2 gap-x-6 gap-y-10 px-5 py-14 sm:px-8 sm:py-16 md:grid-cols-12 md:gap-12"
      >
        <StaggerItem className="col-span-2 space-y-4 md:col-span-6">
          <LocaleLink href="/" className="inline-flex items-center gap-2.5">
            <span className="flex size-8 items-center justify-center rounded-xl bg-linear-to-br from-primary to-primary-strong font-mono text-xs font-black text-primary-fg">
              SR
            </span>
            <span className="font-heading text-sm font-bold text-fg">{CV_DATA.name}</span>
          </LocaleLink>
          <p className="max-w-sm text-sm leading-relaxed text-fg-muted">{cv.shortBio}</p>
          <a
            href={`mailto:${CV_DATA.email}`}
            className="inline-flex items-center gap-2 py-2 font-mono text-xs text-fg-subtle transition-colors hover:text-primary-text"
          >
            <Mail className="size-3.5" />
            {CV_DATA.email}
          </a>
        </StaggerItem>

        <StaggerItem className="space-y-3 md:col-span-3">
          <nav aria-label={t.footer.nav} className="space-y-3">
            <p className="font-mono text-[11px] font-medium tracking-wider text-fg-subtle uppercase">
              {t.footer.navigate}
            </p>
            <ul className="space-y-1">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <LocaleLink href={link.href} className={linkClass}>
                    {t.nav[link.id].label}
                  </LocaleLink>
                </li>
              ))}
              <li>
                <a href={RESUME_PDF_PATH} download className={linkClass}>
                  {t.common.resumePdf}
                </a>
              </li>
            </ul>
          </nav>
        </StaggerItem>

        <StaggerItem className="space-y-3 md:col-span-3">
          <p className="font-mono text-[11px] font-medium tracking-wider text-fg-subtle uppercase">
            {t.footer.connect}
          </p>
          <ul className="space-y-1">
            {connectLinks.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  {...(link.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                  className={cn(linkClass, 'inline-flex! items-center gap-2')}
                >
                  <SocialIcon icon={link.icon} className="size-3.5" />
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </StaggerItem>
      </Stagger>

      <div className="border-t border-line">
        <Container className="flex items-start justify-center gap-3 py-6 font-mono text-[11px] text-fg-subtle sm:items-center sm:justify-between">
          <p className="py-2">
            {fmt(t.footer.copyright, { year: new Date().getFullYear(), name: CV_DATA.name })}
          </p>
          <BackToTop label={t.footer.backToTop} />
        </Container>
      </div>
    </footer>
  );
}
