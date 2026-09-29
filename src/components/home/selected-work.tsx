import { LocaleLink } from '@/components/ui/locale-link';
import { ArrowRight } from 'lucide-react';
import { Section } from '@/components/ui/section';
import { Stagger, StaggerItem } from '@/components/ui/motion';
import { buttonClass } from '@/components/ui/button';
import { ProjectCard, hasPublicLink } from '@/components/projects/project-card';
import type { Locale } from '@/i18n/config';
import { getDictionary } from '@/i18n/server';
// Bento rhythm: wide, narrow / narrow, wide.
const SPANS = ['lg:col-span-4', 'lg:col-span-2', 'lg:col-span-2', 'lg:col-span-4'];

export function SelectedWork({ lang }: { lang: Locale }) {
  const { t, projects } = getDictionary(lang);
  const featured = projects.filter(hasPublicLink).slice(0, 4);
  return (
    <Section
      id="work"
      index="01"
      label={t.selectedWork.label}
      title={t.selectedWork.title}
      description={t.selectedWork.description}
      action={
        <LocaleLink href="/projects" className={buttonClass({ variant: 'secondary' })}>
          {t.selectedWork.all}
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5 rtl:-scale-x-100 rtl:group-hover:-translate-x-0.5" />
        </LocaleLink>
      }
    >
      <Stagger stagger={0.1} className="grid gap-4 sm:grid-cols-2 md:gap-5 lg:grid-cols-6">
        {featured.map((project, i) => (
          <StaggerItem key={project.id} direction="scale" className={SPANS[i % SPANS.length]}>
            <ProjectCard
              project={project}
              featured={SPANS[i % SPANS.length] === 'lg:col-span-4'}
              labels={{ internal: t.projects.internal, technologies: t.common.technologies }}
            />
          </StaggerItem>
        ))}
      </Stagger>
    </Section>
  );
}
