'use client';

import type { CSSProperties } from 'react';
import { CV_DATA } from '@/lib/cv-data';
import { av, ava, ACCENT_CLASSES, type AccentToken } from '@/lib/accent';

export function AboutHero() {
  const sections = CV_DATA.aboutSections;
  const highlights = CV_DATA.highlights;

  return (
    <section className="relative overflow-hidden px-6 py-24 md:px-12 lg:px-20">
      {/* Background */}
      <div className="cyber-grid-dense pointer-events-none absolute inset-0 opacity-25" />
      <div className="pointer-events-none absolute inset-0">
        <div className="bg-primary-50/4 animate-float-slow absolute top-0 right-0 h-96 w-96 rounded-full blur-3xl" />
        <div className="bg-secondary-50/3 animate-float absolute bottom-0 left-1/3 h-80 w-80 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-5xl">
        {/* Header */}
        <div className="animate-slide-right mb-16">
          <p className="section-label mb-3">Who I Am</p>
          <h1 className="font-space-grotesk mb-4 text-5xl font-bold md:text-7xl">
            About <span className="neon-green">Me</span>
          </h1>
          <div className="from-primary-50 via-secondary-50 h-px w-40 bg-linear-to-r to-transparent" />
        </div>

        {/* Content — 2-col grid on desktop: sections left, highlights right */}
        <div className="mb-0 grid gap-6 md:grid-cols-5">
          {/* About sections — 3 col span */}
          <div className="space-y-4 md:col-span-3">
            {sections.map((s, i) => {
              const accent = av(s.accent as AccentToken);
              const accentA = (a: number) => ava(s.accent as AccentToken, a);
              return (
                <div
                  key={i}
                  className="glass card-shine animate-slide-up group overflow-hidden rounded-sm border-(--sb) transition-all duration-500 hover:border-(--sb-h)"
                  style={
                    {
                      '--sb': accentA(0.15),
                      '--sb-h': accentA(0.38),
                      animationDelay: `${i * 100}ms`,
                      animationFillMode: 'both',
                    } as CSSProperties
                  }
                >
                  {/* Top accent */}
                  <div
                    className="h-px"
                    style={{ background: `linear-gradient(to right, ${accent}, transparent)` }}
                  />

                  <div className="relative p-6">
                    {/* Corner wash */}
                    <div
                      className="pointer-events-none absolute top-0 right-0 h-32 w-32 opacity-[0.05] transition-opacity duration-500 group-hover:opacity-[0.12]"
                      style={{
                        background: `radial-gradient(circle at top right, ${accent}, transparent 65%)`,
                      }}
                    />
                    <h2
                      className="font-space-grotesk relative z-10 mb-3 text-lg font-bold"
                      style={{ color: accent }}
                    >
                      {s.title}
                    </h2>
                    <p className="text-neutral-70 relative z-10 text-sm leading-relaxed">
                      {s.body}
                    </p>
                  </div>

                  {/* Bottom sweep */}
                  <div
                    className="h-px w-0 transition-all duration-700 group-hover:w-full"
                    style={{ background: `linear-gradient(to right, ${accent}, transparent)` }}
                  />
                </div>
              );
            })}
          </div>

          {/* Highlights — 2 col span, stacked vertically */}
          <div className="flex flex-col gap-4 md:col-span-2">
            {highlights.map((h, i) => {
              const ac = ACCENT_CLASSES[h.accent as AccentToken] ?? ACCENT_CLASSES['primary'];
              const accent = av(h.accent as AccentToken);
              const accentA = (a: number) => ava(h.accent as AccentToken, a);
              return (
                <div
                  key={i}
                  className="glass card-shine animate-scale-in group relative flex-1 overflow-hidden rounded-sm border-(--hb) transition-all duration-500 hover:border-(--hb-h)"
                  style={
                    {
                      '--hb': accentA(0.15),
                      '--hb-h': accentA(0.42),
                      animationDelay: `${300 + i * 100}ms`,
                      animationFillMode: 'both',
                    } as CSSProperties
                  }
                >
                  {/* Holographic hover */}
                  <div className="holographic pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                  {/* Top accent */}
                  <div
                    className="h-px"
                    style={{ background: `linear-gradient(to right, ${accent}, transparent)` }}
                  />

                  <div className="relative z-10 flex h-full flex-col p-6">
                    <div
                      className="mb-4 flex h-10 w-10 items-center justify-center rounded-sm border text-xl transition-all duration-300 group-hover:scale-110"
                      style={{ borderColor: accentA(0.28), background: accentA(0.07) }}
                    >
                      {h.icon}
                    </div>
                    <h3 className={`font-space-grotesk mb-2 text-base font-bold ${ac.text}`}>
                      {h.title}
                    </h3>
                    <p className="text-neutral-60 mt-auto text-sm leading-relaxed">{h.desc}</p>
                  </div>

                  {/* Bottom sweep */}
                  <div
                    className="absolute bottom-0 left-0 h-px w-0 transition-all duration-700 group-hover:w-full"
                    style={{ background: `linear-gradient(to right, ${accent}, transparent)` }}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
