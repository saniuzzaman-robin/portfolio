import { Section } from '@/components/ui/section';
import { CountUp, Stagger, StaggerItem } from '@/components/ui/motion';
import { SpotlightCard } from '@/components/ui/spotlight-card';
import { SKILL_DOMAINS } from '@/lib/data/skills';
import { CV_DATA } from '@/lib/cv-data';

const PROBLEMS_SOLVED = CV_DATA.stats.find((stat) => stat.label === 'Problems Solved');

export function Capabilities() {
  // First item is the problem-solving headline; the rest are supporting achievements.
  const [headline, ...supporting] = CV_DATA.competitiveProgramming.items;

  return (
    <Section
      id="capabilities"
      index="03"
      label="Capabilities"
      title="Production architecture,"
      accent="rooted in algorithms."
      description="A dual foundation: years of shipping distributed systems, and a competitive-programming habit that sharpens every design decision."
      className="border-t border-line"
    >
      <Stagger stagger={0.1} className="grid gap-4 md:grid-cols-2 md:gap-5">
        {SKILL_DOMAINS.map((domain) => {
          const Icon = domain.icon;
          return (
            <StaggerItem key={domain.id} direction="scale">
              <SpotlightCard className="group h-full p-6 sm:p-7">
                <div className="flex items-start gap-4">
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-line bg-surface-2 text-primary-text transition-all duration-500 ease-out-expo group-hover:scale-110 group-hover:-rotate-6 group-hover:border-primary/40 group-hover:bg-primary/10">
                    <Icon className="size-5" />
                  </span>
                  <div>
                    <h3 className="text-lg font-bold tracking-tight text-fg">{domain.title}</h3>
                    <p className="mt-0.5 font-mono text-[11px] text-primary-text">{domain.badge}</p>
                  </div>
                </div>
                <p className="mt-5 text-sm leading-relaxed text-fg-muted">{domain.description}</p>
                <Stagger
                  as="dl"
                  stagger={0.05}
                  delay={0.15}
                  className="mt-5 divide-y divide-dashed divide-line border-t border-dashed border-line"
                >
                  {domain.technologies.map((tech) => (
                    <StaggerItem
                      key={tech.name}
                      direction="left"
                      className="group/row flex items-baseline justify-between gap-4 py-2.5"
                    >
                      <dt className="text-sm text-fg transition-transform duration-300 ease-out-expo group-hover/row:translate-x-1">
                        {tech.name}
                      </dt>
                      <dd className="shrink-0 rounded px-1.5 font-mono text-[11px] tracking-wide text-fg-subtle uppercase transition-colors duration-300 group-hover/row:bg-primary/10 group-hover/row:text-primary-text">
                        {tech.level}
                      </dd>
                    </StaggerItem>
                  ))}
                </Stagger>
              </SpotlightCard>
            </StaggerItem>
          );
        })}
      </Stagger>

      {/* Compact algorithms strip: supporting context, not a headline. */}
      <Stagger className="mt-5">
        <StaggerItem>
          <div className="relative overflow-hidden rounded-2xl border border-line bg-surface p-6 shadow-card sm:p-7">
            <div
              aria-hidden
              className="bg-dots absolute inset-0 [mask-image:linear-gradient(to_left,#000,transparent_50%)] opacity-40"
            />
            <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:gap-10">
              <Stagger trigger="inherit" stagger={0.08} className="lg:w-2/5 lg:shrink-0">
                <StaggerItem
                  as="p"
                  direction="left"
                  className="font-mono text-[11px] tracking-wider text-fg-subtle uppercase"
                >
                  Algorithms &amp; problem solving
                </StaggerItem>
                <StaggerItem as="p" className="mt-2 text-xl font-bold tracking-tight text-fg">
                  <span className="text-primary-text">
                    {PROBLEMS_SOLVED ? (
                      <CountUp value={PROBLEMS_SOLVED.numeric} suffix={PROBLEMS_SOLVED.suffix} />
                    ) : (
                      '1,700+'
                    )}
                  </span>{' '}
                  problems solved
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
                      className="group flex gap-3 rounded-xl border border-line bg-bg/60 p-4 backdrop-blur-sm transition-colors duration-300 hover:border-primary/40"
                    >
                      <Icon className="mt-0.5 size-4 shrink-0 text-primary-text transition-transform duration-500 ease-out-expo group-hover:scale-125 group-hover:rotate-[-8deg]" />
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
