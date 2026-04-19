'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

export function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'About', href: '/about' },
    { label: 'Projects', href: '/projects' },
    { label: 'Skills', href: '/skills' },
    { label: 'Blog', href: '/blog' },
    { label: 'Resume', href: '/resume' },
  ];

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  const getLinkClass = (href: string) => {
    const baseClass = 'text-xs uppercase tracking-wider transition hover:scale-110 duration-300';
    const isCurrentActive = isActive(href);
    if (isCurrentActive) {
      return `${baseClass} text-primary-50 font-space-grotesk font-bold border-b-2 border-primary-50`;
    }
    return `${baseClass} text-neutral-70 hover:text-primary-50`;
  };

  return (
    <>
      <nav className="flex items-center justify-between px-6 py-6 md:px-12 lg:px-20 border-b border-neutral-20 animate-fade-in">
        <Link
          href="/"
          className="font-space-grotesk font-bold text-lg text-primary-50 uppercase tracking-wide animate-slide-right hover:text-primary-60 transition"
        >
          ARCHITECTVI
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex gap-8">
          {navLinks.map((link, index) => (
            <Link key={index} href={link.href} className={getLinkClass(link.href)}>
              {link.label}
            </Link>
          ))}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden flex flex-col gap-1.5 cursor-pointer"
          aria-label="Toggle menu"
        >
          <span
            className={`w-6 h-0.5 bg-primary-50 transition-all duration-300 ${
              isMenuOpen ? 'rotate-45 translate-y-2' : ''
            }`}
          ></span>
          <span
            className={`w-6 h-0.5 bg-primary-50 transition-all duration-300 ${
              isMenuOpen ? 'opacity-0' : ''
            }`}
          ></span>
          <span
            className={`w-6 h-0.5 bg-primary-50 transition-all duration-300 ${
              isMenuOpen ? '-rotate-45 -translate-y-2' : ''
            }`}
          ></span>
        </button>
      </nav>

      {/* Mobile Drawer Background Overlay */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-black/40 md:hidden z-30 animate-fade-in"
          onClick={() => setIsMenuOpen(false)}
        ></div>
      )}

      {/* Mobile Drawer */}
      <div
        className={`fixed top-0 right-0 h-screen w-64 bg-neutral-5 border-l border-neutral-20 md:hidden z-40 transition-transform duration-300 animate-slide-left ${
          isMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col gap-1 pt-20 px-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsMenuOpen(false)}
              className={`px-4 py-3 rounded-lg transition duration-300 ${
                isActive(link.href)
                  ? 'bg-primary-50 text-white font-space-grotesk font-bold'
                  : 'text-neutral-70 hover:bg-neutral-10 hover:text-primary-50'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
