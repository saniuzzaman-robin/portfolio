'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import {
  Gamepad2,
  Home,
  User,
  FolderGit2,
  Zap,
  BookOpen,
  FileText,
  X,
  LayoutGrid,
  Sun,
  Moon,
  Wrench,
  Menu,
} from 'lucide-react';
import { useTheme } from '@/components/reusable/theme-provider';
import { DEV_TOOLS } from '@/lib/data/tools';
import { MultilingualLogo } from '@/components/reusable/multilingual-logo';
import { DesktopNav } from '@/components/sections/desktop-nav';
import { MobileNav } from '@/components/sections/mobile-nav';

export type SimpleLink = {
  kind: 'link';
  label: string;
  href: string;
  icon: LucideIcon;
};

export type GroupLink = {
  kind: 'group';
  label: string;
  icon: LucideIcon;
  children: { label: string; href: string; icon: LucideIcon }[];
};

export type NavItem = SimpleLink | GroupLink;

export function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const { theme, toggleTheme, isDark } = useTheme();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isMenuOpen) {
      document.documentElement.style.overflow = 'hidden';
      document.body.style.overflow = 'hidden';
    } else {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
    }
    return () => {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  useEffect(() => {
    const id = setTimeout(() => {
      setIsMenuOpen(false);
    }, 0);
    return () => clearTimeout(id);
  }, [pathname]);

  const navItems: NavItem[] = [
    { kind: 'link', label: 'Home', href: '/', icon: Home },
    {
      kind: 'group',
      label: 'Explore',
      icon: LayoutGrid,
      children: [
        { label: 'About', href: '/about', icon: User },
        { label: 'Blog', href: '/blog', icon: BookOpen },
        { label: 'Skills', href: '/skills', icon: Zap },
      ],
    },
    { kind: 'link', label: 'Projects', href: '/projects', icon: FolderGit2 },
    {
      kind: 'group',
      label: 'Tools',
      icon: Wrench,
      children: [
        { label: 'All Tools', href: '/tools', icon: LayoutGrid },
        ...DEV_TOOLS.map((tool) => ({
          label: tool.title,
          href: tool.href,
          icon: tool.icon,
        })),
      ],
    },
    { kind: 'link', label: 'Resume', href: '/resume', icon: FileText },
    { kind: 'link', label: 'Games', href: '/games', icon: Gamepad2 },
  ];

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    if (href === '/tools') return pathname === '/tools';
    return pathname.startsWith(href);
  };

  const isGroupActive = (children: { href: string }[]) => children.some((c) => isActive(c.href));

  return (
    <>
      <motion.nav
        className={`fixed top-0 right-0 left-0 z-50 flex items-center justify-between px-6 py-4 transition-all duration-300 lg:px-12 xl:px-16 ${
          scrolled
            ? 'border-b border-(--glass-border) bg-(--glass-bg) py-3 shadow-lg shadow-black/10 backdrop-blur-xl'
            : 'bg-transparent py-4'
        }`}
      >
        <Link href="/" className="font-heading group relative text-lg font-bold tracking-wide">
          <MultilingualLogo showDevSuffix={true} />
        </Link>

        {/* Desktop Nav */}
        <DesktopNav navItems={navItems} isActive={isActive} isGroupActive={isGroupActive} />

        {/* Right controls */}
        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleTheme}
            className="text-midnight-500 hover:text-aurora-green hover:bg-midnight-100 hidden h-9 w-9 cursor-pointer items-center justify-center rounded-full transition-all duration-200 xl:flex"
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </motion.button>

          <div className="flex items-center gap-2 lg:hidden">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleTheme}
              className="text-midnight-500 hover:text-aurora-green hover:bg-midnight-100 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full transition-all duration-200"
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="hover:bg-midnight-100 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full transition-all duration-200"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <X className="text-midnight-500 h-4 w-4" />
              ) : (
                <Menu className="text-midnight-500 h-4 w-4" />
              )}
            </motion.button>
          </div>
        </div>
      </motion.nav>

      {/* Spacer */}
      <div className="h-16" />

      {/* Mobile Nav */}
      <MobileNav
        isMenuOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        navItems={navItems}
        isActive={isActive}
        isGroupActive={isGroupActive}
      />
    </>
  );
}
