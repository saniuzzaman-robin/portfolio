'use client';

import { CV_DATA } from '@/lib/cv-data';
import { useInView } from '@/hooks/use-in-view';

interface SkillBarProps {
  name: string;
  level: number;
  accent: string;
  delay: number;
}

function SkillBar({ name, level, accent, delay }: SkillBarProps) {
  const { ref, inView } = useInView(0.3);
  return (
    <div ref={ref} className="group">
      <div className="flex justify-between items-center mb-2">
        <span className="font-space-grotesk font-bold text-sm text-neutral-80 group-hover:text-neutral-100 transition-colors">
          {name}
        </span>
        <span
          className="font-space-grotesk font-bold text-xs tabular-nums"
          style={{ color: accent }}
        >
          {level}%
        </span>
      </div>
      <div className="h-1.5 bg-neutral-10 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{
            width: inView ? `${level}%` : '0%',
            transitionDelay: `${delay}ms`,
            background: `linear-gradient(to right, ${accent}, ${accent}80)`,
            boxShadow: `0 0 8px ${accent}60`,
          }}
        />
      </div>
    </div>
  );
}

export function SkillsShowcase() {
  const skillCategories = CV_DATA.skillsDetailed;

  return (
    <section className="px-6 py-24 md:px-12 lg:px-20 relative">
      <div className="absolute inset-0 cyber-grid-dense opacity-20 pointer-events-none" />
      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <div className="mb-16 animate-slide-right">
          <p className="section-label mb-3">Technical Stack</p>
          <h1 className="font-space-grotesk text-5xl md:text-6xl font-bold mb-4">
            Skills &amp; <span className="neon-cyan">Expertise</span>
          </h1>
          <p className="text-neutral-70 text-sm leading-relaxed max-w-xl">
            A comprehensive view of technologies mastered through 5+ years of production
            engineering.
          </p>
        </div>

        {/* Skill categories */}
        <div className="space-y-12">
          {skillCategories.map((cat, catIdx) => (
            <div
              key={catIdx}
              className="glass rounded-sm border p-8 transition-all duration-500 animate-slide-up hover:scale-[1.01]"
              style={{
                borderColor: `${cat.accent}25`,
                animationDelay: `${catIdx * 120}ms`,
                animationFillMode: 'both',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = `${cat.accent}50`)}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = `${cat.accent}25`)}
            >
              {/* Category header */}
              <div className="flex items-center gap-3 mb-8">
                <div
                  className="w-10 h-10 rounded-sm flex items-center justify-center text-xl"
                  style={{ background: `${cat.accent}15`, border: `1px solid ${cat.accent}40` }}
                >
                  {cat.icon}
                </div>
                <h2 className="font-space-grotesk font-bold text-xl" style={{ color: cat.accent }}>
                  {cat.category}
                </h2>
              </div>

              {/* Skill bars */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {cat.skills.map((skill, i) => (
                  <SkillBar
                    key={i}
                    name={skill.name}
                    level={skill.level}
                    accent={cat.accent}
                    delay={catIdx * 100 + i * 80}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom cards */}
        <div className="grid md:grid-cols-2 gap-6 mt-16">
          <div className="glass rounded-sm border border-primary-50/20 hover:border-primary-50/50 p-8 transition-all duration-300 animate-scale-in [animation-delay:600ms] group relative overflow-hidden">
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 holographic pointer-events-none" />
            <h3 className="font-space-grotesk text-xl font-bold neon-green mb-4 relative z-10">
              ⚡ Competitive Programming
            </h3>
            <ul className="space-y-2 text-neutral-70 text-sm relative z-10">
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
          <div className="glass rounded-sm border border-secondary-50/20 hover:border-secondary-50/50 p-8 transition-all duration-300 animate-scale-in [animation-delay:700ms] group relative overflow-hidden">
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 holographic pointer-events-none" />
            <h3 className="font-space-grotesk text-xl font-bold neon-cyan mb-4 relative z-10">
              🎯 Core Expertise
            </h3>
            <ul className="space-y-2 text-neutral-70 text-sm relative z-10">
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
        </div>
      </div>
    </section>
  );
}
