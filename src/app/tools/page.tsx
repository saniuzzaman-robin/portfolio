import type { Metadata } from 'next';
import Link from 'next/link';
import type { CSSProperties } from 'react';
import { Navigation } from '@/components/sections/navigation';
import { Footer } from '@/components/sections/footer';
import { DEV_TOOLS } from '@/lib/data/tools';
import { av, ava } from '@/lib/accent';
import { Wrench } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Developer Tools | Saniuzzaman Robin',
  description:
    'Free in-browser developer utilities — Base64, UUID generator, JSON formatter & diff, Minifier, JWT decoder, URL encoder, Hash generator, Timestamp converter, Regex tester, Color converter.',
  alternates: { canonical: 'https://saniuzzaman.dev/tools' },
  openGraph: {
    type: 'website',
    url: 'https://saniuzzaman.dev/tools',
    title: 'Dev Tools | Saniuzzaman Robin',
    description: '10+ free in-browser developer utilities, no installs needed.',
    siteName: 'Saniuzzaman Robin Portfolio',
    images: [{ url: 'https://saniuzzaman.dev/og_image.png', width: 1200, height: 630 }],
  },
};

export default function ToolsPage() {
  return (
    <>
      <main className="bg-neutral-5 text-neutral-90 min-h-screen">
        <Navigation />

        {/* Hero */}
        <section className="relative overflow-hidden px-6 pt-24 pb-16 md:px-12 lg:px-20">
          <div className="cyber-grid-dense pointer-events-none absolute inset-0 opacity-20" />
          <div className="bg-primary-50/4 pointer-events-none absolute top-0 left-1/2 h-64 w-96 -translate-x-1/2 rounded-full blur-3xl" />
          <div className="relative z-10 mx-auto max-w-6xl">
            <div className="animate-slide-down mb-4 flex items-center gap-3">
              <Wrench className="text-primary-50 h-5 w-5" />
              <p className="section-label">Developer Utilities</p>
            </div>
            <h1 className="font-space-grotesk animate-slide-up mb-5 text-5xl font-bold [animation-delay:80ms] md:text-7xl">
              <span className="neon-green">DEV</span> <span className="neon-cyan">TOOLS</span>
            </h1>
            <p className="text-neutral-70 animate-slide-up max-w-xl text-base leading-relaxed [animation-delay:150ms]">
              10 essential utilities that run entirely in your browser — no installs, no telemetry,
              no fuss. Everything a developer reaches for daily.
            </p>
          </div>
        </section>

        {/* Tools grid */}
        <section className="px-6 pb-24 md:px-12 lg:px-20">
          <div className="mx-auto max-w-6xl">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {DEV_TOOLS.map((tool, index) => {
                const Icon = tool.icon;
                const accent = av(tool.accent);
                const accentA = (a: number) => ava(tool.accent, a);
                return (
                  <Link key={tool.id} href={tool.href} className="group block">
                    <div
                      className="glass card-shine animate-scale-in relative flex h-full overflow-hidden rounded-sm border-(--tb) transition-all duration-400 hover:scale-[1.02] hover:border-(--tb-h) hover:shadow-(--ts)"
                      style={
                        {
                          '--tb': accentA(0.16),
                          '--tb-h': accentA(0.44),
                          '--ts': `0 0 20px ${accentA(0.12)}`,
                          animationDelay: `${index * 50}ms`,
                          animationFillMode: 'both',
                        } as CSSProperties
                      }
                    >
                      {/* Left bookmark bar */}
                      <div
                        className="w-0.5 shrink-0 transition-all duration-300 group-hover:w-1"
                        style={{
                          background: `linear-gradient(to bottom, ${accent}, ${accentA(0.2)})`,
                        }}
                      />

                      <div className="relative flex flex-1 flex-col overflow-hidden p-5">
                        {/* Holographic hover */}
                        <div className="holographic pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                        {/* Icon */}
                        <div
                          className="relative z-10 mb-4 flex h-9 w-9 items-center justify-center rounded-sm border transition-all duration-300 group-hover:scale-110"
                          style={{
                            borderColor: accentA(0.3),
                            background: accentA(0.08),
                            color: accent,
                          }}
                        >
                          <Icon className="h-4 w-4" strokeWidth={1.5} />
                        </div>

                        {/* Title */}
                        <h2 className="font-space-grotesk text-neutral-90 relative z-10 mb-0.5 text-base font-bold transition-colors group-hover:text-neutral-100">
                          {tool.title}
                        </h2>
                        <p
                          className="font-space-grotesk relative z-10 mb-3 text-[10px] font-bold tracking-widest uppercase"
                          style={{ color: accent }}
                        >
                          {tool.subtitle}
                        </p>
                        <p className="text-neutral-60 relative z-10 flex-1 text-xs leading-relaxed lg:text-sm">
                          {tool.description}
                        </p>

                        {/* Tags */}
                        <div className="relative z-10 mt-4 flex flex-wrap gap-1.5">
                          {tool.tags.map((tag) => (
                            <span
                              key={tag}
                              className="font-space-grotesk rounded-sm px-1.5 py-0.5 text-[9px] font-bold tracking-wide uppercase"
                              style={{
                                color: accent,
                                background: accentA(0.07),
                                border: `1px solid ${accentA(0.18)}`,
                              }}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Bottom sweep */}
                      <div
                        className="absolute bottom-0 left-0 h-px w-0 transition-all duration-700 group-hover:w-full"
                        style={{ background: `linear-gradient(to right, ${accent}, transparent)` }}
                      />
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        <Footer />
      </main>
    </>
  );
}
