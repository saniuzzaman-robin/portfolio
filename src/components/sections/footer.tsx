'use client';

import Link from 'next/link';
import { Download } from 'lucide-react';
import { SocialIcon, type SocialIconType } from '../reusable/social-icon';

export function Footer() {
  const links = [
    {
      label: 'GitHub',
      href: 'https://github.com/saniuzzaman-robin',
      icon: 'github' as SocialIconType,
      ariaLabel: 'GitHub profile',
    },
    {
      label: 'LinkedIn',
      href: 'https://linkedin.com/in/saniuzzaman-robin',
      icon: 'linkedin' as SocialIconType,
      ariaLabel: 'LinkedIn profile',
    },
    {
      label: 'Email',
      href: 'mailto:saniuzzamanrobin07@gmail.com',
      icon: 'email' as SocialIconType,
      ariaLabel: 'Send email',
    },
  ];

  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'About', href: '/about' },
    { label: 'Projects', href: '/projects' },
    { label: 'Skills', href: '/skills' },
    { label: 'Blog', href: '/blog' },
    { label: 'Resume', href: '/resume' },
    { label: 'Games', href: '/games' },
  ];

  return (
    <footer className="relative px-6 pt-16 pb-8 md:px-12 lg:px-20 border-t border-white/5 overflow-hidden">
      {/* Top gradient line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-primary-50/40 to-transparent" />

      {/* Background */}
      <div className="absolute inset-0 cyber-grid-dense opacity-20 pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Top row */}
        <div className="grid md:grid-cols-3 gap-12 mb-12 pb-12 border-b border-white/5">
          {/* Brand */}
          <div>
            <div className="font-space-grotesk font-bold text-xl mb-3">
              <span className="neon-green">ARCH</span>
              <span className="neon-cyan">ITECT</span>
              <span className="neon-purple">VI</span>
            </div>
            <p className="text-neutral-70 text-xs leading-relaxed mb-6 max-w-xs">
              Full-stack software engineer crafting scalable applications with NestJS, Next.js &
              Angular. Open to opportunities worldwide.
            </p>
            <a
              href="/CV_SANIUZZAMAN_ROBIN.pdf"
              download
              className="inline-flex items-center gap-2 btn-neon-green px-5 py-2.5 rounded-sm font-space-grotesk font-bold text-xs uppercase tracking-widest"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download CV</span>
            </a>
          </div>

          {/* Quick links */}
          <div>
            <p className="section-label mb-5">Navigation</p>
            <div className="grid grid-cols-2 gap-2">
              {navLinks.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="text-neutral-60 hover:text-primary-50 text-xs uppercase tracking-wider font-space-grotesk transition-colors duration-200 flex items-center gap-1 group"
                >
                  <span className="text-primary-50/0 group-hover:text-primary-50/60 transition-colors">
                    &gt;
                  </span>
                  {l.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <p className="section-label mb-5">Connect</p>
            <div className="space-y-3 mb-6">
              {links.map((l) => (
                <Link
                  key={l.label}
                  href={l.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={l.ariaLabel}
                  className="flex items-center gap-3 text-neutral-60 hover:text-primary-50 transition-colors duration-200 group"
                >
                  <SocialIcon
                    icon={l.icon}
                    className="w-4 h-4 group-hover:neon-green transition-all"
                  />
                  <span className="text-xs font-space-grotesk uppercase tracking-wider">
                    {l.label}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom row */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <p className="text-neutral-60 text-xs font-space-grotesk">© 2026 Md. Saniuzzaman Robin</p>
          <p className="text-neutral-60 text-xs font-space-grotesk">
            Built with <span className="neon-green">GitHub Copilot</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
