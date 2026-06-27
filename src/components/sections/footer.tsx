'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Download } from 'lucide-react';
import { SocialIcon, type SocialIconType } from '../reusable/social-icon';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const } },
};

export function Footer() {
  const links = [
    { label: 'GitHub', href: 'https://github.com/saniuzzaman-robin', icon: 'github' as SocialIconType, ariaLabel: 'GitHub profile' },
    { label: 'LinkedIn', href: 'https://linkedin.com/in/saniuzzaman-robin', icon: 'linkedin' as SocialIconType, ariaLabel: 'LinkedIn profile' },
    { label: 'Email', href: 'mailto:saniuzzamanrobin07@gmail.com', icon: 'email' as SocialIconType, ariaLabel: 'Send email' },
  ];

  const navLinks = [
    { label: 'Home', href: '/' }, { label: 'About', href: '/about' },
    { label: 'Projects', href: '/projects' }, { label: 'Tools', href: '/tools' },
    { label: 'Skills', href: '/skills' }, { label: 'Blog', href: '/blog' },
    { label: 'Resume', href: '/resume' }, { label: 'Games', href: '/games' },
  ];

  return (
    <footer className="relative overflow-hidden border-t border-white/5 px-6 pt-14 pb-6 md:px-12 lg:px-16">
      <div className="via-primary-50/30 absolute top-0 right-0 left-0 h-px bg-linear-to-r from-transparent to-transparent" />
      <div className="cyber-grid-dense pointer-events-none absolute inset-0 opacity-15" />

      <div className="relative z-10 mx-auto max-w-6xl">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mb-10 grid gap-10 border-b border-white/5 pb-10 md:grid-cols-3"
        >
          {/* Brand */}
          <div>
            <div className="font-poppins mb-3 text-xl font-bold tracking-widest uppercase">
              <span className="text-primary-50">SANIUZZAMAN</span>
              <span className="text-secondary-50">.</span>
              <span className="text-neutral-60">dev</span>
            </div>
            <p className="text-neutral-60 mb-5 max-w-xs text-xs leading-relaxed">
              Full-stack software engineer crafting scalable applications with NestJS, Next.js &amp;
              Angular. Open to opportunities worldwide.
            </p>
            <a
              href="/CV_SANIUZZAMAN_ROBIN.pdf"
              download
              className="btn-neon font-poppins inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold tracking-widest uppercase"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Download CV</span>
            </a>
          </div>

          {/* Navigation */}
          <div>
            <p className="section-label mb-4">Navigation</p>
            <div className="grid grid-cols-2 gap-1.5">
              {navLinks.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="text-neutral-60 hover:text-primary-50 font-poppins group flex items-center gap-1 text-xs tracking-wider uppercase transition-colors duration-200"
                >
                  <span className="text-primary-50/0 group-hover:text-primary-50/60 transition-colors">&gt;</span>
                  {l.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Connect */}
          <div>
            <p className="section-label mb-4">Connect</p>
            <div className="space-y-2.5">
              {links.map((l) => (
                <Link
                  key={l.label}
                  href={l.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={l.ariaLabel}
                  className="text-neutral-60 hover:text-primary-50 group flex items-center gap-3 transition-colors duration-200"
                >
                  <SocialIcon icon={l.icon} className="group-hover:text-primary-50 h-4 w-4 transition-all" />
                  <span className="font-poppins text-xs tracking-wider uppercase">{l.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </motion.div>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="text-neutral-50 font-poppins text-xs">
            &copy; {new Date().getFullYear()} Md. Saniuzzaman Robin
          </p>
          <p className="text-neutral-50 font-poppins text-xs">
            Built with <span className="text-primary-50">Next.js</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
