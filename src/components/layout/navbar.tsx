'use client';

import { useCallback, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { m, AnimatePresence, useScroll, useSpring } from 'framer-motion';
import { Sun, Moon, Download, Menu, X, Command } from 'lucide-react';
import { useTheme } from '@/components/reusable/theme-provider';
import dynamic from 'next/dynamic';

// The drawer (drag, springs, extra icons) is fetched on first intent, not on page load.
const loadMobileNav = () => import('@/components/layout/mobile-nav');
const MobileNav = dynamic(() => loadMobileNav().then((mod) => mod.MobileNav), { ssr: false });
import { CV_DATA } from '@/lib/cv-data';
import { NAV_LINKS, RESUME_PDF_PATH, isActivePath } from '@/lib/site';
import { cn } from '@/lib/cn';
import { Enter } from '@/components/ui/motion';

function Monogram({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'flex items-center justify-center rounded-xl bg-linear-to-br from-primary to-primary-strong font-mono text-xs font-black text-primary-fg shadow-md shadow-primary/30',
        className
      )}
    >
      SR
    </span>
  );
}

export function Navbar({ onOpenCommand }: { onOpenCommand?: () => void }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const { toggleTheme, isDark } = useTheme();
  const closeMenu = useCallback(() => setIsMenuOpen(false), []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 200, damping: 30, mass: 0.3 });

  return (
    <>
      {/* Reading progress */}
      <m.div
        aria-hidden
        style={{ scaleX: progress }}
        className="fixed inset-x-0 top-0 z-[60] h-0.5 origin-left bg-linear-to-r from-primary via-accent to-primary print:hidden"
      />

      <Enter
        as="header"
        direction="down"
        className="pointer-events-none fixed inset-x-0 top-0 z-50 flex justify-center px-3 py-3 sm:px-4 sm:py-4 print:hidden"
      >
        <nav
          aria-label="Primary"
          className={cn(
            'pointer-events-auto flex w-full items-center justify-between gap-2.5 rounded-full border px-3.5 py-2 transition-all duration-300 sm:gap-4 sm:px-5 sm:py-2.5',
            scrolled
              ? 'glass-nav max-w-5xl shadow-lg'
              : 'max-w-6xl border-transparent bg-transparent'
          )}
        >
          <Link href="/" className="group flex items-center gap-2.5">
            <Monogram className="size-8 transition-transform group-hover:scale-105" />
            <span className="flex flex-col">
              <span className="font-heading text-xs font-bold tracking-tight text-fg">
                {CV_DATA.name}
              </span>
              <span className="font-mono text-[10px] font-medium text-primary-text">
                {CV_DATA.title} • {CV_DATA.yearsOfExperience} Yrs
              </span>
            </span>
          </Link>

          <div className="hidden items-center gap-1 rounded-full border border-line bg-surface-2 p-1 lg:flex">
            {NAV_LINKS.map((link) => {
              const active = isActivePath(pathname, link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'relative rounded-full px-3.5 py-1 text-xs font-semibold transition-colors duration-200',
                    active ? 'text-primary-fg' : 'text-fg-muted hover:text-fg'
                  )}
                >
                  {active && (
                    <m.span
                      layoutId="nav-active-pill"
                      className="absolute inset-0 rounded-full bg-primary-strong shadow-sm"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10">{link.label}</span>
                </Link>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            {onOpenCommand && (
              <m.button
                type="button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onOpenCommand}
                className="hidden cursor-pointer items-center gap-1.5 rounded-full border border-line-strong bg-surface-2 px-3 py-1.5 font-mono text-xs text-fg-muted transition-colors hover:border-primary hover:text-fg sm:inline-flex"
                aria-keyshortcuts="Meta+K Control+K"
              >
                <Command className="size-3" />
                <span>⌘K</span>
                <span className="sr-only">Open command menu</span>
              </m.button>
            )}

            <m.a
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              href={RESUME_PDF_PATH}
              download
              className="hidden items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1.5 font-mono text-xs font-semibold text-primary-text transition-colors hover:border-primary hover:bg-primary/20 sm:inline-flex"
            >
              <Download className="size-3" />
              <span>Resume</span>
            </m.a>

            <m.button
              type="button"
              whileHover={{ scale: 1.08, rotate: 15 }}
              whileTap={{ scale: 0.92 }}
              onClick={toggleTheme}
              className="flex size-8 cursor-pointer items-center justify-center rounded-full border border-line-strong bg-surface-2 text-fg shadow-xs transition-colors hover:border-primary"
              aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
            >
              <AnimatePresence mode="wait" initial={false}>
                <m.span
                  key={isDark ? 'sun' : 'moon'}
                  initial={{ opacity: 0, rotate: -90, scale: 0.4 }}
                  animate={{ opacity: 1, rotate: 0, scale: 1 }}
                  exit={{ opacity: 0, rotate: 90, scale: 0.4 }}
                  transition={{ type: 'spring', stiffness: 420, damping: 22 }}
                  className="inline-flex"
                >
                  {isDark ? (
                    <Sun className="size-4 text-amber-400" />
                  ) : (
                    <Moon className="size-4 text-primary" />
                  )}
                </m.span>
              </AnimatePresence>
            </m.button>

            <m.button
              type="button"
              whileTap={{ scale: 0.92 }}
              onClick={() => setIsMenuOpen((open) => !open)}
              onPointerEnter={loadMobileNav}
              onTouchStart={loadMobileNav}
              onFocus={loadMobileNav}
              className="flex size-8 cursor-pointer items-center justify-center rounded-full border border-line bg-surface-2 text-fg-muted lg:hidden"
              aria-label="Toggle navigation menu"
              aria-expanded={isMenuOpen}
              aria-controls="mobile-nav"
            >
              <AnimatePresence mode="wait" initial={false}>
                <m.span
                  key={isMenuOpen ? 'close' : 'open'}
                  initial={{ opacity: 0, rotate: -45 }}
                  animate={{ opacity: 1, rotate: 0 }}
                  exit={{ opacity: 0, rotate: 45 }}
                  transition={{ duration: 0.15 }}
                  className="inline-flex"
                >
                  {isMenuOpen ? <X className="size-4" /> : <Menu className="size-4" />}
                </m.span>
              </AnimatePresence>
            </m.button>
          </div>
        </nav>
      </Enter>

      <AnimatePresence>
        {isMenuOpen && <MobileNav pathname={pathname} onClose={closeMenu} />}
      </AnimatePresence>

      <div className="h-20 print:hidden" aria-hidden />
    </>
  );
}
