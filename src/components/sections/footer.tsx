'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Download } from 'lucide-react';
import { SocialIcon, type SocialIconType } from '@/components/reusable/social-icon';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const } },
};

export function Footer() {
  const socialLinks = [
    {
      label: 'GitHub',
      href: 'https://github.com/saniuzzaman-robin',
      icon: 'github' as SocialIconType,
    },
    {
      label: 'LinkedIn',
      href: 'https://linkedin.com/in/saniuzzaman-robin',
      icon: 'linkedin' as SocialIconType,
    },
    {
      label: 'Email',
      href: 'mailto:saniuzzamanrobin07@gmail.com',
      icon: 'email' as SocialIconType,
    },
  ];

  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'About', href: '/about' },
    { label: 'Projects', href: '/projects' },
    { label: 'Skills', href: '/skills' },
    { label: 'Blog', href: '/blog' },
    { label: 'Resume', href: '/resume' },
  ];

  return (
    <footer className="border-midnight-200 relative overflow-hidden border-t px-6 pt-16 pb-8 md:px-12 lg:px-20">
      {/* Subtle aurora gradient */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="aurora-blob aurora-blob-primary absolute -bottom-32 -left-32 h-75 w-75 opacity-10" />
        <div
          className="aurora-blob aurora-blob-secondary absolute -right-32 -bottom-32 h-62.5 w-62.5 opacity-10"
          style={{ animationDelay: '-7s' }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="border-midnight-200 mb-12 grid gap-12 border-b pb-12 md:grid-cols-3"
        >
          {/* Brand */}
          <div>
            <p className="text-midnight-500 mb-6 max-w-xs text-sm leading-relaxed">
              Full-stack software engineer crafting scalable applications with NestJS, Next.js &amp;
              Angular. Open to opportunities worldwide.
            </p>
            <a
              href="/CV_SANIUZZAMAN_ROBIN.pdf"
              download
              className="btn-primary inline-flex items-center gap-2 text-sm"
            >
              <Download className="h-4 w-4" />
              Download CV
            </a>
          </div>

          {/* Navigation */}
          <div>
            <p className="section-label mb-4">Navigation</p>
            <div className="grid grid-cols-2 gap-2">
              {navLinks.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="group text-midnight-500 hover:text-aurora-green flex items-center gap-2 text-sm transition-colors duration-200"
                >
                  <span className="text-aurora-green opacity-0 transition-opacity group-hover:opacity-100">
                    &rarr;
                  </span>
                  {l.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Connect */}
          <div>
            <p className="section-label mb-4">Connect</p>
            <div className="space-y-3">
              {socialLinks.map((l) => (
                <Link
                  key={l.label}
                  href={l.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group text-midnight-500 hover:text-aurora-green flex items-center gap-3 transition-colors duration-200"
                >
                  <SocialIcon
                    icon={l.icon}
                    className="h-4 w-4 transition-transform group-hover:scale-110"
                  />
                  <span className="text-sm font-medium">{l.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Bottom bar */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="text-midnight-500 text-sm">
            &copy; {new Date().getFullYear()} Md. Saniuzzaman Robin
          </p>
          <p className="text-midnight-500 text-sm">
            Built with <span className="text-aurora-green">Next.js</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
