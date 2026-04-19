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

  return (
    <footer className="px-6 py-16 md:px-12 lg:px-20 border-t border-neutral-20 animate-slide-up">
      <div className="max-w-6xl mx-auto">
        {/* Download Resume CTA */}
        <div className="mb-12 text-center pb-8 border-b border-neutral-20">
          <p className="text-neutral-70 text-xs uppercase tracking-wider mb-4 font-space-grotesk">
            Get my full CV
          </p>
          <a
            href="/CV_SANIUZZAMAN_ROBIN.pdf"
            download
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary-50 text-white font-space-grotesk font-bold rounded-lg hover:bg-primary-60 transition duration-300 hover:scale-105 hover:shadow-lg hover:shadow-primary-50/50 hover:-translate-y-1 will-change-transform"
          >
            <Download className="w-5 h-5" strokeWidth={2} />
            <span>Download Resume (PDF)</span>
          </a>
        </div>

        {/* Social Links */}
        <div className="flex justify-center gap-8 mb-8 flex-wrap">
          {links.map((link, index) => (
            <Link
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={link.ariaLabel}
              className="text-primary-50 hover:text-primary-60 transition hover:scale-125 duration-300 animate-fade-in will-change-transform"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <SocialIcon icon={link.icon} className="w-6 h-6" />
            </Link>
          ))}
        </div>

        {/* Copyright */}
        <p className="text-neutral-60 text-xs text-center animate-fade-in [animation-delay:400ms]">
          © 2026 Md. Saniuzzaman Robin. Built with Next.js & Tailwind CSS.
        </p>
      </div>
    </footer>
  );
}
