import { ArrowUpRight, Lock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { SpotlightCard } from '@/components/ui/spotlight-card';
import type { Project } from '@/lib/data/projects';
import { cn } from '@/lib/cn';

export function hasPublicLink(project: Project): boolean {
  return project.link.startsWith('http');
}

export function ProjectCard({
  project,
  featured = false,
  labels,
  className,
}: {
  project: Project;
  featured?: boolean;
  labels: { internal: string; technologies: string };
  className?: string;
}) {
  const Icon = project.icon;
  const isPublic = hasPublicLink(project);
  const techLimit = featured ? 6 : 4;

  return (
    <SpotlightCard
      className={cn('group relative flex h-full flex-col overflow-hidden p-6 sm:p-7', className)}
    >
      {featured && (
        <Icon
          aria-hidden
          strokeWidth={1}
          className="pointer-events-none absolute -inset-e-8 -bottom-8 size-48 text-primary/6 transition-transform duration-700 ease-out-expo group-hover:scale-110 group-hover:-rotate-6"
        />
      )}

      <div className="flex items-start justify-between gap-4">
        <span className="flex size-11 items-center justify-center rounded-xl border border-line bg-surface-2 text-primary-text transition-all duration-500 ease-out-expo group-hover:scale-110 group-hover:-rotate-6 group-hover:border-primary/40 group-hover:bg-primary/10">
          <Icon className="size-5" />
        </span>
        {isPublic ? (
          <span
            aria-hidden
            className="flex size-9 items-center justify-center rounded-full border border-line text-fg-subtle transition-all duration-300 group-hover:border-primary group-hover:bg-primary group-hover:text-primary-fg"
          >
            <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:rotate-45" />
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 font-mono text-[10px] tracking-wider text-fg-subtle uppercase">
            <Lock className="size-3" />
            {labels.internal}
          </span>
        )}
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        <span className="font-mono text-[11px] tracking-wider text-fg-subtle uppercase">
          {project.category}
        </span>
        {project.impact && (
          <>
            <span aria-hidden className="text-line-strong">
              /
            </span>
            <span className="font-mono text-[11px] font-medium text-primary-text">
              {project.impact}
            </span>
          </>
        )}
      </div>

      <h3
        className={cn(
          'mt-2 font-bold tracking-tight text-fg',
          featured ? 'text-xl sm:text-2xl' : 'text-lg'
        )}
      >
        {isPublic ? (
          <a
            href={project.link}
            target="_blank"
            rel="noopener noreferrer"
            className="after:absolute after:inset-0 after:rounded-2xl focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:outline-offset-2 focus-visible:after:outline-ring"
          >
            {project.title}
          </a>
        ) : (
          project.title
        )}
      </h3>

      <p
        className={cn(
          'mt-3 text-sm leading-relaxed text-fg-muted',
          featured ? 'line-clamp-4 max-w-xl' : 'line-clamp-4'
        )}
      >
        {project.description}
      </p>

      <ul className="relative mt-auto flex flex-wrap gap-1.5 pt-6" aria-label={labels.technologies}>
        {project.technologies.slice(0, techLimit).map((tech, i) => (
          <li
            key={tech}
            style={{ transitionDelay: `${i * 35}ms` }}
            className="transition-transform duration-300 ease-out-expo group-hover:-translate-y-0.5"
          >
            <Badge>{tech}</Badge>
          </li>
        ))}
        {project.technologies.length > techLimit && (
          <li>
            <Badge className="text-fg-subtle">+{project.technologies.length - techLimit}</Badge>
          </li>
        )}
      </ul>
    </SpotlightCard>
  );
}
