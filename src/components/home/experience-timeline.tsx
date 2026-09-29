'use client';

import { LocaleLink } from '@/components/ui/locale-link';
import { m } from 'framer-motion';
import { ArrowRight, MapPin } from 'lucide-react';
import { Section } from '@/components/ui/section';
import { ScrollRail, Stagger, StaggerItem } from '@/components/ui/motion';
import { Badge } from '@/components/ui/badge';
import { buttonClass } from '@/components/ui/button';
import { useDictionary } from '@/i18n/provider';

export function ExperienceTimeline() {
  const { t, cv } = useDictionary();
  return (
    <Section
      id="experience"
      index="02"
      label={t.experience.label}
      title={t.experience.title}
      accent={t.experience.accent}
      description={t.experience.description}
      action={
        <LocaleLink href="/resume" className={buttonClass({ variant: 'secondary' })}>
          {t.experience.fullResume}
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5 rtl:-scale-x-100 rtl:group-hover:-translate-x-0.5" />
        </LocaleLink>
      }
      className="border-t border-line"
    >
      <ol className="relative ps-7 sm:ps-10">
        <ScrollRail className="start-[5px]" />

        {cv.experience.map((job) => {
          const isCurrent = job.endDate === null;
          return (
            <li key={job.company} className="relative">
              <m.span
                aria-hidden
                initial={{ scale: 0, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true, margin: '-120px' }}
                transition={{ type: 'spring', stiffness: 380, damping: 18 }}
                className="absolute -start-7 top-11 flex size-[11px] items-center justify-center sm:-start-10"
              >
                <span className="absolute inset-0 rounded-full bg-primary/25" />
                {isCurrent && (
                  <span className="absolute inset-0 animate-ping rounded-full bg-primary/40" />
                )}
                <span className="relative size-[7px] rounded-full bg-primary" />
              </m.span>

              <Stagger
                stagger={0.1}
                className="grid gap-6 border-t border-line py-10 lg:grid-cols-12 lg:gap-10"
              >
                <StaggerItem direction="left" className="lg:col-span-4">
                  <div className="lg:sticky lg:top-28">
                    <p className="flex items-center gap-2 font-mono text-xs text-primary-text">
                      {job.period}
                      {isCurrent && (
                        <Badge tone="success" className="rounded-full py-0 text-[10px]">
                          {t.experience.current}
                        </Badge>
                      )}
                    </p>
                    <h3 className="mt-3 text-xl font-bold tracking-tight text-fg sm:text-2xl">
                      <bdi>{job.company}</bdi>
                    </h3>
                    <p className="mt-1 text-sm font-medium text-fg-muted">{job.title}</p>
                    <p className="mt-3 inline-flex items-center gap-1.5 font-mono text-[11px] text-fg-subtle">
                      <MapPin className="size-3" />
                      {job.location}
                    </p>
                  </div>
                </StaggerItem>

                <div className="space-y-6 lg:col-span-8">
                  <StaggerItem as="p" className="text-base leading-relaxed text-fg-muted">
                    {job.summary}
                  </StaggerItem>

                  <div>
                    <StaggerItem
                      as="p"
                      direction="fade"
                      className="mb-3 font-mono text-[11px] tracking-wider text-fg-subtle uppercase"
                    >
                      {t.experience.focusAreas}
                    </StaggerItem>
                    <Stagger
                      as="ul"
                      trigger="inherit"
                      stagger={0.06}
                      className="flex flex-wrap gap-2 sm:grid sm:grid-cols-2"
                    >
                      {job.highlights.map((highlight) => (
                        <StaggerItem
                          as="li"
                          key={highlight.topic}
                          direction="right"
                          className="group flex items-center gap-2.5 rounded-full border border-line bg-surface px-3 py-1.5 text-[13px] font-medium text-fg transition-colors duration-300 hover:border-primary/40 hover:bg-primary/5 sm:rounded-xl sm:px-4 sm:py-3 sm:text-sm"
                        >
                          <span
                            aria-hidden
                            className="size-1.5 shrink-0 rotate-45 bg-primary transition-transform duration-500 ease-out-expo group-hover:scale-125 group-hover:rotate-[225deg]"
                          />
                          {highlight.topic}
                        </StaggerItem>
                      ))}
                    </Stagger>
                  </div>

                  <Stagger
                    as="ul"
                    trigger="inherit"
                    stagger={0.03}
                    className="flex flex-wrap gap-1.5"
                    aria-label={t.common.technologies}
                  >
                    {job.skills.map((skill) => (
                      <StaggerItem as="li" key={skill} direction="scale">
                        <Badge>{skill}</Badge>
                      </StaggerItem>
                    ))}
                  </Stagger>
                </div>
              </Stagger>
            </li>
          );
        })}
      </ol>
    </Section>
  );
}
