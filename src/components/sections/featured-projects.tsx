import type { CSSProperties } from 'react';
import Link from 'next/link';
import { ArrowRight, ExternalLink } from 'lucide-react';
import { FEATURED_PROJECTS, type FeaturedProject } from '@/lib/data/featured-projects';
import { av, ava, type AccentToken } from '@/lib/accent';

function ProjectCard({
  project,
  size,
  animDelay,
}: {
  project: FeaturedProject;
  size: 'lg' | 'sm';
  animDelay: number;
}) {
  const accent = av(project.accent as AccentToken);
  const accentA = (a: number) => ava(project.accent as AccentToken, a);

  return (
    <Link
      href={project.href}
      target="_blank"
      rel="noopener noreferrer"
      className="group block flex-1"
    >
      <div
        className="glass animate-scale-in relative flex h-full overflow-hidden rounded-sm border-(--cb) transition-all duration-500 hover:border-(--cb-h) hover:shadow-(--cs)"
        style={
          {
            '--cb': accentA(0.16),
            '--cb-h': accentA(0.46),
            '--cs': `0 0 28px ${accentA(0.12)}, 0 0 56px ${accentA(0.05)}`,
            animationDelay: `${animDelay}ms`,
            animationFillMode: 'both',
            minHeight: size === 'lg' ? '220px' : '160px',
          } as CSSProperties
        }
      >
        {/* Left bookmark bar — the signature visual element */}
        <div
          className="w-1 shrink-0 transition-all duration-300 group-hover:w-1.5"
          style={{
            background: `linear-gradient(to bottom, ${accent}, ${accentA(0.25)})`,
          }}
        />

        {/* Card body */}
        <div className="relative flex flex-1 flex-col overflow-hidden p-5 md:p-6">
          {/* Holographic hover */}
          <div className="holographic pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
          {/* Corner radial */}
          <div
            className="pointer-events-none absolute top-0 right-0 h-40 w-40 opacity-[0.05] transition-opacity duration-500 group-hover:opacity-[0.14]"
            style={{
              background: `radial-gradient(circle at top right, ${accent}, transparent 65%)`,
            }}
          />

          {/* Tag + Number row */}
          <div className="relative z-10 mb-3 flex items-center justify-between">
            <span
              className="font-poppins rounded-sm px-2.5 py-1 text-[10px] font-bold tracking-widest uppercase"
              style={{
                color: accent,
                background: accentA(0.09),
                border: `1px solid ${accentA(0.24)}`,
              }}
            >
              {project.tag}
            </span>
            <span
              className="font-poppins leading-none font-bold tabular-nums opacity-[0.12] transition-opacity duration-300 group-hover:opacity-[0.3]"
              style={{
                color: accent,
                fontSize: size === 'lg' ? '2.5rem' : '1.75rem',
              }}
            >
              {project.number}
            </span>
          </div>

          {/* Title */}
          <h3
            className={`font-poppins text-neutral-90 relative z-10 mb-2 leading-snug font-bold transition-colors group-hover:text-neutral-100 ${
              size === 'lg' ? 'text-xl md:text-2xl' : 'text-base'
            }`}
          >
            {project.title}
          </h3>

          {/* Description */}
          <p
            className={`text-neutral-60 relative z-10 flex-1 leading-relaxed ${
              size === 'lg' ? 'text-sm' : 'text-xs'
            }`}
          >
            {project.description}
          </p>

          {/* Explore CTA */}
          <div
            className="font-poppins relative z-10 mt-4 flex w-fit items-center gap-1.5 text-xs tracking-widest uppercase transition-transform duration-300 group-hover:translate-x-1.5 lg:text-sm"
            style={{ color: accent }}
          >
            <span>Explore</span>
            <ExternalLink className="h-3 w-3" />
          </div>
        </div>

        {/* Bottom sweep line */}
        <div
          className="absolute bottom-0 left-0 h-px w-0 transition-all duration-700 group-hover:w-full"
          style={{ background: `linear-gradient(to right, ${accent}, transparent)` }}
        />
      </div>
    </Link>
  );
}

export function FeaturedProjects() {
  const [p1, p2, p3, p4] = FEATURED_PROJECTS;

  return (
    <section className="relative overflow-hidden px-6 py-24 md:px-12 lg:px-20">
      <div className="cyber-grid-dense pointer-events-none absolute inset-0 opacity-20" />
      <div className="bg-secondary-50/3 pointer-events-none absolute top-0 left-1/3 h-80 w-96 rounded-full blur-3xl" />

      <div className="relative z-10 mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-16 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <p className="section-label animate-fade-in mb-3">Featured Work</p>
            <h2 className="font-poppins animate-slide-up text-4xl font-bold [animation-delay:80ms] md:text-5xl">
              MuslimPro <span className="neon-cyan">Platform</span>
            </h2>
            <p className="text-neutral-70 animate-slide-up mt-3 max-w-xl text-sm leading-relaxed [animation-delay:150ms]">
              Full-stack delivery across prayer, giving, streaming and calendar — driving real-world
              impact at scale.
            </p>
          </div>
          <Link
            href="/projects"
            className="font-poppins text-neutral-60 hover:text-primary-50 group animate-fade-in hidden shrink-0 items-center gap-2 text-xs tracking-widest uppercase transition-colors duration-200 [animation-delay:200ms] sm:flex lg:text-sm"
          >
            <span>View all projects</span>
            <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
        </div>

        {/*
          Asymmetric 5-col grid:
          Left  (3 cols): 01 large + 03 small
          Right (2 cols): 02 small + 04 large
          Creates a visual rhythm — alternating emphasis
        */}
        <div className="grid gap-4 md:grid-cols-5">
          <div className="flex flex-col gap-4 md:col-span-3">
            <ProjectCard project={p1} size="lg" animDelay={0} />
            <ProjectCard project={p3} size="sm" animDelay={200} />
          </div>
          <div className="flex flex-col gap-4 md:col-span-2">
            <ProjectCard project={p2} size="sm" animDelay={100} />
            <ProjectCard project={p4} size="lg" animDelay={300} />
          </div>
        </div>

        {/* Mobile link */}
        <div className="mt-8 flex justify-center sm:hidden">
          <Link
            href="/projects"
            className="font-poppins text-neutral-60 hover:text-primary-50 group flex items-center gap-2 text-xs tracking-widest uppercase transition-colors duration-200 lg:text-sm"
          >
            <span>View all projects</span>
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
}
