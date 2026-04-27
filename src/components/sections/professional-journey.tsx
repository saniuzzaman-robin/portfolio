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
  const jobs: JobType[] = [
    {
      company: 'Bitsmedia Pte Ltd.',
      title: 'Software Engineer',
      period: '01/2024 – Present',
      duration: '~3 months',
      description:
        'Developing full-stack features using Next.js and NestJS. Architecting scalable APIs with caching optimization via Redis and MongoDB.',
      skills: ['NEXT.JS', 'NESTJS', 'REDIS', 'MONGODB'],
      accent: '#00ff87',
      highlights: [
        { icon: highlightIcons['Full-Stack'], label: 'Stack', value: 'Next.js + NestJS' },
        {
          icon: highlightIcons['Performance'],
          label: 'Performance',
          value: 'Caching & Optimization',
        },
        { icon: highlightIcons['Database'], label: 'Database', value: 'MongoDB & Redis' },
      ],
    },
    {
      company: 'KONA Software Lab Ltd.',
      title: 'Software Engineer – L02',
      period: '10/2022 – 01/2024',
      duration: '15 months',
      description:
        'Led a 4-member team and developed an Admin Panel with Angular. Maintained reusable frontend libraries and managed project architecture.',
      skills: ['ANGULAR', 'TYPESCRIPT', 'RXJS'],
      accent: '#00d4ff',
      highlights: [
        { icon: highlightIcons['Team Lead'], label: 'Team', value: '4 members' },
        { icon: highlightIcons['Frontend'], label: 'Frontend', value: 'Admin Panel' },
        { icon: highlightIcons['Libraries'], label: 'Libraries', value: 'Reusable Components' },
      ],
    },
    {
      company: 'SELISE Digital Platforms',
      title: 'Software Engineer',
      period: '03/2021 – 10/2022',
      duration: '19 months',
      description:
        'Built responsive web apps with Angular & Angular Material. Created a custom Selenium wrapper and ran JMeter load tests for performance.',
      skills: ['ANGULAR', 'SELENIUM', 'JMETER'],
      accent: '#a476ff',
      highlights: [
        { icon: highlightIcons['Testing'], label: 'Testing', value: 'Selenium & JMeter' },
        { icon: highlightIcons['Responsive'], label: 'Responsive', value: 'Angular Material' },
        { icon: highlightIcons['Load'], label: 'Performance', value: 'Load Testing' },
      ],
    },
  ];

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
