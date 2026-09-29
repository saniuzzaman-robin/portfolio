import Link from 'next/link';
import { ArrowUp, Mail } from 'lucide-react';
import { Container } from '@/components/ui/section';
import { Stagger, StaggerItem } from '@/components/ui/motion';
import { SocialIcon } from '@/components/reusable/social-icon';
import { CV_DATA } from '@/lib/cv-data';
import { NAV_LINKS, RESUME_PDF_PATH } from '@/lib/site';
import { cn } from '@/lib/cn';

const CONNECT_LINKS = [
  { label: 'GitHub', href: CV_DATA.github, icon: 'github' as const, external: true },
  { label: 'LinkedIn', href: CV_DATA.linkedin, icon: 'linkedin' as const, external: true },
  { label: 'Email', href: `mailto:${CV_DATA.email}`, icon: 'email' as const, external: false },
];

// Underline grows from the left on hover.
const linkClass =
  'inline-block bg-[linear-gradient(currentColor,currentColor)] bg-[length:0%_1px] bg-left-bottom bg-no-repeat py-1 text-sm text-fg-muted transition-[background-size,color] duration-300 ease-out-expo hover:bg-[length:100%_1px] hover:text-fg focus-visible:text-fg';

export function Footer() {
  return (
    <footer className="border-t border-line print:hidden">
      <Stagger
        stagger={0.1}
        className="mx-auto grid w-full max-w-6xl grid-cols-2 gap-x-6 gap-y-10 px-5 py-14 sm:px-8 sm:py-16 md:grid-cols-12 md:gap-12"
      >
        <StaggerItem className="col-span-2 space-y-4 md:col-span-6">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <span className="flex size-8 items-center justify-center rounded-xl bg-linear-to-br from-primary to-primary-strong font-mono text-xs font-black text-primary-fg">
              SR
            </span>
            <span className="font-heading text-sm font-bold text-fg">{CV_DATA.name}</span>
          </Link>
          <p className="max-w-sm text-sm leading-relaxed text-fg-muted">{CV_DATA.shortBio}</p>
          <a
            href={`mailto:${CV_DATA.email}`}
            className="inline-flex items-center gap-2 py-2 font-mono text-xs text-fg-subtle transition-colors hover:text-primary-text"
          >
            <Mail className="size-3.5" />
            {CV_DATA.email}
          </a>
        </StaggerItem>

        <StaggerItem className="space-y-3 md:col-span-3">
          <nav aria-label="Footer" className="space-y-3">
            <p className="font-mono text-[11px] font-medium tracking-wider text-fg-subtle uppercase">
              Navigate
            </p>
            <ul className="space-y-1">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className={linkClass}>
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <a href={RESUME_PDF_PATH} download className={linkClass}>
                  Resume PDF
                </a>
              </li>
            </ul>
          </nav>
        </StaggerItem>

        <StaggerItem className="space-y-3 md:col-span-3">
          <p className="font-mono text-[11px] font-medium tracking-wider text-fg-subtle uppercase">
            Connect
          </p>
          <ul className="space-y-1">
            {CONNECT_LINKS.map((link) => (
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
        <Container className="flex flex-col items-start justify-between gap-3 py-6 font-mono text-[11px] text-fg-subtle sm:flex-row sm:items-center">
          <p>
            © {new Date().getFullYear()} {CV_DATA.name}. Built with Next.js &amp; Tailwind CSS.
          </p>
          <a
            href="#main-content"
            className="group inline-flex items-center gap-1.5 py-2 transition-colors hover:text-fg"
          >
            Back to top
            <ArrowUp className="size-3 transition-transform duration-300 group-hover:-translate-y-0.5" />
          </a>
        </Container>
      </div>
    </footer>
  );
}
