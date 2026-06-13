import { ProjectCard } from '../reusable/project-card';
import { PROJECTS } from '@/lib/data/projects';

export function ProjectsGrid() {
  return (
    <section className="cyber-grid-dense relative px-6 py-24 md:px-12 lg:px-20">
      <div className="pointer-events-none absolute inset-0">
        <div className="bg-primary-50/4 animate-glow-pulse absolute top-0 left-1/4 h-96 w-96 rounded-full blur-3xl" />
        <div className="bg-secondary-50/4 animate-float-slow absolute right-1/4 bottom-0 h-96 w-96 rounded-full blur-3xl" />
      </div>
      <div className="relative z-10 mx-auto max-w-6xl">
        <div className="animate-slide-right mb-20">
          <p className="section-label mb-3">Portfolio</p>
          <h1 className="font-space-grotesk mb-6 text-5xl font-bold md:text-6xl">
            Projects &amp; <span className="neon-green">Work</span>
          </h1>
          <p className="text-neutral-70 max-w-2xl text-base leading-relaxed">
            Production work spanning full-stack feature delivery, backend microservices, enterprise
            frontend systems, and automated testing — from MuslimPro to IPEX AG.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {PROJECTS.map((project, index) => (
            <ProjectCard key={project.id} {...project} delay={index * 75} />
          ))}
        </div>
      </div>
    </section>
  );
}
