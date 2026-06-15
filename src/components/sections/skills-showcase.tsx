'use client';

import type { CSSProperties } from 'react';
import { CV_DATA } from '@/lib/cv-data';
import { useInView } from '@/hooks/use-in-view';
import { av, ava, type AccentToken } from '@/lib/accent';

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
        <span
          className="font-poppins text-xs font-bold tabular-nums lg:text-sm"
          style={{ color: av(accent) }}
        >
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
            boxShadow: `0 0 8px ${ava(accent, 0.38)}`,
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
      <div className="cyber-grid-dense pointer-events-none absolute inset-0 opacity-20" />
      <div className="relative z-10 mx-auto max-w-6xl">
        {/* Header */}
        <div className="animate-slide-right mb-16">
          <p className="section-label mb-3">Technical Stack</p>
          <h1 className="font-poppins mb-4 text-5xl font-bold md:text-6xl">
            Skills &amp; <span className="neon-cyan">Expertise</span>
          </h1>
          <p className="text-neutral-70 max-w-xl text-sm leading-relaxed">
            A comprehensive view of technologies mastered through 5+ years of production
            engineering.
          </p>
        </div>

        {/* Skill categories */}
        <div className="space-y-12">
          {skillCategories.map((cat, catIdx) => {
            const accent = cat.accent as AccentToken;
            return (
              <div
                key={catIdx}
                className="glass animate-slide-up rounded-sm border-(--sb) p-8 transition-all duration-500 hover:scale-[1.01] hover:border-(--sb-h)"
                style={
                  {
                    '--sb': ava(accent, 0.15),
                    '--sb-h': ava(accent, 0.35),
                    animationDelay: `${catIdx * 120}ms`,
                    animationFillMode: 'both',
                  } as CSSProperties
                }
              >
                {/* Category header */}
                <div className="mb-8 flex items-center gap-3">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-sm text-xl"
                    style={{
                      background: ava(accent, 0.08),
                      border: `1px solid ${ava(accent, 0.25)}`,
                    }}
                  >
                    {cat.icon}
                  </div>
                  <h2
                    className="font-poppins text-xl font-bold"
                    style={{ color: av(accent) }}
                  >
                    {cat.category}
                  </h2>
                </div>

                {/* Skill bars */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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
              </div>
            );
          })}
        </div>

        {/* Bottom cards */}
        <div className="mt-16 grid gap-6 md:grid-cols-2">
          <div className="glass border-primary-50/20 hover:border-primary-50/50 animate-scale-in group relative overflow-hidden rounded-sm border p-8 transition-all duration-300 [animation-delay:600ms]">
            <div className="holographic pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
            <h3 className="font-poppins neon-green relative z-10 mb-4 text-xl font-bold">
              ⚡ Competitive Programming
            </h3>
            <ul className="text-neutral-70 relative z-10 space-y-2 text-sm">
              {[
                '1700+ problems solved across major judges',
                'ICPC Regional Finalist',
                '10+ national level contests',
                'Problem setter & judge for university contests',
              ].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <span className="text-primary-50 text-xs lg:text-sm">▸</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="glass border-secondary-50/20 hover:border-secondary-50/50 animate-scale-in group relative overflow-hidden rounded-sm border p-8 transition-all duration-300 [animation-delay:700ms]">
            <div className="holographic pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
            <h3 className="font-poppins neon-cyan relative z-10 mb-4 text-xl font-bold">
              🎯 Core Expertise
            </h3>
            <ul className="text-neutral-70 relative z-10 space-y-2 text-sm">
              {[
                'System Architecture & Design Patterns',
                'Performance Optimization (Redis, Caching)',
                'Testing & QA (Jest, Selenium, JMeter)',
                'Team Leadership & Code Reviews',
              ].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <span className="text-secondary-50 text-xs lg:text-sm">▸</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
