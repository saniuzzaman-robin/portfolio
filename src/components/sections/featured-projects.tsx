'use client';

import { ArrowRight, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import { FEATURED_PROJECTS } from '@/lib/data/featured-projects';
import { av, ava, type AccentToken } from '@/lib/accent';
import { SectionHeader } from '@/components/ui/section-header';
import { FadeInUp, StaggerContainer, StaggerItem } from '@/components/ui/motion-wrapper';

function ProjectCard({
  project,
  index,
}: {
  project: (typeof FEATURED_PROJECTS)[0];
  index: number;
}) {
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
        <div className="glass relative overflow-hidden rounded-2xl p-6 transition-all duration-500 hover:shadow-xl hover:shadow-black/5 dark:hover:shadow-black/20">
          {/* Hover gradient sweep */}
          <div
            className="pointer-events-none absolute -inset-x-20 -top-20 -bottom-20 -translate-x-full skew-x-12 opacity-0 transition-all duration-700 group-hover:translate-x-full group-hover:opacity-100"
            style={{
              background: `linear-gradient(90deg, transparent, ${accentA(0.06)}, transparent)`,
            }}
          />

          <div className="relative z-10">
            {/* Tag + Number */}
            <div className="mb-4 flex items-center justify-between">
              <span
                className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold"
                style={{
                  color: accent,
                  background: accentA(0.1),
                }}
              >
                {project.tag}
              </span>
              <span
                className="text-3xl leading-none font-extrabold tabular-nums transition-all duration-300 group-hover:scale-110"
                style={{ color: accentA(0.15) }}
              >
                {project.number}
              </span>
            </div>

            {/* Title */}
            <h3
              className={`text-midnight-950 group-hover:text-midnight-950 mb-2 font-bold transition-colors ${
                isLarge ? 'text-xl md:text-2xl' : 'text-base md:text-lg'
              }`}
            >
              {project.title}
            </h3>

            {/* Description */}
            <p
              className={`text-midnight-500 mb-4 leading-relaxed ${
                isLarge ? 'text-sm' : 'text-xs'
              }`}
            >
              {project.description}
            </p>

            {/* CTA */}
            <div
              className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-wider uppercase transition-all duration-300 group-hover:translate-x-1"
              style={{ color: accent }}
            >
              <span>Explore</span>
              <ExternalLink className="h-3 w-3 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </div>
          </div>
        </div>
      </motion.a>
    </StaggerItem>
  );
}

export function FeaturedProjects() {
  return (
    <section className="relative overflow-hidden px-6 py-24 md:px-12 lg:px-20">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="aurora-blob aurora-blob-secondary absolute top-10 right-1/4 h-87.5 w-87.5 opacity-10" />
        <div
          className="aurora-blob aurora-blob-primary absolute bottom-10 left-1/3 h-75 w-75 opacity-10"
          style={{ animationDelay: '-5s' }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl">
        <div className="mb-12 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <SectionHeader
            label="Featured Work"
            title={
              <>
                MuslimPro <span className="gradient-text">Platform</span>
              </>
            }
            description="Full-stack delivery across prayer, giving, streaming and calendar — driving real-world impact at scale."
          />
          <FadeInUp>
            <motion.a
              href="/projects"
              className="group text-midnight-500 hover:text-aurora-green inline-flex shrink-0 items-center gap-2 text-sm font-medium transition-colors"
              whileHover={{ x: 4 }}
            >
              View all projects
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
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
            className="group text-midnight-500 hover:text-aurora-green inline-flex items-center gap-2 text-sm font-medium transition-colors"
          >
            View all projects
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </a>
        </FadeInUp>
      </div>
    </section>
  );
}
