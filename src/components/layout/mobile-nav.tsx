'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { m, type PanInfo } from 'framer-motion';
import { ChevronRight, Download, Monitor, Moon, Sun, X } from 'lucide-react';
import { useTheme } from '@/components/reusable/theme-provider';
import { SocialIcon, type SocialIconType } from '@/components/reusable/social-icon';
import { Badge, StatusDot } from '@/components/ui/badge';
import { buttonClass } from '@/components/ui/button';
import { CV_DATA } from '@/lib/cv-data';
import { NAV_LINKS, RESUME_PDF_PATH, isActivePath } from '@/lib/site';
import type { ThemePreference } from '@/lib/theme';
import { cn } from '@/lib/cn';

const EASE = [0.16, 1, 0.3, 1] as const;
/** Horizontal drag distance / velocity past which a swipe closes the drawer. */
const SWIPE_CLOSE_OFFSET = 80;
const SWIPE_CLOSE_VELOCITY = 500;

const THEME_OPTIONS: { value: ThemePreference; label: string; icon: typeof Sun }[] = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'System', icon: Monitor },
];

const SOCIAL_LINKS: { label: string; href: string; icon: SocialIconType; external: boolean }[] = [
  { label: 'GitHub', href: CV_DATA.github, icon: 'github', external: true },
  { label: 'LinkedIn', href: CV_DATA.linkedin, icon: 'linkedin', external: true },
  { label: 'Email', href: `mailto:${CV_DATA.email}`, icon: 'email', external: false },
];

const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

const item = (i: number) => ({
  initial: { opacity: 0, x: 24 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.45, delay: 0.08 + i * 0.05, ease: EASE },
});

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-3 px-1 font-mono text-[10px] font-medium tracking-[0.14em] text-fg-subtle uppercase">
      {children}
    </p>
  );
}

