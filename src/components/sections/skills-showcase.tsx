'use client';

import { motion } from 'framer-motion';
import { CV_DATA } from '@/lib/cv-data';
import { useInView } from '@/hooks/use-in-view';
import { av, ava, type AccentToken } from '@/lib/accent';
import { SectionHeader } from '@/components/ui/section-header';

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
        <span className="text-midnight-950 group-hover:text-midnight-950 text-sm font-bold transition-colors">
          {name}
        </span>
        <span className="text-xs font-bold tabular-nums" style={{ color: av(accent) }}>
          {level}%
        </span>
      </div>
      <div className="bg-midnight-100 h-1.5 overflow-hidden rounded-full">
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
    <section className="relative px-6 py-24 md:px-12 lg:px-20">
      <div className="relative z-10 mx-auto max-w-6xl">
        <SectionHeader
          label="Technical Stack"
          title={
            <>
              Skills &amp; <span className="gradient-text">Expertise</span>
            </>
          }
          description="A comprehensive view of technologies mastered through 5+ years of production engineering."
        />

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
                className="glass rounded-2xl p-8 transition-all duration-500 hover:shadow-lg"
                style={{ borderLeft: `3px solid ${av(accent)}` }}
              >
                <div className="mb-6 flex items-center gap-3">
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-xl text-2xl"
                    style={{ background: ava(accent, 0.1) }}
                  >
                    {cat.icon}
                  </div>
                  <h2 className="text-xl font-bold" style={{ color: av(accent) }}>
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

        <motion.div
          custom={100}
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mt-14 grid gap-6 md:grid-cols-2"
        >
          <div
            className="glass overflow-hidden rounded-2xl p-8 transition-all duration-300 hover:shadow-lg"
            style={{ borderTop: `3px solid ${av('primary')}` }}
          >
            <h3 className="mb-4 text-xl font-bold" style={{ color: av('primary') }}>
              Competitive Programming
            </h3>
            <ul className="text-midnight-950 space-y-2 text-sm">
              {[
                '1700+ problems solved across major judges',
                'ICPC Regional Finalist',
                '10+ national level contests',
                'Problem setter & judge for university contests',
              ].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <span className="text-xs" style={{ color: av('primary') }}>
                    ▸
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div
            className="glass overflow-hidden rounded-2xl p-8 transition-all duration-300 hover:shadow-lg"
            style={{ borderTop: `3px solid ${av('secondary')}` }}
          >
            <h3 className="mb-4 text-xl font-bold" style={{ color: av('secondary') }}>
              Core Expertise
            </h3>
            <ul className="text-midnight-950 space-y-2 text-sm">
              {[
                'System Architecture & Design Patterns',
                'Performance Optimization (Redis, Caching)',
                'Testing & QA (Jest, Selenium, JMeter)',
                'Team Leadership & Code Reviews',
              ].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <span className="text-xs" style={{ color: av('secondary') }}>
                    ▸
                  </span>
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
