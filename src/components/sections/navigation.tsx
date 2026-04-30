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
} from 'lucide-react';

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
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileGroupOpen, setMobileGroupOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const drawerLinksRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close dropdown on route change
  useEffect(() => {
    const id = setTimeout(() => {
      setDropdownOpen(false);
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
        className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 md:px-12 lg:px-20 transition-all duration-500 ${
          scrolled
            ? 'bg-neutral-5/95 backdrop-blur-xl border-b border-white/8 shadow-xl shadow-black/40'
            : 'bg-neutral-5/60 backdrop-blur-md'
        }`}
      >
        {/* Logo */}
        <Link
          href="/"
          className="font-space-grotesk font-bold text-lg uppercase tracking-widest group relative"
        >
          <span className="neon-green group-hover:animate-glitch transition-all duration-300">
            ARCH
          </span>
          <span className="neon-cyan">ITECT</span>
          <span className="neon-purple">VI</span>
          <span className="absolute -bottom-1 left-0 w-0 h-px bg-linear-to-r from-primary-50 via-secondary-50 to-tertiary-50 group-hover:w-full transition-all duration-500" />
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            if (item.kind === 'link') {
              const active = isActive(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative px-4 py-2 text-xs font-space-grotesk uppercase tracking-widest transition-all duration-300 rounded-sm group flex items-center gap-1.5 ${
                    active ? 'text-primary-50' : 'text-neutral-70 hover:text-neutral-100'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {item.label}
                  {active && (
                    <span className="absolute bottom-0 left-2 right-2 h-px bg-linear-to-r from-primary-50 to-secondary-50" />
                  )}
                  <span className="absolute inset-0 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/3" />
                </Link>
              );
            }

            // Dropdown group
            const groupActive = isGroupActive(item.children);
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className="relative"
                ref={dropdownRef}
                onMouseEnter={() => setDropdownOpen(true)}
                onMouseLeave={() => setDropdownOpen(false)}
              >
                <button
                  className={`relative px-4 py-2 text-xs font-space-grotesk uppercase tracking-widest transition-all duration-300 rounded-sm flex items-center gap-1.5 cursor-pointer ${
                    groupActive || dropdownOpen
                      ? 'text-primary-50'
                      : 'text-neutral-70 hover:text-neutral-100'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {item.label}
                  <ChevronDown
                    className={`w-3 h-3 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}
                  />
                  {groupActive && !dropdownOpen && (
                    <span className="absolute bottom-0 left-2 right-2 h-px bg-linear-to-r from-primary-50 to-secondary-50" />
                  )}
                  <span className="absolute inset-0 rounded-sm opacity-0 hover:opacity-100 transition-opacity duration-300 bg-white/3" />
                </button>

                {/* Dropdown panel */}
                {dropdownOpen && (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 pt-1">
                    <div
                      className="min-w-40 rounded-sm border border-white/10 overflow-hidden animate-dropdown-open"
                      style={{
                        background: 'linear-gradient(160deg, #0d1525 0%, #080d1a 100%)',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.6), 0 0 0 1px rgba(164,118,255,0.15)',
                      }}
                    >
                      <div className="h-px w-full bg-linear-to-r from-transparent via-primary-50/50 to-transparent" />
                      {item.children.map((child, idx) => {
                        const active = isActive(child.href);
                        const ChildIcon = child.icon;
                        return (
                          <Link
                            key={child.href}
                            href={child.href}
                            className={`flex items-center gap-3 px-4 py-3 text-xs font-space-grotesk uppercase tracking-widest transition-all duration-200 group relative animate-dropdown-item ${
                              active
                                ? 'text-primary-50 bg-primary-50/8'
                                : 'text-neutral-70 hover:text-neutral-100 hover:bg-white/5'
                            }`}
                            style={{ animationDelay: `${idx * 50}ms` }}
                          >
                            <span
                              className={`absolute left-0 top-0 bottom-0 w-0.5 transition-opacity duration-200 ${active ? 'bg-primary-50 opacity-100' : 'bg-white/20 opacity-0 group-hover:opacity-100'}`}
                            />
                            <ChildIcon className="w-3.5 h-3.5 shrink-0" />
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

        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden flex flex-col gap-1.5 cursor-pointer p-1"
          aria-label="Toggle menu"
        >
          <span
            className={`w-6 h-px bg-primary-50 transition-all duration-300 ${isMenuOpen ? 'rotate-45 translate-y-1.5' : ''}`}
          />
          <span
            className={`w-4 h-px bg-secondary-50 transition-all duration-300 ${isMenuOpen ? 'opacity-0 w-6' : ''}`}
          />
          <span
            className={`w-6 h-px bg-tertiary-50 transition-all duration-300 ${isMenuOpen ? '-rotate-45 -translate-y-1.5' : ''}`}
          />
        </button>
      </nav>

      {/* Spacer */}
      <div className="h-16" />

      {/* Mobile Overlay */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-md md:hidden z-40 animate-fade-in"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {/* Mobile Drawer */}
      <div
        className={`fixed top-0 right-0 h-dvh w-80 md:hidden z-50 transition-transform duration-300 ease-in-out flex flex-col ${
          isMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{ background: 'linear-gradient(160deg, #0a1020 0%, #080d1a 60%, #0a0d18 100%)' }}
      >
        {/* Top accent line */}
        <div className="h-px w-full bg-linear-to-r from-transparent via-primary-50 to-transparent" />

        {/* Drawer header */}
        <div className="flex items-center justify-between px-6 py-5">
          <div className="flex flex-col gap-0.5">
            <Link
              href="/"
              onClick={() => setIsMenuOpen(false)}
              className="font-space-grotesk font-bold text-base uppercase tracking-widest"
            >
              <span className="neon-green">ARCH</span>
              <span className="neon-cyan">ITECT</span>
              <span className="neon-purple">VI</span>
            </Link>
            <p className="text-neutral-50 text-xs font-space-grotesk tracking-wider">
              Software Engineer
            </p>
          </div>
          <button
            onClick={() => setIsMenuOpen(false)}
            className="w-8 h-8 flex items-center justify-center rounded-sm border border-white/10 text-neutral-60 hover:text-neutral-100 hover:border-primary-50/50 hover:bg-primary-50/5 transition-all duration-200"
            aria-label="Close menu"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Divider */}
        <div className="mx-6 h-px bg-linear-to-r from-primary-50/30 via-white/10 to-transparent mb-4" />

        {/* Nav links */}
        <div ref={drawerLinksRef} className="flex flex-col gap-1 px-4 flex-1 overflow-y-auto">
          {/* Home */}
          {(() => {
            const homeLink = navItems[0] as SimpleLink;
            const active = isActive(homeLink.href);
            const Icon = homeLink.icon;
            return (
              <Link
                href={homeLink.href}
                onClick={() => setIsMenuOpen(false)}
                className={`relative flex items-center gap-4 px-4 py-3.5 rounded-sm font-space-grotesk text-xs uppercase tracking-widest transition-all duration-200 group overflow-hidden ${
                  active
                    ? 'text-primary-50 bg-primary-50/8'
                    : 'text-neutral-70 hover:text-neutral-100 hover:bg-white/5'
                }`}
              >
                <span
                  className={`absolute left-0 top-0 bottom-0 w-0.5 rounded-r transition-all duration-200 ${active ? 'bg-primary-50' : 'bg-primary-50/0 group-hover:bg-white/20'}`}
                />
                <span
                  className={`flex items-center justify-center w-7 h-7 rounded-sm transition-all duration-200 shrink-0 ${active ? 'bg-primary-50/15 text-primary-50' : 'bg-white/5 text-neutral-60 group-hover:bg-white/8 group-hover:text-neutral-90'}`}
                >
                  <Icon className="w-3.5 h-3.5" />
                </span>
                <span className="flex-1">{homeLink.label}</span>
              </Link>
            );
          })()}

          {/* Collapsible group */}
          <div className="rounded-sm overflow-hidden border border-white/5">
            <button
              onClick={() => setMobileGroupOpen((o) => !o)}
              className={`w-full relative flex items-center gap-4 px-4 py-3.5 font-space-grotesk text-xs uppercase tracking-widest transition-all duration-200 group ${
                isGroupActive(groupItem.children)
                  ? 'text-primary-50 bg-primary-50/8'
                  : 'text-neutral-70 hover:text-neutral-100 hover:bg-white/5'
              }`}
            >
              <span
                className={`flex items-center justify-center w-7 h-7 rounded-sm transition-all duration-200 shrink-0 ${isGroupActive(groupItem.children) ? 'bg-primary-50/15 text-primary-50' : 'bg-white/5 text-neutral-60 group-hover:bg-white/8 group-hover:text-neutral-90'}`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </span>
              <span className="flex-1 text-left">{groupItem.label}</span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-200 ${mobileGroupOpen ? 'rotate-180' : ''}`}
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
                      className={`relative flex items-center gap-4 pl-10 pr-4 py-3 font-space-grotesk text-xs uppercase tracking-widest transition-all duration-200 group ${
                        active
                          ? 'text-primary-50 bg-primary-50/8'
                          : 'text-neutral-60 hover:text-neutral-100 hover:bg-white/5'
                      }`}
                    >
                      <span
                        className={`absolute left-0 top-0 bottom-0 w-0.5 rounded-r transition-all duration-200 ${active ? 'bg-primary-50' : 'opacity-0 group-hover:opacity-100 group-hover:bg-white/20'}`}
                      />
                      <span
                        className={`flex items-center justify-center w-6 h-6 rounded-sm transition-all duration-200 shrink-0 ${active ? 'bg-primary-50/15 text-primary-50' : 'bg-white/5 text-neutral-50 group-hover:bg-white/8 group-hover:text-neutral-90'}`}
                      >
                        <ChildIcon className="w-3 h-3" />
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
                className={`relative flex items-center gap-4 px-4 py-3.5 rounded-sm font-space-grotesk text-xs uppercase tracking-widest transition-all duration-200 group overflow-hidden ${
                  active
                    ? 'text-primary-50 bg-primary-50/8'
                    : 'text-neutral-70 hover:text-neutral-100 hover:bg-white/5'
                }`}
                style={{ animationDelay: `${(i + 2) * 40}ms` }}
              >
                <span
                  className={`absolute left-0 top-0 bottom-0 w-0.5 rounded-r transition-all duration-200 ${active ? 'bg-primary-50' : 'bg-primary-50/0 group-hover:bg-white/20'}`}
                />
                <span
                  className={`flex items-center justify-center w-7 h-7 rounded-sm transition-all duration-200 shrink-0 ${active ? 'bg-primary-50/15 text-primary-50' : 'bg-white/5 text-neutral-60 group-hover:bg-white/8 group-hover:text-neutral-90'}`}
                >
                  <Icon className="w-3.5 h-3.5" />
                </span>
                <span className="flex-1">{link.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Bottom section */}
        <div className="px-6 pb-8 pt-4">
          <div className="h-px bg-linear-to-r from-primary-50/30 via-white/10 to-transparent mb-5" />
          <p className="text-neutral-40 text-xs font-space-grotesk tracking-widest uppercase mb-1">
            Available for work
          </p>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary-50 animate-pulse" />
            <span className="text-primary-50 text-xs font-space-grotesk">
              Open to opportunities
            </span>
          </div>
        </div>

        {/* Bottom accent line */}
        <div className="h-px w-full bg-linear-to-r from-transparent via-secondary-50/40 to-transparent" />
      </div>
    </>
  );
}
