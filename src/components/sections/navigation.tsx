'use client';

import { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
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
} from 'lucide-react';
import { useTheme } from '@/components/reusable/theme-provider';
import { useNavScroll } from '@/hooks/use-nav-scroll';
import { DEV_TOOLS } from '@/lib/data/tools';

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

export function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const scrolled = useNavScroll(20);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [mobileGroupOpen, setMobileGroupOpen] = useState(false);
  const dropdownRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const drawerLinksRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();

  // Close dropdown on outside click
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

  // Prevent body scroll when drawer is open
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

  // Prevent scroll propagation from drawer to body
  useEffect(() => {
    const drawer = drawerLinksRef.current;
    if (!drawer) return;

    const handleWheel = (e: WheelEvent) => {
      const isScrollingDown = e.deltaY > 0;
      const isAtBottom = drawer.scrollHeight - drawer.scrollTop <= drawer.clientHeight + 5;
      const isAtTop = drawer.scrollTop <= 5;

      if ((isScrollingDown && isAtBottom) || (!isScrollingDown && isAtTop)) {
        e.preventDefault();
      }
    };

    drawer.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      drawer.removeEventListener('wheel', handleWheel);
    };
  }, [isMenuOpen]);

  // Close dropdown on route change
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
      children: DEV_TOOLS.map((tool) => ({
        label: tool.title,
        href: tool.href,
        icon: tool.icon,
      })),
    },
    { kind: 'link', label: 'Resume', href: '/resume', icon: FileText },
    { kind: 'link', label: 'Games', href: '/games', icon: Gamepad2 },
  ];

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  const isGroupActive = (children: { href: string }[]) => children.some((c) => isActive(c.href));

  // Flat list for mobile drawer (preserving original order)
  const mobileTopLinks = navItems.filter((i) => i.kind === 'link') as SimpleLink[];
  const groupItem = navItems.find((i) => i.kind === 'group') as GroupLink;

  return (
    <>
      <nav
        className={`fixed top-0 right-0 left-0 z-50 flex items-center justify-between px-6 py-4 transition-all duration-500 md:px-12 lg:px-20 ${
          scrolled
            ? 'bg-neutral-5/95 border-b border-white/8 shadow-xl shadow-black/40 backdrop-blur-xl'
            : 'bg-neutral-5/60 backdrop-blur-md'
        }`}
      >
        {/* Logo */}
        <Link
          href="/"
          className="font-space-grotesk group relative text-lg font-bold tracking-widest uppercase"
        >
          <span className="neon-green group-hover:animate-glitch transition-all duration-300">
            ARCH
          </span>
          <span className="neon-cyan">ITECT</span>
          <span className="neon-purple">VI</span>
          <span className="from-primary-50 via-secondary-50 to-tertiary-50 absolute -bottom-1 left-0 h-px w-0 bg-linear-to-r transition-all duration-500 group-hover:w-full" />
        </Link>

        {/* Desktop Nav */}
        <div className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => {
            if (item.kind === 'link') {
              const active = isActive(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`font-space-grotesk group relative flex items-center gap-1.5 rounded-sm px-4 py-2 text-xs tracking-widest uppercase transition-all duration-300 ${
                    active ? 'text-primary-50' : 'text-neutral-70 hover:text-neutral-100'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {item.label}
                  {active && (
                    <span className="from-primary-50 to-secondary-50 absolute right-2 bottom-0 left-2 h-px bg-linear-to-r" />
                  )}
                  <span className="absolute inset-0 rounded-sm bg-white/3 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                </Link>
              );
            }

            // Dropdown group
            const groupActive = isGroupActive(item.children);
            const Icon = item.icon;
            const isOpen = openDropdown === item.label;
            return (
              <div
                key={item.label}
                className="relative"
                ref={(el) => {
                  if (el) dropdownRefs.current[item.label] = el;
                }}
                onMouseEnter={() => setOpenDropdown(item.label)}
                onMouseLeave={() => setOpenDropdown(null)}
              >
                <button
                  className={`font-space-grotesk relative flex cursor-pointer items-center gap-1.5 rounded-sm px-4 py-2 text-xs tracking-widest uppercase transition-all duration-300 ${
                    groupActive || isOpen
                      ? 'text-primary-50'
                      : 'text-neutral-70 hover:text-neutral-100'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {item.label}
                  <ChevronDown
                    className={`h-3 w-3 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                  />
                  {groupActive && !isOpen && (
                    <span className="from-primary-50 to-secondary-50 absolute right-2 bottom-0 left-2 h-px bg-linear-to-r" />
                  )}
                  <span className="absolute inset-0 rounded-sm bg-white/3 opacity-0 transition-opacity duration-300 hover:opacity-100" />
                </button>

                {/* Dropdown panel */}
                {isOpen && (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 pt-1">
                    <div
                      className="animate-dropdown-open min-w-40 overflow-hidden rounded-sm border border-white/10"
                      style={{
                        background: 'var(--nav-dropdown-bg)',
                        boxShadow: 'var(--nav-dropdown-shadow)',
                      }}
                    >
                      <div className="via-primary-50/50 h-px w-full bg-linear-to-r from-transparent to-transparent" />
                      {item.children.map((child, idx) => {
                        const active = isActive(child.href);
                        const ChildIcon = child.icon;
                        return (
                          <Link
                            key={child.href}
                            href={child.href}
                            className={`font-space-grotesk group animate-dropdown-item relative flex items-center gap-3 px-4 py-3 text-xs tracking-widest uppercase transition-all duration-200 ${
                              active
                                ? 'text-primary-50 bg-primary-50/8'
                                : 'text-neutral-70 hover:bg-white/5 hover:text-neutral-100'
                            }`}
                            style={{ animationDelay: `${idx * 50}ms` }}
                          >
                            <span
                              className={`absolute top-0 bottom-0 left-0 w-0.5 transition-opacity duration-200 ${active ? 'bg-primary-50 opacity-100' : 'bg-white/20 opacity-0 group-hover:opacity-100'}`}
                            />
                            <ChildIcon className="h-3.5 w-3.5 shrink-0" />
                            {child.label}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Theme Toggle (desktop) */}
        <button
          onClick={toggleTheme}
          className="text-neutral-60 hover:text-primary-50 hover:border-primary-50/40 hover:bg-primary-50/5 ml-2 hidden h-8 w-8 cursor-pointer items-center justify-center rounded-sm border border-white/10 transition-all duration-200 md:flex"
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
        </button>

        {/* Mobile controls */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            onClick={toggleTheme}
            className="text-neutral-60 hover:text-primary-50 hover:border-primary-50/40 hover:bg-primary-50/5 flex h-8 w-8 cursor-pointer items-center justify-center rounded-sm border border-white/10 transition-all duration-200"
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
          </button>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="flex cursor-pointer flex-col gap-1.5 p-1"
            aria-label="Toggle menu"
          >
            <span
              className={`bg-primary-50 h-px w-6 transition-all duration-300 ${isMenuOpen ? 'translate-y-1.5 rotate-45' : ''}`}
            />
            <span
              className={`bg-secondary-50 h-px w-4 transition-all duration-300 ${isMenuOpen ? 'w-6 opacity-0' : ''}`}
            />
            <span
              className={`bg-tertiary-50 h-px w-6 transition-all duration-300 ${isMenuOpen ? '-translate-y-1.5 -rotate-45' : ''}`}
            />
          </button>
        </div>
      </nav>

      {/* Spacer */}
      <div className="h-16" />

      {/* Mobile Overlay */}
      {isMenuOpen && (
        <div
          className="animate-fade-in fixed inset-0 z-40 bg-black/70 backdrop-blur-md md:hidden"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {/* Mobile Drawer */}
      <div
        className={`fixed top-0 right-0 z-50 flex h-dvh w-80 flex-col transition-transform duration-300 ease-in-out md:hidden ${
          isMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{ background: 'var(--nav-drawer-bg)' }}
      >
        {/* Top accent line */}
        <div className="via-primary-50 h-px w-full bg-linear-to-r from-transparent to-transparent" />

        {/* Drawer header */}
        <div className="flex items-center justify-between px-6 py-5">
          <div className="flex flex-col gap-0.5">
            <Link
              href="/"
              onClick={() => setIsMenuOpen(false)}
              className="font-space-grotesk text-base font-bold tracking-widest uppercase"
            >
              <span className="neon-green">ARCH</span>
              <span className="neon-cyan">ITECT</span>
              <span className="neon-purple">VI</span>
            </Link>
            <p className="font-space-grotesk text-xs tracking-wider text-neutral-50">
              Software Engineer
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMenuOpen(false)}
              className="text-neutral-60 hover:border-primary-50/50 hover:bg-primary-50/5 flex h-8 w-8 items-center justify-center rounded-sm border border-white/10 transition-all duration-200 hover:text-neutral-100"
              aria-label="Close menu"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Divider */}
        <div className="from-primary-50/30 mx-6 mb-4 h-px bg-linear-to-r via-white/10 to-transparent" />

        {/* Nav links */}
        <div ref={drawerLinksRef} className="flex flex-1 flex-col gap-1 overflow-y-auto px-4">
          {/* Home */}
          {(() => {
            const homeLink = navItems[0] as SimpleLink;
            const active = isActive(homeLink.href);
            const Icon = homeLink.icon;
            return (
              <Link
                href={homeLink.href}
                onClick={() => setIsMenuOpen(false)}
                className={`font-space-grotesk group relative flex items-center gap-4 overflow-hidden rounded-sm px-4 py-3.5 text-xs tracking-widest uppercase transition-all duration-200 ${
                  active
                    ? 'text-primary-50 bg-primary-50/8'
                    : 'text-neutral-70 hover:bg-white/5 hover:text-neutral-100'
                }`}
              >
                <span
                  className={`absolute top-0 bottom-0 left-0 w-0.5 rounded-r transition-all duration-200 ${active ? 'bg-primary-50' : 'bg-primary-50/0 group-hover:bg-white/20'}`}
                />
                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-sm transition-all duration-200 ${active ? 'bg-primary-50/15 text-primary-50' : 'text-neutral-60 group-hover:text-neutral-90 bg-white/5 group-hover:bg-white/8'}`}
                >
                  <Icon className="h-3.5 w-3.5" />
                </span>
                <span className="flex-1">{homeLink.label}</span>
              </Link>
            );
          })()}

          {/* Collapsible group */}
          <div className="overflow-hidden rounded-sm border border-white/5">
            <button
              onClick={() => setMobileGroupOpen((o) => !o)}
              className={`font-space-grotesk group relative flex w-full items-center gap-4 px-4 py-3.5 text-xs tracking-widest uppercase transition-all duration-200 ${
                isGroupActive(groupItem.children)
                  ? 'text-primary-50 bg-primary-50/8'
                  : 'text-neutral-70 hover:bg-white/5 hover:text-neutral-100'
              }`}
            >
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-sm transition-all duration-200 ${isGroupActive(groupItem.children) ? 'bg-primary-50/15 text-primary-50' : 'text-neutral-60 group-hover:text-neutral-90 bg-white/5 group-hover:bg-white/8'}`}
              >
                <LayoutGrid className="h-3.5 w-3.5" />
              </span>
              <span className="flex-1 text-left">{groupItem.label}</span>
              <ChevronDown
                className={`h-3.5 w-3.5 transition-transform duration-200 ${mobileGroupOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {/* Nested items */}
            <div
              className={`overflow-hidden transition-all duration-300 ${mobileGroupOpen ? 'max-h-60' : 'max-h-0'}`}
            >
              <div className="border-t border-white/5">
                {groupItem.children.map((child) => {
                  const active = isActive(child.href);
                  const ChildIcon = child.icon;
                  return (
                    <Link
                      key={child.href}
                      href={child.href}
                      onClick={() => setIsMenuOpen(false)}
                      className={`font-space-grotesk group relative flex items-center gap-4 py-3 pr-4 pl-10 text-xs tracking-widest uppercase transition-all duration-200 ${
                        active
                          ? 'text-primary-50 bg-primary-50/8'
                          : 'text-neutral-60 hover:bg-white/5 hover:text-neutral-100'
                      }`}
                    >
                      <span
                        className={`absolute top-0 bottom-0 left-0 w-0.5 rounded-r transition-all duration-200 ${active ? 'bg-primary-50' : 'opacity-0 group-hover:bg-white/20 group-hover:opacity-100'}`}
                      />
                      <span
                        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-sm transition-all duration-200 ${active ? 'bg-primary-50/15 text-primary-50' : 'group-hover:text-neutral-90 bg-white/5 text-neutral-50 group-hover:bg-white/8'}`}
                      >
                        <ChildIcon className="h-3 w-3" />
                      </span>
                      <span className="flex-1">{child.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Remaining top-level links */}
          {mobileTopLinks.slice(1).map((link, i) => {
            const active = isActive(link.href);
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMenuOpen(false)}
                className={`font-space-grotesk group relative flex items-center gap-4 overflow-hidden rounded-sm px-4 py-3.5 text-xs tracking-widest uppercase transition-all duration-200 ${
                  active
                    ? 'text-primary-50 bg-primary-50/8'
                    : 'text-neutral-70 hover:bg-white/5 hover:text-neutral-100'
                }`}
                style={{ animationDelay: `${(i + 2) * 40}ms` }}
              >
                <span
                  className={`absolute top-0 bottom-0 left-0 w-0.5 rounded-r transition-all duration-200 ${active ? 'bg-primary-50' : 'bg-primary-50/0 group-hover:bg-white/20'}`}
                />
                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-sm transition-all duration-200 ${active ? 'bg-primary-50/15 text-primary-50' : 'text-neutral-60 group-hover:text-neutral-90 bg-white/5 group-hover:bg-white/8'}`}
                >
                  <Icon className="h-3.5 w-3.5" />
                </span>
                <span className="flex-1">{link.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Bottom section */}
        <div className="px-6 pt-4 pb-8">
          <div className="from-primary-50/30 mb-5 h-px bg-linear-to-r via-white/10 to-transparent" />
          <p className="text-neutral-40 font-space-grotesk mb-1 text-xs tracking-widest uppercase">
            Available for work
          </p>
          <div className="flex items-center gap-2">
            <span className="bg-primary-50 h-1.5 w-1.5 animate-pulse rounded-full" />
            <span className="text-primary-50 font-space-grotesk text-xs">
              Open to opportunities
            </span>
          </div>
        </div>

        {/* Bottom accent line */}
        <div className="via-secondary-50/40 h-px w-full bg-linear-to-r from-transparent to-transparent" />
      </div>
    </>
  );
}
