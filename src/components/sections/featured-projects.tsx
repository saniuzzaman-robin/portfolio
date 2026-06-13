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
        className="relative glass overflow-hidden rounded-sm border-(--cb) hover:border-(--cb-h) hover:shadow-(--cs) transition-all duration-500 animate-scale-in flex h-full"
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
          className="w-1 shrink-0 group-hover:w-1.5 transition-all duration-300"
          style={{
            background: `linear-gradient(to bottom, ${accent}, ${accentA(0.25)})`,
          }}
        />

        {/* Card body */}
        <div className="flex-1 p-5 md:p-6 flex flex-col relative overflow-hidden">
          {/* Holographic hover */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 holographic pointer-events-none" />
          {/* Corner radial */}
          <div
            className="absolute top-0 right-0 w-40 h-40 opacity-[0.05] group-hover:opacity-[0.14] transition-opacity duration-500 pointer-events-none"
            style={{ background: `radial-gradient(circle at top right, ${accent}, transparent 65%)` }}
          />

          {/* Tag + Number row */}
          <div className="flex items-center justify-between mb-3 relative z-10">
            <span
              className="text-[10px] uppercase tracking-widest font-space-grotesk font-bold px-2.5 py-1 rounded-sm"
              style={{
                color: accent,
                background: accentA(0.09),
                border: `1px solid ${accentA(0.24)}`,
              }}
            >
              {project.tag}
            </span>
            <span
              className="font-space-grotesk font-bold tabular-nums leading-none opacity-[0.12] group-hover:opacity-[0.3] transition-opacity duration-300"
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
            className={`font-space-grotesk font-bold text-neutral-90 group-hover:text-neutral-100 transition-colors mb-2 relative z-10 leading-snug ${
              size === 'lg' ? 'text-xl md:text-2xl' : 'text-base'
            }`}
          >
            {project.title}
          </h3>

          {/* Description */}
          <p
            className={`text-neutral-60 leading-relaxed relative z-10 flex-1 ${
              size === 'lg' ? 'text-sm' : 'text-xs'
            }`}
          >
            {project.description}
          </p>

          {/* Explore CTA */}
          <div
            className="flex items-center gap-1.5 text-xs font-space-grotesk uppercase tracking-widest mt-4 group-hover:translate-x-1.5 transition-transform duration-300 relative z-10 w-fit"
            style={{ color: accent }}
          >
            <span>Explore</span>
            <ExternalLink className="w-3 h-3" />
          </div>
        </div>

        {/* Bottom sweep line */}
        <div
          className="absolute bottom-0 left-0 h-px w-0 group-hover:w-full transition-all duration-700"
          style={{ background: `linear-gradient(to right, ${accent}, transparent)` }}
        />
      </div>
    </Link>
  );
}

export function FeaturedProjects() {
  const [p1, p2, p3, p4] = FEATURED_PROJECTS;

  return (
    <section className="px-6 py-24 md:px-12 lg:px-20 relative overflow-hidden">
      <div className="absolute inset-0 cyber-grid-dense opacity-20 pointer-events-none" />
      <div className="absolute top-0 left-1/3 w-96 h-80 bg-secondary-50/3 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <div className="mb-16 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div>
            <p className="section-label mb-3 animate-fade-in">Featured Work</p>
            <h2 className="font-space-grotesk font-bold text-4xl md:text-5xl animate-slide-up [animation-delay:80ms]">
              MuslimPro <span className="neon-cyan">Platform</span>
            </h2>
            <p className="text-neutral-70 max-w-xl mt-3 text-sm leading-relaxed animate-slide-up [animation-delay:150ms]">
              Full-stack delivery across prayer, giving, streaming and calendar — driving real-world impact at scale.
            </p>
          </div>
          <Link
            href="/projects"
            className="hidden sm:flex items-center gap-2 text-xs font-space-grotesk uppercase tracking-widest text-neutral-60 hover:text-primary-50 transition-colors duration-200 group shrink-0 animate-fade-in [animation-delay:200ms]"
          >
            <span>View all projects</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-200" />
          </Link>
        </div>

        {/*
          Asymmetric 5-col grid:
          Left  (3 cols): 01 large + 03 small
          Right (2 cols): 02 small + 04 large
          Creates a visual rhythm — alternating emphasis
        */}
        <div className="grid md:grid-cols-5 gap-4">
          <div className="md:col-span-3 flex flex-col gap-4">
            <ProjectCard project={p1} size="lg" animDelay={0} />
            <ProjectCard project={p3} size="sm" animDelay={200} />
          </div>
          <div className="md:col-span-2 flex flex-col gap-4">
            <ProjectCard project={p2} size="sm" animDelay={100} />
            <ProjectCard project={p4} size="lg" animDelay={300} />
          </div>
        </div>

        {/* Mobile link */}
        <div className="mt-8 flex sm:hidden justify-center">
          <Link
            href="/projects"
            className="flex items-center gap-2 text-xs font-space-grotesk uppercase tracking-widest text-neutral-60 hover:text-primary-50 transition-colors duration-200 group"
          >
            <span>View all projects</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
}
