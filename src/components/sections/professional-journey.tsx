'use client';

import {
  Rocket,
  Zap,
  Database,
  Users,
  Palette,
  Package,
  TestTube2,
  Smartphone,
  Settings,
} from 'lucide-react';
import { CV_DATA } from '@/lib/cv-data';

interface JobType {
  company: string;
  title: string;
  period: string;
  duration: string;
  description: string;
  skills: string[];
  accent: string;
  highlights: { icon: React.ReactNode; label: string; value: string }[];
}

const highlightIcons = {
  'Full-Stack': <Rocket className="w-4 h-4" strokeWidth={1.5} />,
  Performance: <Zap className="w-4 h-4" strokeWidth={1.5} />,
  Database: <Database className="w-4 h-4" strokeWidth={1.5} />,
  'Team Lead': <Users className="w-4 h-4" strokeWidth={1.5} />,
  Frontend: <Palette className="w-4 h-4" strokeWidth={1.5} />,
  Libraries: <Package className="w-4 h-4" strokeWidth={1.5} />,
  Testing: <TestTube2 className="w-4 h-4" strokeWidth={1.5} />,
  Responsive: <Smartphone className="w-4 h-4" strokeWidth={1.5} />,
  Load: <Settings className="w-4 h-4" strokeWidth={1.5} />,
};

export function ProfessionalJourney() {
  const jobs: JobType[] = CV_DATA.experience.map((exp) => ({
    company: exp.company,
    title: exp.title,
    period: exp.period.replace('-', '–'),
    duration: exp.duration,
    description: exp.description,
    skills: exp.skills.map((s) => s.toUpperCase()),
    accent: exp.accent,
    highlights: exp.highlights.map((h) => ({
      icon: highlightIcons[h.label as keyof typeof highlightIcons] || highlightIcons['Full-Stack'],
      label: h.label,
      value: h.value,
    })),
  }));

  return (
    <section className="px-6 py-24 md:px-12 lg:px-20 relative">
      {/* Header */}
      <div className="mb-20 animate-slide-right">
        <p className="section-label mb-3">Experience</p>
        <h2 className="font-space-grotesk text-4xl md:text-5xl font-bold text-right">
          Professional <span className="neon-green">Journey</span>
        </h2>
      </div>

      <div className="max-w-5xl mx-auto relative">
        {/* Vertical timeline line */}
        <div
          className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2"
          style={{ background: 'linear-gradient(to bottom, #00ff87, #00d4ff, #a476ff)' }}
        />

        <div className="space-y-16">
          {jobs.map((job, index) => (
            <div
              key={index}
              className={`grid lg:grid-cols-2 gap-8 items-start animate-slide-up`}
              style={{ animationDelay: `${index * 150}ms`, animationFillMode: 'both' }}
            >
              {/* Content card — alternates left/right */}
              <div className={index % 2 === 1 ? 'lg:order-2' : ''}>
                <div
                  className="glass rounded-sm border p-6 transition-all duration-500 group hover:scale-[1.02]"
                  style={{ borderColor: `${job.accent}33` }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = `${job.accent}88`)}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = `${job.accent}33`)}
                >
                  {/* Top accent bar */}
                  <div
                    className="h-px mb-6"
                    style={{ background: `linear-gradient(to right, ${job.accent}, transparent)` }}
                  />

                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-space-grotesk font-bold text-xl text-neutral-90">
                        {job.company}
                      </h3>
                      <p
                        className="text-xs font-space-grotesk font-bold uppercase tracking-widest mt-1"
                        style={{ color: job.accent }}
                      >
                        {job.title}
                      </p>
                    </div>
                    <span
                      className="terminal-text text-xs shrink-0 ml-4"
                      style={{
                        color: job.accent,
                        borderColor: `${job.accent}40`,
                        backgroundColor: `${job.accent}10`,
                      }}
                    >
                      {job.duration}
                    </span>
                  </div>

                  <p className="text-neutral-60 text-xs mb-4 font-space-grotesk">{job.period}</p>
                  <p className="text-neutral-70 text-sm leading-relaxed mb-5">{job.description}</p>

                  <div className="flex gap-2 flex-wrap">
                    {job.skills.map((skill) => (
                      <span
                        key={skill}
                        className="px-3 py-1 text-xs font-space-grotesk font-bold uppercase tracking-wider rounded-sm"
                        style={{
                          color: job.accent,
                          border: `1px solid ${job.accent}40`,
                          background: `${job.accent}10`,
                        }}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Timeline node + highlights */}
              <div
                className={`hidden lg:flex flex-col items-center gap-6 ${index % 2 === 1 ? 'lg:order-1' : ''}`}
              >
                {/* Node */}
                <div
                  className="w-4 h-4 rounded-full z-10 animate-glow"
                  style={{
                    backgroundColor: job.accent,
                    boxShadow: `0 0 10px ${job.accent}, 0 0 30px ${job.accent}50`,
                  }}
                />
                {/* Highlight cards */}
                <div className="space-y-3 w-full">
                  {job.highlights.map((h, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 px-4 py-3 glass rounded-sm border transition-all duration-300 hover:scale-105"
                      style={{ borderColor: `${job.accent}30` }}
                    >
                      <span style={{ color: job.accent }}>{h.icon}</span>
                      <div>
                        <p className="text-neutral-60 text-xs">{h.label}</p>
                        <p className="text-neutral-80 text-sm font-space-grotesk font-bold">
                          {h.value}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
