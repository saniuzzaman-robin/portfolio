'use client';

import { useRef } from 'react';
import { LocaleLink } from '@/components/ui/locale-link';
import { m, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Download, MapPin } from 'lucide-react';
import { Badge, StatusDot } from '@/components/ui/badge';
import { buttonClass } from '@/components/ui/button';
import { Container } from '@/components/ui/section';
import { CountUp, Enter, WordReveal } from '@/components/ui/motion';
import { SocialIcon } from '@/components/reusable/social-icon';
import { ProfileCard } from '@/components/home/profile-card';
import { CV_DATA } from '@/lib/cv-data';
import { RESUME_PDF_PATH } from '@/lib/site';
import { cn } from '@/lib/cn';
import { useDictionary } from '@/i18n/provider';
import { fmt } from '@/i18n/dictionary';

const SOCIALS = [
  { label: 'GitHub', href: CV_DATA.github, icon: 'github' as const },
  { label: 'LinkedIn', href: CV_DATA.linkedin, icon: 'linkedin' as const },
];

export function Hero() {
  const { t, cv } = useDictionary();
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });
  // Gentle parallax: the code card drifts up and the backdrop fades as the hero scrolls away.
  const cardY = useTransform(scrollYProgress, [0, 1], [0, -80]);
  const backdropOpacity = useTransform(scrollYProgress, [0, 0.8], [0.7, 0]);

  return (
    <section
      ref={sectionRef}
      aria-labelledby="hero-heading"
      className="relative isolate overflow-hidden"
    >
      <m.div
        aria-hidden
        style={{ opacity: backdropOpacity }}
        className="bg-grid absolute inset-x-0 -top-20 -z-10 h-184"
      />
      <m.div
        aria-hidden
        style={{ x: '-50%' }}
        animate={{ x: ['-50%', '-46%', '-54%', '-50%'], scale: [1, 1.08, 0.96, 1] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -top-48 left-1/2 -z-10 h-144 w-240 rounded-full bg-[radial-gradient(closest-side,var(--glow),transparent)]"
      />

      <Container className="grid items-center gap-16 pt-8 pb-16 sm:pt-14 lg:grid-cols-12 lg:gap-10 lg:pt-20 lg:pb-20">
        {/* Above the fold: CSS entrances (no hydration wait) with hand-tuned delays. */}
        <div className="min-w-0 lg:col-span-7">
          <Enter direction="scale">
            <Badge tone="success" className="rounded-full px-3 py-1">
              <StatusDot />
              {t.common.available}
            </Badge>
          </Enter>

          <Enter
            as="p"
            direction="left"
            delay={0.08}
            className="mt-8 font-mono text-xs tracking-wider text-fg-subtle uppercase sm:text-[13px]"
          >
            {CV_DATA.name} <span className="text-line-strong">/</span> {cv.title}
          </Enter>

          <WordReveal
            as="h1"
            id="hero-heading"
            text={t.hero.headline}
            accent={t.hero.accent}
            trigger="mount"
            delay={0.15}
            stagger={0.06}
            className="mt-4 text-[2.5rem] leading-[1.05] font-extrabold tracking-[-0.035em] text-fg sm:text-6xl lg:text-[3.5rem] xl:text-[4.25rem]"
          />

          <p className="mt-6 max-w-xl text-base leading-relaxed text-fg-muted sm:text-lg">
            {fmt(t.hero.intro, { years: CV_DATA.yearsOfExperience })}
          </p>

          <div className="mt-9 grid gap-3 sm:flex sm:flex-wrap sm:items-center">
            <Enter direction="scale" delay={0.4}>
              <LocaleLink
                href="/projects"
                className={buttonClass({ size: 'lg', className: 'w-full sm:w-auto' })}
              >
                {t.hero.viewWork}
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1 rtl:-scale-x-100 rtl:group-hover:-translate-x-1" />
              </LocaleLink>
            </Enter>
            <Enter direction="scale" delay={0.48}>
              <a
                href={RESUME_PDF_PATH}
                download
                className={buttonClass({
                  variant: 'secondary',
                  size: 'lg',
                  className: 'w-full sm:w-auto',
                })}
              >
                <Download className="size-4 transition-transform group-hover:translate-y-0.5" />
                {t.common.resumePdf}
              </a>
            </Enter>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-1 text-sm text-fg-subtle sm:mt-10">
            <Enter
              as="span"
              direction="right"
              delay={0.55}
              className="inline-flex items-center gap-2 py-2"
            >
              <MapPin className="size-4" />
              {cv.location}
            </Enter>
            <Enter
              as="span"
              direction="fade"
              delay={0.6}
              className="hidden h-4 w-px bg-line-strong sm:block"
            />
            {SOCIALS.map((social, i) => (
              <Enter key={social.label} as="span" direction="right" delay={0.65 + i * 0.06}>
                <a
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-2 py-2 transition-colors hover:text-fg"
                >
                  <SocialIcon
                    icon={social.icon}
                    className="size-4 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-12"
                  />
                  {social.label}
                </a>
              </Enter>
            ))}
          </div>
        </div>

        <m.div
          style={{ y: cardY }}
          className="mx-auto w-full max-w-md min-w-0 lg:col-span-5 lg:max-w-none"
        >
          <Enter delay={0.25} duration={1} style={{ '--enter-y': '40px' } as React.CSSProperties}>
            <ProfileCard />
          </Enter>
        </m.div>
      </Container>

      <Container className="pb-8">
        <dl className="grid grid-cols-2 overflow-hidden rounded-2xl border border-line bg-surface/60 backdrop-blur md:grid-cols-4">
          {cv.stats.map((stat, i) => (
            <Enter
              key={stat.label}
              delay={0.6 + i * 0.08}
              className={cn(
                'group relative flex flex-col gap-1 p-5 transition-colors duration-300 hover:bg-surface-2/60 sm:p-6',
                i % 2 === 1 && 'border-s',
                i >= 2 && 'border-t md:border-t-0',
                i === 2 && 'md:border-s'
              )}
            >
              <span
                aria-hidden
                className="absolute inset-x-5 top-0 h-px origin-left scale-x-0 bg-linear-to-r from-primary to-accent transition-transform duration-500 ease-out-expo group-hover:scale-x-100 sm:inset-x-6 rtl:origin-right rtl:bg-linear-to-l"
              />
              <dt className="order-2 font-mono text-[11px] tracking-wider text-fg-subtle uppercase">
                {stat.label}
              </dt>
              <dd className="order-1 font-heading text-3xl font-extrabold tracking-tight text-fg sm:text-4xl">
                <CountUp value={stat.numeric} suffix={stat.suffix} />
              </dd>
              {stat.sub && <dd className="order-3 text-xs text-fg-muted">{stat.sub}</dd>}
            </Enter>
          ))}
        </dl>
      </Container>
    </section>
  );
}
