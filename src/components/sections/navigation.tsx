'use client';

import { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
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
  ChevronDown,
  LayoutGrid,
  Sun,
  Moon,
  Wrench,
  Menu,
} from 'lucide-react';
import { useTheme } from '@/components/reusable/theme-provider';
import { DEV_TOOLS } from '@/lib/data/tools';
import { MobileNavItem } from '@/components/sections/mobile-nav-item';
import { MobileNavMenu } from '@/components/sections/mobile-nav-menu';
import { MobileNavList } from '@/components/sections/mobile-nav-list';
import { MultilingualLogo } from '@/components/reusable/multilingual-logo';

type SimpleLink = {
  kind: 'link';
  label: string;
  href: string;
  icon: LucideIcon;
};

type GroupLink = {
  kind: 'group';
  label: string;
  icon: LucideIcon;
  children: { label: string; href: string; icon: LucideIcon }[];
};

type NavItem = SimpleLink | GroupLink;

const dropdownVariants = {
  hidden: { opacity: 0, y: -8, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] as const },
  },
  exit: {
    opacity: 0,
    y: -8,
    scale: 0.96,
    transition: { duration: 0.15, ease: 'easeIn' as const },
  },
};

const mobileDrawerVariants = {
  hidden: { x: '100%', transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] as const } },
  visible: {
    x: 0,
    transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] as const },
  },
};

