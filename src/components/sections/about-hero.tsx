'use client';

import { CV_DATA } from '@/lib/cv-data';

export function AboutHero() {
  const highlights = CV_DATA.highlights;

  const sections = CV_DATA.aboutSections;

  return (
    <section className="px-6 py-24 md:px-12 lg:px-20 relative">
      <div className="absolute inset-0 cyber-grid-dense opacity-30 pointer-events-none" />
      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header */}
        <div className="mb-16 animate-slide-right">
          <p className="section-label mb-3">Who I Am</p>
          <h1 className="font-space-grotesk text-5xl md:text-7xl font-bold mb-4">
            About <span className="neon-green">Me</span>
          </h1>
          <div className="h-px w-32 bg-linear-to-r from-primary-50 via-secondary-50 to-transparent animate-fade-in [animation-delay:200ms]" />
        </div>

        {/* Content sections */}
        <div className="space-y-8 mb-16">
          {sections.map((s, i) => (
            <div
              key={i}
              className="glass rounded-sm border p-6 transition-all duration-500 animate-slide-up group hover:scale-[1.01]"
              style={{
                borderColor: `${s.accent}30`,
                animationDelay: `${i * 120}ms`,
                animationFillMode: 'both',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = `${s.accent}60`)}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = `${s.accent}30`)}
            >
              <div
                className="h-px mb-5"
                style={{ background: `linear-gradient(to right, ${s.accent}, transparent)` }}
              />
              <h2 className="font-space-grotesk font-bold text-xl mb-3" style={{ color: s.accent }}>
                {s.title}
              </h2>
              <p className="text-neutral-80 leading-relaxed text-sm">{s.body}</p>
            </div>
          ))}
        </div>

        {/* Highlight cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {highlights.map((h, i) => {
            const borderClasses: Record<string, string> = {
              '#00ff87': 'border-primary-50/30 hover:border-primary-50/70',
              '#00d4ff': 'border-secondary-50/30 hover:border-secondary-50/70',
              '#a476ff': 'border-tertiary-50/30 hover:border-tertiary-50/70',
            };
            const borderClass =
              borderClasses[h.accent] || 'border-primary-50/30 hover:border-primary-50/70';
            return (
              <div
                key={i}
                className={`glass rounded-sm border ${borderClass} p-8 transition-all duration-500 group hover:scale-105 animate-scale-in overflow-hidden relative`}
                style={{ animationDelay: `${400 + i * 120}ms`, animationFillMode: 'both' }}
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 holographic pointer-events-none" />
                <div className="text-3xl mb-4 relative z-10">{h.icon}</div>
                <h3 className="font-space-grotesk font-bold text-lg mb-2 relative z-10">
                  {h.title}
                </h3>
                <p className="text-neutral-70 text-sm relative z-10">{h.desc}</p>
                <div
                  className="absolute bottom-0 left-0 h-px w-0 group-hover:w-full transition-all duration-700"
                  style={{ background: `linear-gradient(to right, ${h.accent}, transparent)` }}
                />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
