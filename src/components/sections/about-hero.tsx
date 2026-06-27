'use client';

import type { CSSProperties } from 'react';
import { motion } from 'framer-motion';
import { CV_DATA } from '@/lib/cv-data';
import { av, ava, type AccentToken } from '@/lib/accent';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] as const },
  }),
};

export function AboutHero() {
  const sections = CV_DATA.aboutSections;
  const highlights = CV_DATA.highlights;

  return (
    <section className="relative overflow-hidden px-6 py-24 md:px-12 lg:px-16">
      <div className="cyber-grid-dense pointer-events-none absolute inset-0 opacity-20" />
      <div className="pointer-events-none absolute inset-0">
        <div className="bg-primary-50/3 absolute top-0 right-0 h-96 w-96 rounded-full blur-3xl" />
        <div className="bg-secondary-50/2 absolute bottom-0 left-1/3 h-80 w-80 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-5xl">
        <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible" className="mb-14">
          <p className="section-label mb-3">Who I Am</p>
          <h1 className="font-poppins mb-4 text-5xl font-bold md:text-7xl">
            About <span className="text-primary-50">Me</span>
          </h1>
          <div className="from-primary-50 via-secondary-50 h-px w-32 bg-linear-to-r to-transparent" />
        </motion.div>

        <div className="mb-0 grid gap-6 md:grid-cols-5">
          <div className="space-y-4 md:col-span-3">
            {sections.map((s, i) => {
              const accent = av(s.accent as AccentToken);
              const accentA = (a: number) => ava(s.accent as AccentToken, a);
              return (
                <motion.div
                  key={i}
                  custom={i + 1}
                  variants={fadeUp}
                  initial="hidden"
                  animate="visible"
                  className="glass card-shine group overflow-hidden rounded-xl border transition-all duration-500 hover:shadow-lg"
                  style={{ borderColor: accentA(0.12) } as CSSProperties}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = accentA(0.32); }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = accentA(0.12); }}
                >
                  <div className="h-px" style={{ background: `linear-gradient(to right, ${accent}, transparent)` }} />
                  <div className="relative p-6">
                    <div
                      className="pointer-events-none absolute top-0 right-0 h-32 w-32 opacity-[0.04]"
                      style={{ background: `radial-gradient(circle at top right, ${accent}, transparent 65%)` }}
                    />
                    <h2 className="font-poppins relative z-10 mb-3 text-lg font-bold" style={{ color: accent }}>
                      {s.title}
                    </h2>
                    <p className="text-neutral-70 relative z-10 text-sm leading-relaxed">{s.body}</p>
                  </div>
                  <div
                    className="h-px w-0 transition-all duration-700 group-hover:w-full"
                    style={{ background: `linear-gradient(to right, ${accent}, transparent)` }}
                  />
                </motion.div>
              );
            })}
          </div>

          <div className="flex flex-col gap-4 md:col-span-2">
            {highlights.map((h, i) => {
              const accent = av(h.accent as AccentToken);
              const accentA = (a: number) => ava(h.accent as AccentToken, a);
              return (
                <motion.div
                  key={i}
                  custom={sections.length + 1 + i}
                  variants={fadeUp}
                  initial="hidden"
                  animate="visible"
                  className="glass card-shine group relative flex-1 overflow-hidden rounded-xl border transition-all duration-500 hover:shadow-lg"
                  style={{ borderColor: accentA(0.12) } as CSSProperties}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = accentA(0.35); }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = accentA(0.12); }}
                >
                  <div className="holographic pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                  <div className="h-px" style={{ background: `linear-gradient(to right, ${accent}, transparent)` }} />
                  <div className="relative z-10 flex h-full flex-col p-6">
                    <div
                      className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg border text-xl transition-all duration-300 group-hover:scale-110"
                      style={{ borderColor: accentA(0.25), background: accentA(0.06) }}
                    >
                      {h.icon}
                    </div>
                    <h3 className="font-poppins mb-2 text-base font-bold" style={{ color: accent }}>{h.title}</h3>
                    <p className="text-neutral-60 mt-auto text-sm leading-relaxed">{h.desc}</p>
                  </div>
                  <div
                    className="absolute bottom-0 left-0 h-px w-0 transition-all duration-700 group-hover:w-full"
                    style={{ background: `linear-gradient(to right, ${accent}, transparent)` }}
                  />
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
