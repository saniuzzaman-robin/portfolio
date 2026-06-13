'use client';

import type { CSSProperties } from 'react';
import { CV_DATA } from '@/lib/cv-data';
import { av, ava, ACCENT_CLASSES, type AccentToken } from '@/lib/accent';

export function AboutHero() {
  const sections = CV_DATA.aboutSections;
  const highlights = CV_DATA.highlights;

  return (
    <section className="px-6 py-24 md:px-12 lg:px-20 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 cyber-grid-dense opacity-25 pointer-events-none" />
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-50/4 rounded-full blur-3xl animate-float-slow" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-secondary-50/3 rounded-full blur-3xl animate-float" />
      </div>

      <div className="max-w-5xl mx-auto relative z-10">
        {/* Header */}
        <div className="mb-16 animate-slide-right">
          <p className="section-label mb-3">Who I Am</p>
          <h1 className="font-space-grotesk text-5xl md:text-7xl font-bold mb-4">
            About <span className="neon-green">Me</span>
          </h1>
          <div className="h-px w-40 bg-linear-to-r from-primary-50 via-secondary-50 to-transparent" />
        </div>

        {/* Content — 2-col grid on desktop: sections left, highlights right */}
        <div className="grid md:grid-cols-5 gap-6 mb-0">
          {/* About sections — 3 col span */}
          <div className="md:col-span-3 space-y-4">
            {sections.map((s, i) => {
              const accent = av(s.accent as AccentToken);
              const accentA = (a: number) => ava(s.accent as AccentToken, a);
              return (
                <div
                  key={i}
                  className="glass card-shine rounded-sm border-(--sb) hover:border-(--sb-h) transition-all duration-500 animate-slide-up group overflow-hidden"
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
                  <div className="h-px" style={{ background: `linear-gradient(to right, ${accent}, transparent)` }} />

                  <div className="p-6 relative">
                    {/* Corner wash */}
                    <div
                      className="absolute top-0 right-0 w-32 h-32 opacity-[0.05] group-hover:opacity-[0.12] transition-opacity duration-500 pointer-events-none"
                      style={{ background: `radial-gradient(circle at top right, ${accent}, transparent 65%)` }}
                    />
                    <h2
                      className="font-space-grotesk font-bold text-lg mb-3 relative z-10"
                      style={{ color: accent }}
                    >
                      {s.title}
                    </h2>
                    <p className="text-neutral-70 leading-relaxed text-sm relative z-10">{s.body}</p>
                  </div>

                  {/* Bottom sweep */}
                  <div
                    className="h-px w-0 group-hover:w-full transition-all duration-700"
                    style={{ background: `linear-gradient(to right, ${accent}, transparent)` }}
                  />
                </div>
              );
            })}
          </div>

          {/* Highlights — 2 col span, stacked vertically */}
          <div className="md:col-span-2 flex flex-col gap-4">
            {highlights.map((h, i) => {
              const ac = ACCENT_CLASSES[h.accent as AccentToken] ?? ACCENT_CLASSES['primary'];
              const accent = av(h.accent as AccentToken);
              const accentA = (a: number) => ava(h.accent as AccentToken, a);
              return (
                <div
                  key={i}
                  className="glass card-shine rounded-sm border-(--hb) hover:border-(--hb-h) transition-all duration-500 animate-scale-in group overflow-hidden flex-1 relative"
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
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 holographic pointer-events-none" />

                  {/* Top accent */}
                  <div className="h-px" style={{ background: `linear-gradient(to right, ${accent}, transparent)` }} />

                  <div className="p-6 relative z-10 h-full flex flex-col">
                    <div
                      className="w-10 h-10 rounded-sm flex items-center justify-center text-xl mb-4 border transition-all duration-300 group-hover:scale-110"
                      style={{ borderColor: accentA(0.28), background: accentA(0.07) }}
                    >
                      {h.icon}
                    </div>
                    <h3 className={`font-space-grotesk font-bold text-base mb-2 ${ac.text}`}>
                      {h.title}
                    </h3>
                    <p className="text-neutral-60 text-sm leading-relaxed mt-auto">{h.desc}</p>
                  </div>

                  {/* Bottom sweep */}
                  <div
                    className="absolute bottom-0 left-0 h-px w-0 group-hover:w-full transition-all duration-700"
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
