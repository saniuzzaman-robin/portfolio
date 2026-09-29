import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Section } from '@/components/ui/section';
import { Stagger, StaggerItem } from '@/components/ui/motion';
import { buttonClass } from '@/components/ui/button';
import { ProjectCard, hasPublicLink } from '@/components/projects/project-card';
import { PROJECTS } from '@/lib/data/projects';

const FEATURED = PROJECTS.filter(hasPublicLink).slice(0, 4);
// Bento rhythm: wide, narrow / narrow, wide.
const SPANS = ['lg:col-span-4', 'lg:col-span-2', 'lg:col-span-2', 'lg:col-span-4'];

export function SelectedWork() {
  return (
    <Section
      id="work"
      index="01"
      label="Selected work"
      title="Production platforms, shipped to millions."
      description="A few of the systems I've designed and built — from geolocation microservices to a re-platformed donation engine."
      action={
        <Link href="/projects" className={buttonClass({ variant: 'secondary' })}>
          All platforms
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      }
    >
      <Stagger stagger={0.1} className="grid gap-4 sm:grid-cols-2 md:gap-5 lg:grid-cols-6">
        {FEATURED.map((project, i) => (
          <StaggerItem key={project.id} direction="scale" className={SPANS[i % SPANS.length]}>
            <ProjectCard project={project} featured={SPANS[i % SPANS.length] === 'lg:col-span-4'} />
          </StaggerItem>
        ))}
      </Stagger>
    </Section>
  );
}