/** Slide-over navigation for < lg screens. Mount only while open (inside AnimatePresence). */
export function MobileNav({ pathname, onClose }: { pathname: string; onClose: () => void }) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const { preference, setPreference } = useTheme();

  // Scroll lock, Escape to close, focus trap, and focus restore on close.
  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
        return;
      }
      if (event.key !== 'Tab' || !panelRef.current) return;
      const focusable = [...panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)];
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
      previouslyFocused?.focus();
    };
  }, [onClose]);

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x > SWIPE_CLOSE_OFFSET || info.velocity.x > SWIPE_CLOSE_VELOCITY) onClose();
  };

  return (
    <>
      <m.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        onClick={onClose}
        className="fixed inset-0 z-50 bg-overlay backdrop-blur-sm lg:hidden"
        aria-hidden
      />

      <m.div
        ref={panelRef}
        id="mobile-nav"
        role="dialog"
        aria-modal="true"
        aria-label="Site navigation"
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 32, stiffness: 320 }}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={{ left: 0, right: 0.6 }}
        onDragEnd={handleDragEnd}
        className="fixed inset-y-0 right-0 z-50 flex w-[min(88vw,22rem)] flex-col overflow-hidden rounded-l-3xl border-l border-line-strong bg-elevated shadow-pop lg:hidden"
      >
        {/* Decorative header wash */}
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-56">
          <div className="bg-grid absolute inset-0 opacity-70" />
          <div className="absolute -top-24 -right-16 size-72 rounded-full bg-[radial-gradient(closest-side,var(--glow),transparent)]" />
        </div>

        {/* Swipe affordance */}
        <span
          aria-hidden
          className="absolute top-1/2 left-1.5 h-12 w-1 -translate-y-1/2 rounded-full bg-line-strong"
        />

        <div className="relative flex-1 overflow-y-auto overscroll-contain px-5 pt-5 pb-6">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="flex size-11 items-center justify-center rounded-2xl bg-linear-to-br from-primary to-primary-strong font-mono text-sm font-black text-primary-fg shadow-lg shadow-primary/30">
                SR
              </span>
              <div className="min-w-0">
                <p className="truncate font-heading text-sm font-bold text-fg">{CV_DATA.name}</p>
                <p className="truncate font-mono text-[11px] text-primary-text">{CV_DATA.role}</p>
              </div>
            </div>
            <button
              ref={closeRef}
              type="button"
              onClick={onClose}
              className="flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full border border-line bg-surface-2 text-fg-muted transition-colors hover:border-line-strong hover:text-fg"
              aria-label="Close navigation menu"
            >
              <X className="size-4" />
            </button>
          </div>

          <m.div {...item(0)} className="mt-4">
            <Badge tone="success" className="rounded-full px-2.5 py-0.5">
              <StatusDot />
              Available for senior roles
            </Badge>
          </m.div>

          <nav aria-label="Mobile" className="mt-6">
            <SectionLabel>Menu</SectionLabel>
            <ul className="space-y-2">
              {NAV_LINKS.map((link, i) => {
                const active = isActivePath(pathname, link.href);
                const Icon = link.icon;
                return (
                  <m.li key={link.href} {...item(i + 1)}>
                    <Link
                      href={link.href}
                      onClick={onClose}
                      aria-current={active ? 'page' : undefined}
                      className={cn(
                        'group flex items-center gap-3.5 rounded-2xl border p-2.5 transition-colors',
                        active
                          ? 'border-primary/30 bg-primary/10'
                          : 'border-line bg-surface/60 hover:border-line-strong hover:bg-surface-2'
                      )}
                    >
                      <span
                        className={cn(
                          'flex size-10 shrink-0 items-center justify-center rounded-xl transition-colors',
                          active
                            ? 'bg-primary text-primary-fg shadow-md shadow-primary/30'
                            : 'border border-line bg-surface-2 text-fg-muted group-hover:text-fg'
                        )}
                      >
                        <Icon className="size-[18px]" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-2">
                          <span
                            className={cn(
                              'text-[15px] font-semibold',
                              active ? 'text-primary-text' : 'text-fg'
                            )}
                          >
                            {link.label}
                          </span>
                          <span className="font-mono text-[10px] text-fg-subtle">0{i + 1}</span>
                        </span>
                        <span className="mt-0.5 block truncate text-xs text-fg-subtle">
                          {link.description}
                        </span>
                      </span>
                      <ChevronRight
                        className={cn(
                          'size-4 shrink-0 transition-transform group-hover:translate-x-0.5',
                          active ? 'text-primary-text' : 'text-fg-subtle'
                        )}
                      />
                    </Link>
                  </m.li>
                );
              })}
            </ul>
          </nav>

          <m.div {...item(NAV_LINKS.length + 1)} className="mt-6">
            <SectionLabel>Appearance</SectionLabel>
            <div
              role="group"
              aria-label="Theme"
              className="grid grid-cols-3 gap-1 rounded-2xl border border-line bg-surface-2 p-1"
            >
              {THEME_OPTIONS.map(({ value, label, icon: Icon }) => {
                const active = preference === value;
                return (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setPreference(value)}
                    className={cn(
                      'relative flex cursor-pointer flex-col items-center gap-1 rounded-xl py-2.5 text-[11px] font-semibold transition-colors',
                      active ? 'text-fg' : 'text-fg-subtle hover:text-fg'
                    )}
                  >
                    {active && (
                      <m.span
                        layoutId="mobile-theme-pill"
                        className="absolute inset-0 rounded-xl border border-line-strong bg-elevated shadow-sm"
                        transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                      />
                    )}
                    <Icon className={cn('relative size-4', active && 'text-primary-text')} />
                    <span className="relative">{label}</span>
                  </button>
                );
              })}
            </div>
          </m.div>

          <m.div {...item(NAV_LINKS.length + 2)} className="mt-6">
            <SectionLabel>Connect</SectionLabel>
            <ul className="grid grid-cols-3 gap-2">
              {SOCIAL_LINKS.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    {...(link.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                    className="flex items-center justify-center gap-2 rounded-2xl border border-line bg-surface/60 py-2.5 text-xs font-medium text-fg-muted transition-colors hover:border-primary/40 hover:text-fg"
                  >
                    <SocialIcon icon={link.icon} className="size-4" />
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </m.div>
        </div>

        <div className="relative border-t border-line bg-surface/80 px-5 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur">
          <a href={RESUME_PDF_PATH} download className={buttonClass({ className: 'w-full py-3' })}>
            <Download className="size-4" />
            Download resume
          </a>
        </div>
      </m.div>
    </>
  );
}
