import { Section } from '@/components/ui/section';
import { CountUp, Stagger, StaggerItem } from '@/components/ui/motion';
import { CV_DATA } from '@/lib/cv-data';
import type { Locale } from '@/i18n/config';
import { getDictionary } from '@/i18n/server';

const PROBLEMS_SOLVED = CV_DATA.stats.find((stat) => stat.label === 'Problems Solved');

export function Capabilities({ lang }: { lang: Locale }) {
  const { t, cv, skills } = getDictionary(lang);
  // First item is the problem-solving headline; the rest are supporting achievements.
  const [headline, ...supporting] = cv.competitiveProgramming.items;

  return (
    <Section
      id="capabilities"
      index="03"
      label={t.capabilities.label}
      title={t.capabilities.title}
      accent={t.capabilities.accent}
      description={t.capabilities.description}
      className="border-t border-line"
    >
      <Stagger
        stagger={0.1}
        className="divide-y divide-line overflow-hidden rounded-ss-4xl rounded-se-2xl rounded-ee-4xl rounded-es-2xl border border-line bg-surface shadow-card"
      >
        {skills.map((domain, i) => {
          const Icon = domain.icon;
          return (
            <StaggerItem
              key={domain.id}
              direction="up"
              className="group relative grid gap-4 p-5 transition-colors duration-300 hover:bg-surface-2/60 sm:p-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-10"
            >
              <span
                aria-hidden
                className="absolute inset-y-0 inset-s-0 w-0.5 origin-center scale-y-0 bg-primary transition-transform duration-500 ease-out-expo group-hover:scale-y-100"
              />
              <div className="flex gap-4">
                <span className="mt-0.5 font-mono text-xs text-fg-subtle">0{i + 1}</span>
                <div className="min-w-0">
                  <h3 className="flex items-center gap-2 text-lg font-bold tracking-tight text-fg">
                    <Icon className="size-4.5 shrink-0 text-primary-text" />
                    {domain.title}
                  </h3>
                  <p className="mt-0.5 font-mono text-[11px] text-primary-text">{domain.badge}</p>
                  <p className="mt-2.5 text-sm leading-relaxed text-fg-muted">
                    {domain.description}
                  </p>
                </div>
              </div>

              <ul className="grid content-start gap-x-8 sm:grid-cols-2">
                {domain.technologies.map((tech) => (
                  <li
                    key={tech.name}
                    className="flex items-baseline justify-between gap-3 border-b border-dashed border-line py-2 text-sm text-fg"
                  >
                    {tech.name}
                    <span className="font-mono text-[10px] tracking-wide text-fg-subtle uppercase">
                      {tech.level}
                    </span>
                  </li>
                ))}
              </ul>
            </StaggerItem>
          );
        })}
      </Stagger>

      {/* Compact algorithms strip: supporting context, not a headline. */}
      <Stagger className="mt-5">
        <StaggerItem>
          <div className="relative overflow-hidden rounded-4xl border border-line bg-surface p-6 shadow-card sm:p-7">
            <div
              aria-hidden
              className="bg-dots absolute inset-0 mask-[linear-gradient(to_left,#000,transparent_50%)] opacity-40"
            />
            <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:gap-10">
              <Stagger trigger="inherit" stagger={0.08} className="lg:w-2/5 lg:shrink-0">
                <StaggerItem
                  as="p"
                  direction="left"
                  className="font-mono text-[11px] tracking-wider text-fg-subtle uppercase"
                >
                  {t.capabilities.algorithms}
                </StaggerItem>
                <StaggerItem as="p" className="mt-2 text-xl font-bold tracking-tight text-fg">
                  <span className="text-primary-text">
                    {PROBLEMS_SOLVED ? (
                      <CountUp value={PROBLEMS_SOLVED.numeric} suffix={PROBLEMS_SOLVED.suffix} />
                    ) : (
                      '1,700+'
                    )}
                  </span>{' '}
                  {t.capabilities.problemsSolved}
                </StaggerItem>
                <StaggerItem as="p" className="mt-1.5 text-sm leading-relaxed text-fg-muted">
                  {headline.description}
                </StaggerItem>
              </Stagger>

              <Stagger
                as="ul"
                trigger="inherit"
                stagger={0.08}
                delay={0.15}
                className="grid flex-1 gap-3 sm:grid-cols-2"
              >
                {supporting.map((item) => {
                  const Icon = item.icon;
                  return (
                    <StaggerItem
                      as="li"
                      key={item.title}
                      direction="right"
                      className="group flex gap-3 rounded-ss-2xl rounded-se-md rounded-ee-2xl rounded-es-md border border-line bg-bg/60 p-4 backdrop-blur-sm transition-colors duration-300 hover:border-primary/40"
                    >
                      <Icon className="mt-0.5 size-4 shrink-0 text-primary-text transition-transform duration-500 ease-out-expo group-hover:scale-125 group-hover:-rotate-8" />
                      <div>
                        <p className="text-sm font-semibold text-fg">{item.title}</p>
                        <p className="mt-1 text-xs leading-relaxed text-fg-muted">
                          {item.description}
                        </p>
                      </div>
                    </StaggerItem>
                  );
                })}
              </Stagger>
            </div>
          </div>
        </StaggerItem>
      </Stagger>
    </Section>
  );
}
