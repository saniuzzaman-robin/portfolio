'use client';

import { motion } from 'framer-motion';
import { CV_DATA } from '@/lib/cv-data';
import { av, ava, type AccentToken } from '@/lib/accent';
import { SectionHeader } from '@/components/ui/section-header';

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
    <section className="relative overflow-hidden px-6 py-24 md:px-12 lg:px-20">
      {/* Background blobs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="aurora-blob aurora-blob-primary absolute top-0 right-0 h-[400px] w-[400px] opacity-10" />
        <div
          className="aurora-blob aurora-blob-secondary absolute bottom-0 left-1/3 h-[350px] w-[350px] opacity-10"
          style={{ animationDelay: '-5s' }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-5xl">
        <SectionHeader
          label="Who I Am"
          title={
            <>
              About <span className="gradient-text">Me</span>
            </>
          }
          align="left"
        />

        <div className="grid gap-6 md:grid-cols-5">
          {/* Main content */}
          <div className="space-y-4 md:col-span-3">
            {sections.map((s, i) => {
              const accent = av(s.accent as AccentToken);
              return (
                <motion.div
                  key={i}
                  custom={i + 1}
                  variants={fadeUp}
                  initial="hidden"
                  animate="visible"
                  className="glass group overflow-hidden rounded-2xl p-6 transition-all duration-500 hover:shadow-lg"
                  style={{ borderLeft: `3px solid ${accent}` }}
                >
                  <h2 className="mb-3 text-lg font-bold" style={{ color: accent }}>
                    {s.title}
                  </h2>
                  <p className="text-midnight-500 text-sm leading-relaxed">{s.body}</p>
                </motion.div>
              );
            })}
          </div>

          {/* Highlight cards */}
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
                  className="glass group relative flex-1 overflow-hidden rounded-2xl p-6 transition-all duration-500 hover:shadow-lg"
                  style={{ borderTop: `3px solid ${accent}` }}
                >
                  <div
                    className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl text-2xl transition-transform duration-300 group-hover:scale-110"
                    style={{ background: accentA(0.1) }}
                  >
                    {h.icon}
                  </div>
                  <h3 className="mb-2 text-base font-bold" style={{ color: accent }}>
                    {h.title}
                  </h3>
                  <p className="text-midnight-500 text-sm leading-relaxed">{h.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
