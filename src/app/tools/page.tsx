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
        <section className="px-6 pt-24 pb-16 md:px-12 lg:px-20 relative overflow-hidden">
          <div className="absolute inset-0 cyber-grid-dense opacity-20 pointer-events-none" />
          <div className="absolute top-0 left-1/2 w-96 h-64 bg-primary-50/4 -translate-x-1/2 rounded-full blur-3xl pointer-events-none" />
          <div className="max-w-6xl mx-auto relative z-10">
            <div className="flex items-center gap-3 mb-4 animate-slide-down">
              <Wrench className="w-5 h-5 text-primary-50" />
              <p className="section-label">Developer Utilities</p>
            </div>
            <h1 className="font-space-grotesk font-bold text-5xl md:text-7xl mb-5 animate-slide-up [animation-delay:80ms]">
              <span className="neon-green">DEV</span> <span className="neon-cyan">TOOLS</span>
            </h1>
            <p className="text-neutral-70 text-base max-w-xl leading-relaxed animate-slide-up [animation-delay:150ms]">
              10 essential utilities that run entirely in your browser — no installs, no telemetry,
              no fuss. Everything a developer reaches for daily.
            </p>
          </div>
        </section>

        {/* Tools grid */}
        <section className="px-6 pb-24 md:px-12 lg:px-20">
          <div className="max-w-6xl mx-auto">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {DEV_TOOLS.map((tool, index) => {
                const Icon = tool.icon;
                const accent = av(tool.accent);
                const accentA = (a: number) => ava(tool.accent, a);
                return (
                  <Link key={tool.id} href={tool.href} className="group block">
                    <div
                      className="relative glass card-shine rounded-sm border-(--tb) hover:border-(--tb-h) hover:shadow-(--ts) transition-all duration-400 overflow-hidden animate-scale-in hover:scale-[1.02] h-full flex"
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
                        className="w-0.5 shrink-0 group-hover:w-1 transition-all duration-300"
                        style={{
                          background: `linear-gradient(to bottom, ${accent}, ${accentA(0.2)})`,
                        }}
                      />

                      <div className="flex-1 p-5 flex flex-col relative overflow-hidden">
                        {/* Holographic hover */}
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 holographic pointer-events-none" />

                        {/* Icon */}
                        <div
                          className="w-9 h-9 rounded-sm flex items-center justify-center border mb-4 transition-all duration-300 group-hover:scale-110 relative z-10"
                          style={{
                            borderColor: accentA(0.3),
                            background: accentA(0.08),
                            color: accent,
                          }}
                        >
                          <Icon className="w-4 h-4" strokeWidth={1.5} />
                        </div>

                        {/* Title */}
                        <h2 className="font-space-grotesk font-bold text-base text-neutral-90 group-hover:text-neutral-100 transition-colors relative z-10 mb-0.5">
                          {tool.title}
                        </h2>
                        <p
                          className="text-[10px] font-space-grotesk font-bold uppercase tracking-widest mb-3 relative z-10"
                          style={{ color: accent }}
                        >
                          {tool.subtitle}
                        </p>
                        <p className="text-neutral-60 text-xs leading-relaxed relative z-10 flex-1">
                          {tool.description}
                        </p>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-1.5 mt-4 relative z-10">
                          {tool.tags.map((tag) => (
                            <span
                              key={tag}
                              className="text-[9px] px-1.5 py-0.5 rounded-sm font-space-grotesk font-bold uppercase tracking-wide"
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
                        className="absolute bottom-0 left-0 h-px w-0 group-hover:w-full transition-all duration-700"
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
