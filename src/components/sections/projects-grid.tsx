import { ProjectCard } from '../reusable/project-card';
import { PROJECTS } from '@/lib/data/projects';

export function ProjectsGrid() {
  return (
    <section className="px-6 py-24 md:px-12 lg:px-20 relative cyber-grid-dense">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-50/4 rounded-full blur-3xl animate-glow-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary-50/4 rounded-full blur-3xl animate-float-slow" />
      </div>
      <div className="max-w-6xl mx-auto relative z-10">
        <div className="mb-20 animate-slide-right">
          <p className="section-label mb-3">Portfolio</p>
          <h1 className="font-space-grotesk text-5xl md:text-6xl font-bold mb-6">
            Projects &amp; <span className="neon-green">Work</span>
          </h1>
          <p className="text-neutral-70 text-base max-w-2xl leading-relaxed">
            Production work spanning full-stack feature delivery, backend microservices, enterprise
            frontend systems, and automated testing — from MuslimPro to IPEX AG.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {PROJECTS.map((project, index) => (
            <ProjectCard key={project.id} {...project} delay={index * 75} />
          ))}
        </div>
      </div>
    </section>
  );
}
