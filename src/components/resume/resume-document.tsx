import { Download, GraduationCap, Mail, MapPin, Phone } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { buttonClass } from '@/components/ui/button';
import { Container, Eyebrow } from '@/components/ui/section';
import {
  CountUp,
  DrawLine,
  Enter,
  ScrollRail,
  Stagger,
  StaggerItem,
  WordReveal,
} from '@/components/ui/motion';
import { SocialIcon } from '@/components/reusable/social-icon';
import { PrintButton } from '@/components/resume/print-button';
import { CV_DATA } from '@/lib/cv-data';
import { RESUME_PDF_PATH } from '@/lib/site';
import type { Locale } from '@/i18n/config';
import { getDictionary } from '@/i18n/server';

/** Section label with a rule that draws in; must sit inside a <Stagger>. */
function Heading({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <StaggerItem
      as="h2"
      direction="left"
      id={id}
      className="mb-6 flex items-center gap-3 font-mono text-xs font-medium tracking-wider text-fg-subtle uppercase"
    >
      {children}
      <DrawLine className="flex-1 bg-line" />
    </StaggerItem>
  );
}

function AsideCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="h-full rounded-2xl border border-line bg-surface p-6 shadow-card transition-colors duration-300 hover:border-line-strong print:border-0 print:p-0 print:shadow-none">
      <h2 className="mb-4 font-mono text-[11px] font-medium tracking-wider text-fg-subtle uppercase">
        {title}
      </h2>
      {children}
    </section>
  );
}

