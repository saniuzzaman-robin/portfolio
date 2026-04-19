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

type ColorType = 'primary' | 'secondary' | 'tertiary';

interface HighlightItemType {
  icon: React.ReactNode;
  label: string;
  value: string;
}

interface JobType {
  company: string;
  title: string;
  period: string;
  duration: string;
  description: string;
  skills: string[];
  color: ColorType;
  colorValue: string;
  highlights: HighlightItemType[];
}

const colorMap: Record<ColorType, string> = {
  primary: 'text-primary-50',
  secondary: 'text-secondary-50',
  tertiary: 'text-tertiary-50',
};

const highlightIcons = {
  'Full-Stack Development': <Rocket className="w-5 h-5" strokeWidth={1.5} />,
  Performance: <Zap className="w-5 h-5" strokeWidth={1.5} />,
  Database: <Database className="w-5 h-5" strokeWidth={1.5} />,
  'Team Lead': <Users className="w-5 h-5" strokeWidth={1.5} />,
  Frontend: <Palette className="w-5 h-5" strokeWidth={1.5} />,
  Libraries: <Package className="w-5 h-5" strokeWidth={1.5} />,
  Testing: <TestTube2 className="w-5 h-5" strokeWidth={1.5} />,
  'Responsive Design': <Smartphone className="w-5 h-5" strokeWidth={1.5} />,
};

export function ProfessionalJourney() {
  const jobs: JobType[] = [
    {
      company: 'Bitsmedia Pte Ltd.',
      title: 'Software Engineer',
      period: '01/2024 - Present',
      duration: '~3 months',
      description:
        'Developing and maintaining full-stack features using Next.js and NestJS. Architecting scalable solutions with API implementation, caching optimization, and performance improvements using Redis and MongoDB.',
      skills: ['NEXT.JS', 'NESTJS', 'REDIS', 'MONGODB'],
      color: 'primary',
      colorValue: '#25a475',
      highlights: [
        {
          icon: highlightIcons['Full-Stack Development'],
          label: 'Full-Stack Development',
          value: 'Next.js + NestJS',
        },
        {
          icon: highlightIcons['Performance'],
          label: 'Performance',
          value: 'Caching & Optimization',
        },
        {
          icon: highlightIcons['Database'],
          label: 'Database',
          value: 'MongoDB & Redis',
        },
      ],
    },
    {
      company: 'KONA Software Lab Ltd.',
      title: 'Software Engineer - L02',
      period: '10/2022 - 01/2024',
      duration: '15 months',
      description:
        'Coordinated 4-member development team and spearheaded Admin Panel development with Angular. Maintained reusable frontend libraries and managed scalable project architecture with proper caching strategies.',
      skills: ['ANGULAR', 'TYPESCRIPT', 'RXJS'],
      color: 'secondary',
      colorValue: '#af8d11',
      highlights: [
        {
          icon: highlightIcons['Team Lead'],
          label: 'Team Lead',
          value: '4 members',
        },
        {
          icon: highlightIcons['Frontend'],
          label: 'Frontend',
          value: 'Admin Panel',
        },
        {
          icon: highlightIcons['Libraries'],
          label: 'Libraries',
          value: 'Reusable Components',
        },
      ],
    },
    {
      company: 'SELISE Digital Platforms',
      title: 'Software Engineer',
      period: '03/2021 - 10/2022',
      duration: '19 months',
      description:
        'Developed responsive web applications using Angular and Angular Material. Created custom Selenium wrapper for automated testing and conducted load testing with JMeter for performance optimization.',
      skills: ['ANGULAR', 'SELENIUM', 'JMETER'],
      color: 'tertiary',
      colorValue: '#a476ff',
      highlights: [
        {
          icon: highlightIcons['Testing'],
          label: 'Testing',
          value: 'Selenium & JMeter',
        },
        {
          icon: highlightIcons['Responsive Design'],
          label: 'Responsive Design',
          value: 'Angular Material',
        },
        {
          icon: <Settings className="w-5 h-5" strokeWidth={1.5} />,
          label: 'Performance',
          value: 'Load Testing',
        },
      ],
    },
  ];

  return (
    <section className="px-6 py-24 md:px-12 lg:px-20">
      <div className="text-right mb-24 animate-slide-left">
        <h2 className="font-space-grotesk text-4xl font-bold inline-block border-r-4 border-white pr-6">
          Professional
          <br />
          Journey
        </h2>
      </div>

      <div className="max-w-5xl mx-auto relative">
        {/* Center vertical line - hidden on mobile, shown on lg and up */}
        <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-px bg-linear-to-b from-primary-50 via-secondary-50 to-tertiary-50 transform -translate-x-1/2 animate-glow will-change-transform"></div>

        <div className="space-y-20">
          {jobs.map((job, index) => (
            <div
              key={index}
              className={`grid lg:grid-cols-2 gap-8 items-center animate-slide-up ${
                index % 2 === 0 ? 'lg:odd:flex-row-reverse' : 'lg:flex-row-reverse'
              }`}
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <div className="lg:col-span-1 hover:translate-x-1 transition-transform duration-500 will-change-transform">
                <div className="flex items-start gap-4">
                  <div
                    className="w-4 h-4 rounded-full mt-2 shrink-0 relative z-10 hover:scale-150 transition-transform duration-300 will-change-transform"
                    style={{ backgroundColor: job.colorValue }}
                  ></div>
                  <div className="flex-1">
                    <h3
                      className={`font-space-grotesk font-bold text-2xl ${colorMap[job.color]} mb-2`}
                    >
                      {job.company}
                    </h3>
                    <p
                      className="text-xs uppercase tracking-widest mb-2"
                      style={{ color: job.colorValue }}
                    >
                      {job.title}
                    </p>
                    <p className="text-neutral-60 text-xs mb-4">{job.period}</p>
                    <p className="text-neutral-70 text-sm leading-relaxed mb-6">
                      {job.description}
                    </p>
                    <div className="flex gap-2 flex-wrap">
                      {job.skills.map((skill) => (
                        <span
                          key={skill}
                          className="px-3 py-1 text-xs bg-neutral-10 text-neutral-70 rounded-full hover:scale-110 transition-transform duration-300 will-change-transform"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="hidden lg:block lg:col-span-1 space-y-3">
                <div
                  className="text-xs uppercase tracking-widest font-space-grotesk mb-4"
                  style={{ color: job.colorValue }}
                >
                  Duration: {job.duration}
                </div>
                <div className="space-y-3">
                  {job.highlights.map((highlight, i) => (
                    <div
                      key={i}
                      className="bg-neutral-5 rounded-lg p-4 border-l-4 hover:shadow-md transition-shadow duration-300"
                      style={{ borderColor: job.colorValue }}
                    >
                      <div className="text-neutral-70 mb-2 flex items-center gap-2">
                        {highlight.icon}
                      </div>
                      <p className="text-xs text-neutral-60 mb-1">{highlight.label}</p>
                      <p className="text-sm font-space-grotesk font-bold text-neutral-80">
                        {highlight.value}
                      </p>
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
