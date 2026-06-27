'use client';

import { ArrowRight, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import { FEATURED_PROJECTS } from '@/lib/data/featured-projects';
import { av, ava, type AccentToken } from '@/lib/accent';
import { SectionHeader } from '@/components/ui/section-header';
import { FadeInUp, StaggerContainer, StaggerItem } from '@/components/ui/motion-wrapper';

function ProjectCard({ project, index }: { project: typeof FEATURED_PROJECTS[0]; index: number }) {
  const accent = av(project.accent as AccentToken);
  const accentA = (a: number) => ava(project.accent as AccentToken, a);
  const isLarge = index === 0 || index === 3;

  return (
    <StaggerItem>
      <motion.a
        href={project.href}
        target="_blank"
        rel="noopener noreferrer"
        className="group block"
        whileHover={{ y: -4 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        <div
          className="relative overflow-hidden rounded-xl border transition-all duration-500"
          style={{
            borderColor: accentA(0.15),
            background: accentA(0.015),
          }}
        >
          {/* Hover gradient sweep */}
          <div
            className="pointer-events-none absolute -inset-x-20 -top-20 -bottom-20 -translate-x-full skew-x-12 transition-transform duration-700 group-hover:translate-x-full"
            style={{
              background: `linear-gradient(90deg, transparent, ${accentA(0.04)}, transparent)`,
            }}
          />

          {/* Top accent gradient bar */}
          <div
            className="h-1 w-full origin-left scale-x-0 transition-transform duration-500 group-hover:scale-x-100"
            style={{ background: `linear-gradient(to right, ${accent}, ${accentA(0.3)})` }}
          />

          <div className="relative p-5 md:p-6">
            {/* Tag + Number */}
            <div className="mb-4 flex items-center justify-between">
              <span
                className="font-poppins inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[10px] font-bold tracking-widest uppercase"
                style={{
                  color: accent,
                  background: accentA(0.08),
                }}
              >
                {project.tag}
              </span>
              <span
                className="font-poppins text-2xl font-black leading-none tabular-nums transition-all duration-300 group-hover:scale-110"
                style={{ color: accentA(0.15) }}
              >
                {project.number}
              </span>
            </div>

            {/* Title */}
            <h3
              className={`font-poppins text-neutral-90 mb-2 font-bold transition-colors group-hover:text-neutral-100 ${
                isLarge ? 'text-xl md:text-2xl' : 'text-base md:text-lg'
              }`}
            >
              {project.title}
            </h3>

            {/* Description */}
            <p className={`text-neutral-60 mb-4 leading-relaxed ${isLarge ? 'text-sm' : 'text-xs'}`}>
              {project.description}
            </p>

            {/* CTA */}
            <div
              className="font-poppins inline-flex items-center gap-1.5 text-xs tracking-widest uppercase transition-all duration-300 group-hover:translate-x-1"
              style={{ color: accent }}
            >
              <span>Explore</span>
              <ExternalLink className="h-3 w-3 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </div>
          </div>

          {/* Bottom glow on hover */}
          <div
            className="h-px w-0 transition-all duration-500 group-hover:w-full"
            style={{ background: `linear-gradient(to right, ${accent}, transparent)` }}
          />
        </div>
      </motion.a>
    </StaggerItem>
  );
}

export function FeaturedProjects() {
  return (
    <section className="relative overflow-hidden px-6 py-24 md:px-12 lg:px-20">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="bg-secondary-50/3 absolute top-10 right-1/4 h-80 w-80 rounded-full blur-[100px]" />
        <div className="bg-primary-50/2 absolute bottom-10 left-1/3 h-64 w-64 rounded-full blur-[80px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl">
        <div className="mb-14 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <SectionHeader
            label="Featured Work"
            title={<>MuslimPro <span className="gradient-text">Platform</span></>}
            description="Full-stack delivery across prayer, giving, streaming and calendar — driving real-world impact at scale."
          />
          <FadeInUp>
            <motion.a
              href="/projects"
              className="font-poppins text-neutral-50 hover:text-primary-50 group inline-flex shrink-0 items-center gap-2 text-xs tracking-widest uppercase transition-colors"
              whileHover={{ x: 4 }}
            >
              <span>View all projects</span>
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </motion.a>
          </FadeInUp>
        </div>

        <StaggerContainer>
          <div className="grid gap-5 md:grid-cols-5">
            <div className="flex flex-col gap-5 md:col-span-3">
              <ProjectCard project={FEATURED_PROJECTS[0]} index={0} />
              <ProjectCard project={FEATURED_PROJECTS[2]} index={2} />
            </div>
            <div className="flex flex-col gap-5 md:col-span-2">
              <ProjectCard project={FEATURED_PROJECTS[1]} index={1} />
              <ProjectCard project={FEATURED_PROJECTS[3]} index={3} />
            </div>
          </div>
        </StaggerContainer>

        {/* Mobile link */}
        <FadeInUp className="mt-8 flex justify-center sm:hidden">
          <a
            href="/projects"
            className="font-poppins text-neutral-50 hover:text-primary-50 group inline-flex items-center gap-2 text-xs tracking-widest uppercase transition-colors"
          >
            <span>View all projects</span>
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
          </a>
        </FadeInUp>
      </div>
    </section>
  );
}