export function ResumeDocument({ lang }: { lang: Locale }) {
  const { t, cv } = getDictionary(lang);
  const skillGroups = [
    { label: t.resume.skillGroups.frontendBackend, items: cv.technicalSkills.frontendBackend },
    {
      label: t.resume.skillGroups.dataInfrastructure,
      items: cv.technicalSkills.dataInfrastructure,
    },
    { label: t.resume.skillGroups.testingGrowth, items: cv.technicalSkills.testingGrowth },
  ];

  const contacts: {
    key: string;
    icon: React.ReactNode;
    label: string;
    href?: string;
    external?: boolean;
  }[] = [
    {
      key: 'email',
      icon: <Mail className="size-4" />,
      label: CV_DATA.email,
      href: `mailto:${CV_DATA.email}`,
    },
    {
      key: 'phone',
      icon: <Phone className="size-4" />,
      label: CV_DATA.phone,
      href: `tel:${CV_DATA.phone.replace(/\s/g, '')}`,
    },
    { key: 'location', icon: <MapPin className="size-4" />, label: cv.location },
    {
      key: 'github',
      icon: <SocialIcon icon="github" className="size-4" />,
      label: CV_DATA.github.replace('https://', ''),
      href: CV_DATA.github,
      external: true,
    },
    {
      key: 'linkedin',
      icon: <SocialIcon icon="linkedin" className="size-4" />,
      label: CV_DATA.linkedin.replace('https://', ''),
      href: CV_DATA.linkedin,
      external: true,
    },
  ];

  return (
    <>
      <header className="relative isolate overflow-hidden">
        <div
          aria-hidden
          className="bg-grid absolute inset-x-0 -top-20 -z-10 h-120 opacity-60 print:hidden"
        />
        <Container className="pt-10 pb-12 sm:pt-16 print:pt-0 print:pb-6">
          {/* Above the fold: CSS entrances so the name paints without waiting for JS. */}
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-4">
              <Enter direction="left">
                <Eyebrow>{t.resume.eyebrow}</Eyebrow>
              </Enter>
              <WordReveal
                as="h1"
                text={CV_DATA.name}
                dir="ltr"
                trigger="mount"
                delay={0.1}
                stagger={0.07}
                className="text-4xl leading-[1.05] font-extrabold tracking-[-0.03em] text-fg sm:text-6xl rtl:text-right"
              />
              <Enter as="p" delay={0.3} className="text-lg font-medium text-primary-text">
                {cv.role}
              </Enter>
              <ul className="flex flex-wrap gap-x-6 gap-y-2 pt-1 text-sm text-fg-muted">
                {contacts.map((contact, i) => (
                  <Enter
                    as="li"
                    key={contact.key}
                    direction="right"
                    delay={0.4 + i * 0.05}
                    className="group inline-flex items-center gap-2"
                  >
                    <span className="text-fg-subtle transition-colors duration-300 group-hover:text-primary-text">
                      {contact.icon}
                    </span>
                    {contact.href ? (
                      <a
                        href={contact.href}
                        {...(contact.external
                          ? { target: '_blank', rel: 'noopener noreferrer' }
                          : {})}
                        className="inline-block py-1 transition-colors hover:text-fg"
                      >
                        <bdi>{contact.label}</bdi>
                      </a>
                    ) : (
                      <bdi>{contact.label}</bdi>
                    )}
                  </Enter>
                ))}
              </ul>
            </div>
            <div className="flex shrink-0 gap-3 print:hidden">
              <Enter direction="scale" delay={0.5}>
                <a href={RESUME_PDF_PATH} download className={buttonClass()}>
                  <Download className="size-4 transition-transform group-hover:translate-y-0.5" />
                  {t.resume.downloadPdf}
                </a>
              </Enter>
              <Enter direction="scale" delay={0.58}>
                <PrintButton label={t.resume.print} />
              </Enter>
            </div>
          </div>
        </Container>
      </header>

      <Container className="grid gap-12 pb-20 sm:pb-28 lg:grid-cols-12 lg:gap-14 print:block print:pb-0">
        <div className="space-y-16 lg:col-span-8 print:space-y-8">
          {/* Above the fold. The summary is the LCP element, so it paints statically. */}
          <section aria-labelledby="profile-heading">
            <Enter direction="left" delay={0.45}>
              <Heading id="profile-heading">{t.resume.profile}</Heading>
            </Enter>
            <p className="text-base leading-relaxed text-fg-muted sm:text-lg">{cv.summary}</p>
          </section>

          <section aria-labelledby="experience-heading">
            <Stagger>
              <Heading id="experience-heading">{t.resume.experience}</Heading>
            </Stagger>
            <ol className="relative space-y-12 ps-6 sm:ps-8 print:space-y-6 print:border-s print:border-line">
              <ScrollRail className="inset-s-0 print:hidden" />
              {cv.experience.map((job) => (
                <li key={job.company} className="relative break-inside-avoid">
                  <Stagger stagger={0.06}>
                    <StaggerItem
                      direction="scale"
                      className="absolute -inset-s-7.25 top-1.5 size-2.5 rounded-full border-2 border-bg bg-primary ring-4 ring-primary/15 sm:-inset-s-9.25"
                    />
                    <StaggerItem
                      direction="right"
                      className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4"
                    >
                      <h3 className="text-lg font-bold tracking-tight text-fg sm:text-xl">
                        {job.title}
                        <span className="block font-semibold text-fg-muted sm:inline">
                          <span className="hidden sm:inline"> · </span>
                          <bdi>{job.company}</bdi>
                        </span>
                      </h3>
                      <p className="shrink-0 font-mono text-xs text-primary-text">{job.period}</p>
                    </StaggerItem>
                    <StaggerItem
                      as="p"
                      direction="right"
                      className="mt-1 font-mono text-[11px] text-fg-subtle"
                    >
                      {job.location}
                    </StaggerItem>
                    <Stagger as="ul" trigger="inherit" stagger={0.05} className="mt-5 space-y-3">
                      {job.achievements.map((item) => (
                        <StaggerItem
                          as="li"
                          key={item}
                          direction="left"
                          className="relative ps-5 text-sm leading-relaxed text-fg-muted transition-colors duration-300 before:absolute before:inset-s-0 before:top-[0.6em] before:size-1.5 before:rotate-45 before:bg-primary/70 before:transition-transform before:duration-500 hover:text-fg hover:before:rotate-225"
                        >
                          {item}
                        </StaggerItem>
                      ))}
                    </Stagger>
                    <Stagger
                      as="ul"
                      trigger="inherit"
                      stagger={0.03}
                      className="mt-5 flex flex-wrap gap-1.5"
                      aria-label={t.common.technologies}
                    >
                      {job.skills.map((skill) => (
                        <StaggerItem as="li" key={skill} direction="scale">
                          <Badge>{skill}</Badge>
                        </StaggerItem>
                      ))}
                    </Stagger>
                  </Stagger>
                </li>
              ))}
            </ol>
          </section>

          <Stagger stagger={0.1}>
            <section aria-labelledby="education-heading">
              <Heading id="education-heading">{t.resume.education}</Heading>
              {cv.education.map((edu) => (
                <div key={edu.degree} className="group flex gap-4">
                  <StaggerItem
                    as="span"
                    direction="scale"
                    className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-line bg-surface-2 text-primary-text transition-colors duration-300 group-hover:border-primary/40 group-hover:bg-primary/10"
                  >
                    <GraduationCap className="size-5 transition-transform duration-500 ease-out-expo group-hover:-rotate-12" />
                  </StaggerItem>
                  <StaggerItem direction="right">
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
                      <h3 className="text-lg font-bold tracking-tight text-fg">{edu.degree}</h3>
                      <p className="shrink-0 font-mono text-xs text-primary-text">{edu.period}</p>
                    </div>
                    <p className="text-sm font-medium text-fg-muted">
                      {edu.institution} · {edu.location}
                    </p>
                    <p className="mt-3 text-sm leading-relaxed text-fg-muted">{edu.highlights}</p>
                  </StaggerItem>
                </div>
              ))}
            </section>
          </Stagger>
        </div>

        <aside className="lg:col-span-4 print:mt-8">
          <Stagger
            stagger={0.12}
            delay={0.2}
            className="grid gap-5 md:grid-cols-2 lg:sticky lg:top-28 lg:block lg:space-y-5"
          >
            <StaggerItem direction="right">
              <AsideCard title={t.resume.atAGlance}>
                <dl className="grid grid-cols-2 gap-4">
                  {cv.stats.map((stat) => (
                    <div key={stat.label} className="flex flex-col">
                      <dt className="order-2 mt-0.5 font-mono text-[11px] tracking-wider text-fg-subtle uppercase">
                        {stat.label}
                      </dt>
                      <dd className="order-1 font-heading text-2xl font-extrabold tracking-tight text-fg">
                        <CountUp value={stat.numeric} suffix={stat.suffix} />
                      </dd>
                    </div>
                  ))}
                </dl>
              </AsideCard>
            </StaggerItem>

            <StaggerItem direction="right" className="md:order-last md:col-span-2 lg:order-0">
              <AsideCard title={t.resume.skills}>
                <div className="space-y-5">
                  {skillGroups.map((group) => (
                    <div key={group.label}>
                      <p className="mb-2 text-sm font-semibold text-fg">{group.label}</p>
                      <Stagger as="ul" stagger={0.025} className="flex flex-wrap gap-1.5">
                        {group.items.map((item) => (
                          <StaggerItem as="li" key={item} direction="scale">
                            <Badge className="transition-colors duration-300 hover:border-primary/40 hover:text-fg">
                              {item}
                            </Badge>
                          </StaggerItem>
                        ))}
                      </Stagger>
                    </div>
                  ))}
                </div>
              </AsideCard>
            </StaggerItem>

            <StaggerItem direction="right">
              <AsideCard title={t.resume.achievements}>
                <Stagger as="ul" stagger={0.08} className="space-y-4">
                  {cv.competitiveProgramming.items.map((item) => {
                    const Icon = item.icon;
                    return (
                      <StaggerItem
                        as="li"
                        key={item.title}
                        direction="left"
                        className="group flex gap-3"
                      >
                        <Icon className="mt-0.5 size-4 shrink-0 text-primary-text transition-transform duration-500 ease-out-expo group-hover:scale-125 group-hover:-rotate-12" />
                        <div>
                          <p className="text-sm font-semibold text-fg">{item.title}</p>
                          <p className="mt-0.5 text-xs leading-relaxed text-fg-muted">
                            {item.description}
                          </p>
                        </div>
                      </StaggerItem>
                    );
                  })}
                </Stagger>
              </AsideCard>
            </StaggerItem>
          </Stagger>
        </aside>
      </Container>
    </>
  );
}
