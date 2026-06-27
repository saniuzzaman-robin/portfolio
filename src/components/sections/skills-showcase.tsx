'use client';

import { motion } from 'framer-motion';
import { CV_DATA } from '@/lib/cv-data';
import { useInView } from '@/hooks/use-in-view';
import { av, ava, type AccentToken } from '@/lib/accent';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.5, ease: [0.16, 1, 0.3, 1] as const },
  }),
};

interface SkillBarProps {
  name: string;
  level: number;
  accent: AccentToken;
  delay: number;
}

function SkillBar({ name, level, accent, delay }: SkillBarProps) {
  const { ref, inView } = useInView(0.3);
  return (
    <div ref={ref} className="group">
      <div className="mb-2 flex items-center justify-between">
        <span className="font-poppins text-neutral-80 text-sm font-bold transition-colors group-hover:text-neutral-100">
          {name}
        </span>
        <span className="font-poppins text-xs font-bold tabular-nums" style={{ color: av(accent) }}>
          {level}%
        </span>
      </div>
      <div className="bg-neutral-10 h-1.5 overflow-hidden rounded-full">
        <div
          className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{
            width: inView ? `${level}%` : '0%',
            transitionDelay: `${delay}ms`,
            background: `linear-gradient(to right, ${av(accent)}, ${ava(accent, 0.5)})`,
            boxShadow: `0 0 8px ${ava(accent, 0.3)}`,
          }}
        />
      </div>
    </div>
  );
}

export function SkillsShowcase() {
  const skillCategories = CV_DATA.skillsDetailed;

  return (
    <section className="relative px-6 py-24 md:px-12 lg:px-16">
      <div className="cyber-grid-dense pointer-events-none absolute inset-0 opacity-15" />
      <div className="relative z-10 mx-auto max-w-6xl">
        <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible" className="mb-14">
          <p className="section-label mb-3">Technical Stack</p>
          <h1 className="font-poppins mb-3 text-5xl font-bold md:text-6xl">
            Skills &amp; <span className="text-secondary-50">Expertise</span>
          </h1>
          <p className="text-neutral-70 max-w-xl text-sm leading-relaxed">
            A comprehensive view of technologies mastered through 5+ years of production engineering.
          </p>
        </motion.div>

        <div className="space-y-10">
          {skillCategories.map((cat, catIdx) => {
            const accent = cat.accent as AccentToken;
            return (
              <motion.div
                key={catIdx}
                custom={catIdx + 1}
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                className="glass rounded-xl border p-8 transition-all duration-500 hover:shadow-lg"
                style={{ borderColor: ava(accent, 0.12) }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = ava(accent, 0.3); }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = ava(accent, 0.12); }}
              >
                <div className="mb-6 flex items-center gap-3">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-lg text-xl"
                    style={{ background: ava(accent, 0.07), border: `1px solid ${ava(accent, 0.2)}` }}
                  >
                    {cat.icon}
                  </div>
                  <h2 className="font-poppins text-xl font-bold" style={{ color: av(accent) }}>
                    {cat.category}
                  </h2>
                </div>

                <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                  {cat.skills.map((skill, i) => (
                    <SkillBar
                      key={i}
                      name={skill.name}
                      level={skill.level}
                      accent={accent}
                      delay={catIdx * 100 + i * 80}
                    />
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>

        <motion.div custom={100} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="mt-14 grid gap-6 md:grid-cols-2">
          <div className="glass border border-primary-50/15 hover:border-primary-50/40 group relative overflow-hidden rounded-xl p-8 transition-all duration-300 hover:shadow-lg">
            <div className="holographic pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
            <h3 className="font-poppins text-primary-50 relative z-10 mb-4 text-xl font-bold">
              Competitive Programming
            </h3>
            <ul className="text-neutral-70 relative z-10 space-y-2 text-sm">
              {[
                '1700+ problems solved across major judges',
                'ICPC Regional Finalist',
                '10+ national level contests',
                'Problem setter & judge for university contests',
              ].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <span className="text-primary-50 text-xs">▸</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="glass border border-secondary-50/15 hover:border-secondary-50/40 group relative overflow-hidden rounded-xl p-8 transition-all duration-300 hover:shadow-lg">
            <div className="holographic pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
            <h3 className="font-poppins text-secondary-50 relative z-10 mb-4 text-xl font-bold">
              Core Expertise
            </h3>
            <ul className="text-neutral-70 relative z-10 space-y-2 text-sm">
              {[
                'System Architecture & Design Patterns',
                'Performance Optimization (Redis, Caching)',
                'Testing & QA (Jest, Selenium, JMeter)',
                'Team Leadership & Code Reviews',
              ].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <span className="text-secondary-50 text-xs">▸</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
