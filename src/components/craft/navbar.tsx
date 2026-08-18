'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sun,
  Moon,
  Download,
  Menu,
  X,
  Command,
  Layers,
  Briefcase,
  FolderGit2,
  Mail,
} from 'lucide-react';
import { useTheme } from '@/components/reusable/theme-provider';
import { CV_DATA } from '@/lib/cv-data';

export const CRAFT_NAV_LINKS = [
  { label: 'Overview', href: '/', icon: Layers },
  { label: 'Experience', href: '/resume', icon: Briefcase },
  { label: 'Platforms', href: '/projects', icon: FolderGit2 },
];

interface NavbarProps {
  onOpenCommand?: () => void;
}

export function Navbar({ onOpenCommand }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const { toggleTheme, isDark } = useTheme();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <>
      <header className="pointer-events-none fixed top-0 right-0 left-0 z-50 flex justify-center px-3 py-3 sm:px-4 sm:py-4">
        <nav
          className={`pointer-events-auto flex items-center justify-between gap-2.5 rounded-full px-3.5 py-2 transition-all duration-300 sm:gap-4 sm:px-5 sm:py-2.5 ${
            scrolled
              ? 'glass-nav w-full max-w-5xl border border-(--border-subtle) shadow-lg'
              : 'w-full max-w-6xl bg-transparent'
          }`}
        >
          {/* Monogram Brand */}
          <Link href="/" className="group flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-linear-to-br from-indigo-600 to-indigo-800 font-mono text-xs font-black text-white shadow-md shadow-indigo-600/30 transition-transform group-hover:scale-105">
              SR
            </div>
            <div className="flex flex-col">
              <span className="font-heading text-xs font-bold tracking-tight text-(--text-main)">
                Md. Saniuzzaman Robin
              </span>
              <span className="font-mono text-[10px] font-medium text-indigo-400">
                Software Engineer • 5+ Yrs
              </span>
            </div>
          </Link>

          {/* Desktop Nav Items */}
          <div className="hidden items-center gap-1 rounded-full border border-(--border-subtle) bg-(--surface-2) p-1 lg:flex">
            {CRAFT_NAV_LINKS.map((link) => {
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative rounded-full px-3.5 py-1 text-xs font-semibold transition-colors duration-200 ${
                    active ? 'text-white' : 'text-(--text-secondary) hover:text-(--text-main)'
                  }`}
                >
                  {active && (
                    <motion.div
                      layoutId="craft-active-pill"
                      className="absolute inset-0 rounded-full bg-indigo-600 shadow-sm"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10">{link.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Right Action Tools */}
          <div className="flex items-center gap-2">
            {/* Command Palette Trigger */}
            {onOpenCommand && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onOpenCommand}
                className="hidden cursor-pointer items-center gap-1.5 rounded-full border border-(--border-hover) bg-(--surface-2) px-3 py-1.5 font-mono text-xs text-(--text-secondary) transition-colors hover:border-indigo-500 hover:text-(--text-main) sm:inline-flex"
                title="Open Command Menu (⌘K)"
              >
                <Command className="h-3 w-3" />
                <span>⌘K</span>
              </motion.button>
            )}

            {/* Quick Resume Download */}
            <motion.a
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              href="/CV_SANIUZZAMAN_ROBIN.pdf"
              download
              className="hidden items-center gap-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3.5 py-1.5 font-mono text-xs font-semibold text-indigo-500 transition-colors hover:border-indigo-500 hover:bg-indigo-500/20 sm:inline-flex"
            >
              <Download className="h-3 w-3" />
              <span>Resume</span>
            </motion.a>

            {/* Dark/Light Mode Switcher */}
            <motion.button
              whileHover={{ scale: 1.08, rotate: 15 }}
              whileTap={{ scale: 0.92 }}
              onClick={toggleTheme}
              className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-(--border-hover) bg-(--surface-2) text-(--text-main) shadow-xs transition-colors hover:border-indigo-500"
              aria-label="Toggle theme"
            >
              {isDark ? (
                <Sun className="h-4 w-4 text-amber-400" />
              ) : (
                <Moon className="h-4 w-4 text-indigo-600" />
              )}
            </motion.button>

            {/* Mobile Menu Toggle */}
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-(--border-subtle) bg-(--surface-2) text-(--text-secondary) lg:hidden"
              aria-label="Toggle navigation drawer"
            >
              {isMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </motion.button>
          </div>
        </nav>
      </header>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm lg:hidden"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              className="fixed top-0 right-0 bottom-0 z-50 flex w-72 flex-col justify-between border-l border-(--border-subtle) bg-(--bg-canvas) p-6 shadow-2xl lg:hidden"
            >
              <div>
                <div className="mb-6 flex items-center justify-between border-b border-(--border-subtle) pb-4">
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 font-mono text-xs font-bold text-white">
                      SR
                    </div>
                    <div>
                      <p className="font-heading text-xs font-bold text-(--text-main)">
                        {CV_DATA.name}
                      </p>
                      <p className="font-mono text-[10px] text-indigo-400">{CV_DATA.role}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsMenuOpen(false)}
                    className="cursor-pointer rounded-full p-1 text-(--text-muted)"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="space-y-1">
                  {CRAFT_NAV_LINKS.map((link) => {
                    const active = isActive(link.href);
                    const Icon = link.icon;
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setIsMenuOpen(false)}
                        className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-colors ${
                          active
                            ? 'bg-indigo-600/10 text-indigo-400'
                            : 'text-(--text-secondary) hover:bg-(--surface-2) hover:text-(--text-main)'
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        <span>{link.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-3 border-t border-(--border-subtle) pt-6">
                <a
                  href="/CV_SANIUZZAMAN_ROBIN.pdf"
                  download
                  className="btn-primary flex w-full items-center justify-center gap-2 py-2 text-xs"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Download Resume PDF</span>
                </a>
                <a
                  href={`mailto:${CV_DATA.email}`}
                  className="flex items-center justify-center gap-2 py-2 font-mono text-xs text-(--text-muted) transition-colors hover:text-indigo-400"
                >
                  <Mail className="h-3 w-3" />
                  <span>{CV_DATA.email}</span>
                </a>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="h-20" />
    </>
  );
}