export function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const dropdownRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const pathname = usePathname();
  const { theme, toggleTheme, isDark } = useTheme();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (openDropdown) {
        const ref = dropdownRefs.current[openDropdown];
        if (ref && !ref.contains(e.target as Node)) {
          setOpenDropdown(null);
        }
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [openDropdown]);

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
      setOpenDropdown(null);
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

  const mobileTopLinks = navItems.filter((i) => i.kind === 'link') as SimpleLink[];
  const exploreGroup = navItems.find(
    (i) => i.kind === 'group' && i.label === 'Explore'
  ) as GroupLink;
  const toolsGroup = navItems.find((i) => i.kind === 'group' && i.label === 'Tools') as GroupLink;

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
        <div className="hidden items-center gap-1 lg:flex">
          {navItems.map((item) => {
            if (item.kind === 'link') {
              const active = isActive(item.href);
              return (
                <div key={item.href}>
                  <Link
                    href={item.href}
                    className={`relative rounded-lg px-4 py-2 text-sm font-medium transition-colors duration-200 ${
                      active ? 'text-aurora-green' : 'text-midnight-500 hover:text-midnight-950'
                    }`}
                  >
                    {item.label}
                    {active && (
                      <motion.span
                        layoutId="nav-indicator"
                        className="bg-aurora-green absolute inset-x-2 -bottom-1 h-0.5 rounded-full"
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                      />
                    )}
                  </Link>
                </div>
              );
            }

            const groupActive = isGroupActive(item.children);
            const isOpen = openDropdown === item.label;
            return (
              <div key={item.label}>
                <div
                  className="relative"
                  ref={(el) => {
                    if (el) dropdownRefs.current[item.label] = el;
                  }}
                  onMouseEnter={() => setOpenDropdown(item.label)}
                  onMouseLeave={() => setOpenDropdown(null)}
                >
                  <button
                    className={`flex cursor-pointer items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-colors duration-200 ${
                      groupActive || isOpen
                        ? 'text-aurora-green'
                        : 'text-midnight-500 hover:text-midnight-950'
                    }`}
                  >
                    {item.label}
                    <motion.div
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronDown className="h-3.5 w-3.5" />
                    </motion.div>
                  </button>

                  <div>
                    {isOpen && (
                      <motion.div
                        variants={dropdownVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="absolute top-full left-1/2 -translate-x-1/2 pt-2"
                      >
                        <div
                          className={`border-midnight-200 bg-midnight-50 overflow-hidden rounded-xl border shadow-xl ${
                            item.label === 'Tools' ? 'w-96' : 'min-w-48'
                          }`}
                        >
                          <div className="via-aurora-green/20 h-px w-full bg-linear-to-r from-transparent to-transparent" />
                          {item.label === 'Tools' ? (
                            <>
                              {(() => {
                                const AllToolsIcon = item.children[0].icon;
                                const allToolsActive = isActive(item.children[0].href);
                                return (
                                  <Link
                                    href={item.children[0].href}
                                    className={`border-midnight-200 flex items-center justify-center gap-2 border-b px-4 py-3.5 text-sm font-medium transition-all duration-200 ${
                                      allToolsActive
                                        ? 'text-aurora-green bg-aurora-green/5'
                                        : 'text-midnight-500 hover:text-midnight-950 hover:bg-midnight-100'
                                    }`}
                                  >
                                    <AllToolsIcon className="h-4 w-4 shrink-0" />
                                    {item.children[0].label}
                                    <span className="text-midnight-500 ml-1 text-xs font-normal">
                                      ({item.children.length - 1})
                                    </span>
                                  </Link>
                                );
                              })()}
                              <div className="grid max-h-72 grid-cols-3 gap-px overflow-auto p-1">
                                {item.children.slice(1).map((child) => {
                                  const active = isActive(child.href);
                                  const ChildIcon = child.icon;
                                  return (
                                    <Link
                                      key={child.href}
                                      href={child.href}
                                      className={`flex flex-col items-center justify-center gap-1.5 rounded-lg px-2 py-3 text-xs font-medium transition-all duration-200 ${
                                        active
                                          ? 'text-aurora-green bg-aurora-green/5'
                                          : 'text-midnight-500 hover:text-midnight-950 hover:bg-midnight-100'
                                      }`}
                                    >
                                      <ChildIcon className="h-3.5 w-3.5 shrink-0" />
                                      <p className="text-center">{child.label}</p>
                                    </Link>
                                  );
                                })}
                              </div>
                            </>
                          ) : (
                            <div className="flex flex-col p-1">
                              {item.children.map((child) => {
                                const active = isActive(child.href);
                                const ChildIcon = child.icon;
                                return (
                                  <Link
                                    key={child.href}
                                    href={child.href}
                                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                                      active
                                        ? 'text-aurora-green bg-aurora-green/5'
                                        : 'text-midnight-500 hover:text-midnight-950 hover:bg-midnight-100'
                                    }`}
                                  >
                                    <span
                                      className={`absolute top-0 bottom-0 left-0 w-0.5 rounded-r transition-opacity duration-200 ${
                                        active
                                          ? 'bg-aurora-green opacity-100'
                                          : 'bg-midnight-300 opacity-0 group-hover:opacity-100'
                                      }`}
                                    />
                                    <ChildIcon className="h-3.5 w-3.5 shrink-0" />
                                    {child.label}
                                  </Link>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

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

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-md lg:hidden"
            onClick={() => setIsMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            variants={mobileDrawerVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="bg-midnight-50 border-midnight-200 fixed top-0 right-0 z-50 flex h-dvh w-80 flex-col border-l lg:hidden"
          >
            <div className="via-aurora-green/30 h-px w-full bg-linear-to-r from-transparent to-transparent" />

            <div className="flex items-center justify-between px-6 py-5">
              <div>
                <Link
                  href="/"
                  onClick={() => setIsMenuOpen(false)}
                  className="font-heading text-lg font-bold tracking-wide"
                >
                  <MultilingualLogo showDevSuffix={true} />
                </Link>
                <p className="text-midnight-500 text-sm">Software Engineer</p>
              </div>
            </div>

            <div className="from-midnight-200 via-midnight-200 mx-6 mb-3 h-px bg-linear-to-r to-transparent" />

            <MobileNavList>
              {mobileTopLinks.slice(0, 1).map((link) => (
                <MobileNavItem
                  key={link.href}
                  href={link.href}
                  label={link.label}
                  icon={link.icon}
                  active={isActive(link.href)}
                  onClick={() => setIsMenuOpen(false)}
                />
              ))}

              <MobileNavMenu
                label={exploreGroup.label}
                icon={exploreGroup.icon}
                items={exploreGroup.children}
                isItemActive={isActive}
                isGroupActive={isGroupActive}
                closeDrawer={() => setIsMenuOpen(false)}
              />

              {mobileTopLinks.slice(1, 3).map((link) => (
                <MobileNavItem
                  key={link.href}
                  href={link.href}
                  label={link.label}
                  icon={link.icon}
                  active={isActive(link.href)}
                  onClick={() => setIsMenuOpen(false)}
                />
              ))}

              <MobileNavMenu
                label={toolsGroup.label}
                icon={toolsGroup.icon}
                items={toolsGroup.children}
                isItemActive={isActive}
                isGroupActive={isGroupActive}
                closeDrawer={() => setIsMenuOpen(false)}
              />

              {mobileTopLinks.slice(3).map((link) => (
                <MobileNavItem
                  key={link.href}
                  href={link.href}
                  label={link.label}
                  icon={link.icon}
                  active={isActive(link.href)}
                  onClick={() => setIsMenuOpen(false)}
                />
              ))}
            </MobileNavList>

            <div className="px-6 pt-3 pb-6">
              <div className="from-midnight-200 via-midnight-200 mb-4 h-px bg-linear-to-r to-transparent" />
              <div className="flex items-center gap-2">
                <span className="bg-aurora-green h-2.5 w-2.5 animate-pulse rounded-full shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
                <span className="text-aurora-green text-sm font-medium">Open to opportunities</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
