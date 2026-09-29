'use client';

import { useMemo, useState } from 'react';
import { AnimatePresence, m } from 'framer-motion';
import { Container } from '@/components/ui/section';
import { ProjectCard } from '@/components/projects/project-card';
import { EASE_OUT_EXPO, Enter } from '@/components/ui/motion';
import { useDictionary } from '@/i18n/provider';
import { cn } from '@/lib/cn';

/** Sentinel for the unfiltered view (kept apart from translated category names). */
const ALL = '';

export function ProjectsExplorer() {
  const { t, projects } = useDictionary();
  const [category, setCategory] = useState(ALL);
  // First paint staggers the whole grid in; later filter changes animate immediately.
  const [hasFiltered, setHasFiltered] = useState(false);

  const categories = useMemo(() => {
    const counts = new Map<string, number>([[ALL, projects.length]]);
    projects.forEach((p) => counts.set(p.category, (counts.get(p.category) ?? 0) + 1));
    return [...counts.entries()];
  }, [projects]);

  const visible = category === ALL ? projects : projects.filter((p) => p.category === category);

  return (
    <section aria-label={t.projects.section} className="pb-20 sm:pb-28">
      <Container>
        <h2 className="sr-only">{t.projects.heading}</h2>
        <Enter
          delay={0.45}
          role="group"
          aria-label={t.projects.filter}
          className="mb-8 no-scrollbar flex w-fit max-w-full gap-1 overflow-x-auto rounded-full border border-line bg-surface-2 p-1"
        >
          {categories.map(([name, count]) => {
            const active = name === category;
            return (
              <button
                key={name}
                type="button"
                aria-pressed={active}
                onClick={() => {
                  setCategory(name);
                  setHasFiltered(true);
                }}
                className={cn(
                  'relative flex shrink-0 cursor-pointer items-center gap-2 rounded-full px-3 py-2 text-xs font-semibold transition-colors sm:px-4',
                  active ? 'text-primary-fg' : 'text-fg-muted hover:text-fg'
                )}
              >
                {active && (
                  <m.span
                    layoutId="project-filter-pill"
                    className="absolute inset-0 rounded-full bg-primary-strong"
                    transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                  />
                )}
                <span className="relative">{name === ALL ? t.projects.all : name}</span>
                <span
                  className={cn(
                    'relative font-mono text-[10px]',
                    active ? 'text-primary-fg' : 'text-fg-subtle'
                  )}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </Enter>

        <m.ul layout className="grid gap-4 sm:grid-cols-2 md:gap-5 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {visible.map((project, i) => (
              <m.li
                key={project.id}
                layout
                // First paint: CSS entrance (no hydration wait). Filter changes: JS.
                initial={hasFiltered ? { opacity: 0, scale: 0.96 } : false}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.3, ease: EASE_OUT_EXPO }}
                className={hasFiltered ? undefined : 'enter enter-up'}
                style={
                  hasFiltered
                    ? undefined
                    : ({ '--enter-delay': `${0.5 + i * 0.07}s` } as React.CSSProperties)
                }
              >
                <ProjectCard
                  project={project}
                  labels={{ internal: t.projects.internal, technologies: t.common.technologies }}
                />
              </m.li>
            ))}
          </AnimatePresence>
        </m.ul>
      </Container>
    </section>
  );
}
