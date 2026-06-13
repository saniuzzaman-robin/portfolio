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
    { label: 'Tools', href: '/tools' },
    { label: 'Skills', href: '/skills' },
    { label: 'Blog', href: '/blog' },
    { label: 'Resume', href: '/resume' },
    { label: 'Games', href: '/games' },
  ];

  return (
    <footer className="relative overflow-hidden border-t border-white/5 px-6 pt-16 pb-8 md:px-12 lg:px-20">
      {/* Top gradient line */}
      <div className="via-primary-50/40 absolute top-0 right-0 left-0 h-px bg-linear-to-r from-transparent to-transparent" />

      {/* Background */}
      <div className="cyber-grid-dense pointer-events-none absolute inset-0 opacity-20" />

      <div className="relative z-10 mx-auto max-w-6xl">
        {/* Top row */}
        <div className="mb-12 grid gap-12 border-b border-white/5 pb-12 md:grid-cols-3">
          {/* Brand */}
          <div>
            <div className="font-space-grotesk mb-3 text-xl font-bold">
              <span className="neon-green">ARCH</span>
              <span className="neon-cyan">ITECT</span>
              <span className="neon-purple">VI</span>
            </div>
            <p className="text-neutral-70 mb-6 max-w-xs text-xs leading-relaxed">
              Full-stack software engineer crafting scalable applications with NestJS, Next.js &
              Angular. Open to opportunities worldwide.
            </p>
            <a
              href="/CV_SANIUZZAMAN_ROBIN.pdf"
              download
              className="btn-neon-green font-space-grotesk inline-flex items-center gap-2 rounded-sm px-5 py-2.5 text-xs font-bold tracking-widest uppercase"
            >
              <Download className="h-3.5 w-3.5" />
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
                  className="text-neutral-60 hover:text-primary-50 font-space-grotesk group flex items-center gap-1 text-xs tracking-wider uppercase transition-colors duration-200"
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
            <div className="mb-6 space-y-3">
              {links.map((l) => (
                <Link
                  key={l.label}
                  href={l.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={l.ariaLabel}
                  className="text-neutral-60 hover:text-primary-50 group flex items-center gap-3 transition-colors duration-200"
                >
                  <SocialIcon
                    icon={l.icon}
                    className="group-hover:neon-green h-4 w-4 transition-all"
                  />
                  <span className="font-space-grotesk text-xs tracking-wider uppercase">
                    {l.label}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom row */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="text-neutral-60 font-space-grotesk text-xs">
            © {new Date().getFullYear()} Md. Saniuzzaman Robin
          </p>
          <p className="text-neutral-60 font-space-grotesk text-xs">
            Built with <span className="neon-green">GitHub Copilot</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
