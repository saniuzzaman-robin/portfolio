'use client';

import { ProjectCard } from '../reusable/project-card';
import { PROJECTS } from '@/lib/data/projects';

export function ProjectsGrid() {
  return (
    <section className="px-6 py-24 md:px-12 lg:px-20">
      <div className="max-w-6xl mx-auto">
        <div className="mb-20 animate-slide-right">
          <h1 className="font-space-grotesk text-5xl md:text-6xl font-bold mb-6">
            Projects & Work
          </h1>
          <p className="text-neutral-70 text-lg max-w-2xl">
            A collection of projects showcasing my expertise across full-stack development, system
            design, and problem-solving.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {PROJECTS.map((project, index) => (
            <ProjectCard key={project.id} {...project} delay={index * 75} />
          ))}
        </div>
      </div>
    </section>
  );
}
