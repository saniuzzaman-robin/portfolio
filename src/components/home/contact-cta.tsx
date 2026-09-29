'use client';

import { AnimatePresence, m, useMotionValue, useSpring } from 'framer-motion';
import { ArrowUpRight, Check, Clock, Copy, Mail, MapPin, X } from 'lucide-react';
import { Container, Eyebrow } from '@/components/ui/section';
import { EASE_OUT_EXPO, Stagger, StaggerItem, WordReveal } from '@/components/ui/motion';
import { Button, buttonClass } from '@/components/ui/button';
import { SocialIcon } from '@/components/reusable/social-icon';
import { LocalTime } from '@/components/home/local-time';
import { useCopyToClipboard } from '@/lib/use-copy-to-clipboard';
import { CV_DATA } from '@/lib/cv-data';
import { useDictionary } from '@/i18n/provider';

const COPY_ICONS = { idle: Copy, copied: Check, error: X } as const;

/** Size of the pointer-following glow, in px (matches `size-[32rem]`). */
const GLOW_SIZE = 512;

export function ContactCta({ index }: { index?: string }) {
  const { t, cv } = useDictionary();
  const { status, copy } = useCopyToClipboard();
  const CopyIcon = COPY_ICONS[status];

  // Glow that eases toward the pointer while hovering the card.
  // Starts near the top-right corner, where the static glow used to sit.
  const glowX = useSpring(useMotionValue(GLOW_SIZE), { stiffness: 80, damping: 20 });
  const glowY = useSpring(useMotionValue(-GLOW_SIZE / 2), { stiffness: 80, damping: 20 });
  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'touch') return;
    const rect = event.currentTarget.getBoundingClientRect();
    glowX.set(event.clientX - rect.left - GLOW_SIZE / 2);
    glowY.set(event.clientY - rect.top - GLOW_SIZE / 2);
  };

  return (
    <section
      id="contact"
      aria-labelledby="contact-heading"
      className="pt-6 pb-16 sm:pt-8 sm:pb-24 print:hidden"
    >
      <Container>
        <m.div
          initial={{ opacity: 0, scale: 0.96, y: 32 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true, margin: '-64px' }}
          transition={{ duration: 0.9, ease: EASE_OUT_EXPO }}
          onPointerMove={handlePointerMove}
          className="relative isolate overflow-hidden rounded-3xl border border-line bg-surface px-6 py-14 shadow-card sm:px-14 sm:py-20"
        >
          <div
            aria-hidden
            className="bg-grid absolute inset-0 -z-10 [mask-image:radial-gradient(ellipse_at_top_right,#000,transparent_65%)] opacity-60"
          />
          <m.div
            aria-hidden
            style={{ x: glowX, y: glowY }}
            className="absolute top-0 left-0 -z-10 size-[32rem] rounded-full bg-[radial-gradient(closest-side,var(--glow),transparent)]"
          />

          <Stagger stagger={0.1}>
            <Eyebrow index={index}>{t.contact.eyebrow}</Eyebrow>
            <WordReveal
              id="contact-heading"
              text={t.contact.title}
              accent={t.contact.accent}
              trigger="inherit"
              stagger={0.05}
              className="mt-5 max-w-3xl text-4xl leading-[1.05] font-extrabold tracking-[-0.03em] text-fg sm:text-6xl"
            />
            <StaggerItem
              as="p"
              className="mt-6 max-w-xl text-base leading-relaxed text-fg-muted sm:text-lg"
            >
              {t.contact.body}
            </StaggerItem>

            <Stagger
              trigger="inherit"
              stagger={0.08}
              className="mt-10 grid grid-cols-2 gap-3 sm:flex sm:flex-wrap sm:items-center"
            >
              <StaggerItem direction="scale">
                <a
                  href={`mailto:${CV_DATA.email}`}
                  className={buttonClass({
                    size: 'lg',
                    className: 'w-full px-4 sm:w-auto sm:px-6',
                  })}
                >
                  <Mail className="size-4 transition-transform duration-300 group-hover:-rotate-12" />
                  {t.contact.sayHello}
                </a>
              </StaggerItem>
              <StaggerItem direction="scale">
                <Button
                  variant="secondary"
                  size="lg"
                  className="w-full px-4 sm:w-auto sm:px-6"
                  onClick={() => void copy(CV_DATA.email)}
                  aria-live="polite"
                >
                  <AnimatePresence mode="wait" initial={false}>
                    <m.span
                      key={status}
                      initial={{ opacity: 0, scale: 0.5, rotate: -90 }}
                      animate={{ opacity: 1, scale: 1, rotate: 0 }}
                      exit={{ opacity: 0, scale: 0.5, rotate: 90 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                      className="inline-flex"
                    >
                      <CopyIcon className="size-4" />
                    </m.span>
                  </AnimatePresence>
                  <AnimatePresence mode="wait" initial={false}>
                    <m.span
                      key={status}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.15 }}
                    >
                      {t.contact.copy[status]}
                    </m.span>
                  </AnimatePresence>
                </Button>
              </StaggerItem>
              <StaggerItem direction="scale" className="col-span-2">
                <a
                  href={CV_DATA.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={buttonClass({
                    variant: 'ghost',
                    size: 'lg',
                    className: 'w-full sm:w-auto',
                  })}
                >
                  <SocialIcon icon="linkedin" className="size-4" />
                  LinkedIn
                  <ArrowUpRight className="size-3.5 opacity-60 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </a>
              </StaggerItem>
            </Stagger>

            <Stagger
              trigger="inherit"
              stagger={0.07}
              className="mt-12 flex flex-wrap gap-x-8 gap-y-3 border-t border-line pt-6 font-mono text-xs text-fg-subtle"
            >
              <StaggerItem as="span" direction="left" className="inline-flex items-center gap-2">
                <MapPin className="size-3.5" />
                {cv.location}
              </StaggerItem>
              <StaggerItem as="span" direction="left" className="inline-flex items-center gap-2">
                <Clock className="size-3.5" />
                {t.contact.localTime}{' '}
                <span className="text-fg">
                  <LocalTime timeZone={CV_DATA.timeZone} />
                </span>
              </StaggerItem>
              <StaggerItem as="span" direction="left" className="inline-flex items-center gap-2">
                <Mail className="size-3.5" />
                {CV_DATA.email}
              </StaggerItem>
            </Stagger>
          </Stagger>
        </m.div>
      </Container>
    </section>
  );
}
