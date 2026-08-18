'use client';

import Link from 'next/link';
import { ArrowUpRight, Mail, MapPin } from 'lucide-react';
import { SocialIcon } from '@/components/reusable/social-icon';
import { CV_DATA } from '@/lib/cv-data';

export function FooterColophon() {
  return (
    <footer className="border-t border-(--border-subtle) bg-(--surface-1) px-6 py-8 md:px-12 md:py-12 lg:px-20">
      <div className="mx-auto max-w-5xl">
        <div className="grid gap-6 border-b border-(--border-subtle) pb-6 sm:grid-cols-2 md:grid-cols-12 md:pb-8">
          {/* Brand Colophon (6 cols) */}
          <div className="space-y-2.5 md:col-span-6">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-indigo-600 font-mono text-xs font-bold text-white shadow-xs">
                SR
              </div>
              <span className="font-heading text-sm font-bold text-(--text-main)">
                {CV_DATA.name}
              </span>
            </div>
            <p className="max-w-sm text-xs leading-relaxed text-(--text-secondary)">
              Software Engineer with 5+ years of experience architecting distributed backend
              microservices and high-concurrency frontend platforms.
            </p>
            <div className="flex items-center gap-1.5 font-mono text-[11px] text-(--text-muted)">
              <MapPin className="h-3 w-3 text-indigo-500" />
              <span>{CV_DATA.location}</span>
            </div>
          </div>

          {/* Directory & Connect Side-by-Side on Mobile (6 cols total on desktop) */}
          <div className="grid grid-cols-2 gap-4 md:col-span-6">
            {/* Directory (3 cols) */}
            <div className="space-y-2">
              <p className="font-mono text-[10px] font-bold tracking-wider text-(--text-muted) uppercase">
                Directory
              </p>
              <div className="space-y-1.5 text-xs text-(--text-secondary)">
                <div>
                  <Link href="/" className="transition-colors hover:text-indigo-500">
                    Overview
                  </Link>
                </div>
                <div>
                  <Link href="/resume" className="transition-colors hover:text-indigo-500">
                    Experience
                  </Link>
                </div>
                <div>
                  <Link href="/projects" className="transition-colors hover:text-indigo-500">
                    Platforms
                  </Link>
                </div>
              </div>
            </div>

            {/* Connect (3 cols) */}
            <div className="space-y-2">
              <p className="font-mono text-[10px] font-bold tracking-wider text-(--text-muted) uppercase">
                Connect
              </p>
              <div className="space-y-1.5 text-xs">
                <a
                  href={CV_DATA.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-(--text-secondary) transition-colors hover:text-indigo-500"
                >
                  <SocialIcon icon="github" className="h-3.5 w-3.5" />
                  <span>GitHub</span>
                  <ArrowUpRight className="h-3 w-3 opacity-50" />
                </a>

                <a
                  href={CV_DATA.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-(--text-secondary) transition-colors hover:text-indigo-500"
                >
                  <SocialIcon icon="linkedin" className="h-3.5 w-3.5" />
                  <span>LinkedIn</span>
                  <ArrowUpRight className="h-3 w-3 opacity-50" />
                </a>

                <a
                  href={`mailto:${CV_DATA.email}`}
                  className="flex items-center gap-1.5 text-(--text-secondary) transition-colors hover:text-indigo-500"
                >
                  <Mail className="h-3.5 w-3.5" />
                  <span>Email</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col items-center justify-between gap-2 pt-4 text-center font-mono text-[11px] text-(--text-muted) sm:flex-row sm:text-left">
          <p>&copy; {new Date().getFullYear()} Md. Saniuzzaman Robin</p>
          <p>Built with Next.js &amp; Tailwind CSS</p>
        </div>
      </div>
    </footer>
  );
}
