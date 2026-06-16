import type { Metadata } from 'next';
import { Navigation } from '@/components/sections/navigation';
import { Footer } from '@/components/sections/footer';
import { ToolsGrid } from '@/components/sections/tools-grid';
import { Wrench, Zap, Shield, Laptop } from 'lucide-react';
import { DEV_TOOLS } from '@/lib/data/tools';

export const metadata: Metadata = {
  title: 'Developer Tools | Saniuzzaman Robin',
  description:
    'Free in-browser developer utilities — Base64, UUID generator, JSON formatter & diff, Minifier, JWT decoder, URL encoder, Hash generator, Timestamp converter, Regex tester, Color converter, SQL formatter, HTML entities, Diff viewer, Lorem ipsum, Cron builder, Text transform, Image to Base64, YAML/JSON converter, and more. All generated locally.',
  alternates: { canonical: 'https://saniuzzaman.dev/tools' },
  openGraph: {
    type: 'website',
    url: 'https://saniuzzaman.dev/tools',
    title: 'Dev Tools | Saniuzzaman Robin',
    description:
      '23+ free in-browser developer utilities with search & filtering, generated locally with no external dependencies.',
    siteName: 'Saniuzzaman Robin Portfolio',
    images: [{ url: 'https://saniuzzaman.dev/og_image.png', width: 1200, height: 630 }],
  },
};

export default function ToolsPage() {
  const toolCount = DEV_TOOLS.length;
  const totalTags = new Set(DEV_TOOLS.flatMap((t) => t.tags)).size;

  return (
    <>
      <main className="bg-neutral-5 text-neutral-90 min-h-screen">
        <Navigation />

        {/* Enhanced Hero */}
        <section className="relative overflow-hidden px-6 pt-24 pb-20 md:px-12 lg:px-20">
          {/* Background effects */}
          <div className="cyber-grid-dense pointer-events-none absolute inset-0 opacity-20" />
          <div className="bg-primary-50/4 pointer-events-none absolute top-0 left-1/2 h-64 w-96 -translate-x-1/2 rounded-full blur-3xl" />
          <div className="bg-secondary-50/3 pointer-events-none absolute top-20 right-0 h-48 w-48 rounded-full blur-3xl" />
          <div className="bg-tertiary-50/3 pointer-events-none absolute bottom-0 left-0 h-48 w-48 rounded-full blur-3xl" />

          <div className="relative z-10 mx-auto max-w-6xl">
            {/* Label */}
            <div className="animate-slide-down mb-4 flex items-center gap-3">
              <Wrench className="text-primary-50 h-5 w-5" />
              <p className="section-label">Developer Utilities</p>
            </div>

            {/* Title */}
            <h1 className="font-poppins animate-slide-up mb-6 text-5xl font-bold [animation-delay:80ms] md:text-7xl lg:text-8xl">
              <span className="neon-green">DEV</span> <span className="neon-cyan">TOOLS</span>
            </h1>

            {/* Description */}
            <p className="text-neutral-70 animate-slide-up mb-10 max-w-2xl text-base leading-relaxed [animation-delay:150ms] md:text-lg">
              {toolCount} essential utilities that run entirely in your browser — no installs, no
              external APIs, no telemetry. All tools work{' '}
              <span className="neon-green font-semibold">100% locally</span> with instant results.
            </p>

            {/* Feature pills */}
            <div className="animate-slide-up mb-12 flex flex-wrap gap-3 [animation-delay:200ms]">
              <div className="glass flex items-center gap-2 rounded-full border border-white/8 px-4 py-2">
                <Zap className="text-primary-50 h-4 w-4" />
                <span className="text-neutral-90 text-sm font-medium">Instant Processing</span>
              </div>
              <div className="glass flex items-center gap-2 rounded-full border border-white/8 px-4 py-2">
                <Shield className="text-secondary-50 h-4 w-4" />
                <span className="text-neutral-90 text-sm font-medium">100% Private</span>
              </div>
              <div className="glass flex items-center gap-2 rounded-full border border-white/8 px-4 py-2">
                <Laptop className="text-tertiary-50 h-4 w-4" />
                <span className="text-neutral-90 text-sm font-medium">Works Offline</span>
              </div>
            </div>

            {/* Stats grid */}
            <div className="animate-slide-up grid grid-cols-2 gap-4 [animation-delay:250ms] sm:grid-cols-4">
              <div className="glass rounded-sm border border-white/8 p-5">
                <div className="font-poppins text-primary-50 mb-1 text-3xl font-black">
                  {toolCount}
                </div>
                <div className="text-neutral-60 text-xs font-medium tracking-wider uppercase">
                  Tools
                </div>
              </div>
              <div className="glass rounded-sm border border-white/8 p-5">
                <div className="font-poppins text-secondary-50 mb-1 text-3xl font-black">
                  {totalTags}
                </div>
                <div className="text-neutral-60 text-xs font-medium tracking-wider uppercase">
                  Categories
                </div>
              </div>
              <div className="glass rounded-sm border border-white/8 p-5">
                <div className="font-poppins text-tertiary-50 mb-1 text-3xl font-black">0ms</div>
                <div className="text-neutral-60 text-xs font-medium tracking-wider uppercase">
                  Server Calls
                </div>
              </div>
              <div className="glass rounded-sm border border-white/8 p-5">
                <div className="font-poppins text-primary-50 mb-1 text-3xl font-black">∞</div>
                <div className="text-neutral-60 text-xs font-medium tracking-wider uppercase">
                  Free Forever
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Tools grid */}
        <section className="px-6 pb-24 md:px-12 lg:px-20">
          <div className="mx-auto max-w-6xl">
            <ToolsGrid />
          </div>
        </section>

        <Footer />
      </main>
    </>
  );
}
