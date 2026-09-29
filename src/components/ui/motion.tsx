'use client';

import { useEffect, useRef } from 'react';
import {
  animate,
  m,
  useInView,
  useReducedMotion,
  useScroll,
  useSpring,
  type Variants,
} from 'framer-motion';
import { cn } from '@/lib/cn';

export const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

const VIEWPORT = { once: true, margin: '-64px' } as const;

/* ------------------------------------------------------------------ */
/* CSS entrance (above the fold)                                       */
/* ------------------------------------------------------------------ */

export type EnterDirection = 'up' | 'down' | 'left' | 'right' | 'scale' | 'pop' | 'fade';

type EnterTag = 'div' | 'p' | 'span' | 'ul' | 'li' | 'dl' | 'h1' | 'header';

/**
 * Entrance animation driven by CSS (see `.enter` in globals.css). It starts at first
 * paint, before hydration, so use it for anything visible on load; `Stagger` (JS,
 * whileInView) is for content further down the page.
 */
export function Enter({
  as: Tag = 'div',
  direction = 'up',
  delay = 0,
  duration,
  className,
  style,
  children,
  ...rest
}: {
  as?: EnterTag;
  direction?: EnterDirection;
  /** Seconds. */
  delay?: number;
  /** Seconds. */
  duration?: number;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
  id?: string;
  role?: string;
  'aria-label'?: string;
  'aria-hidden'?: boolean;
}) {
  return (
    <Tag
      className={cn('enter', direction !== 'fade' && `enter-${direction}`, className)}
      style={
        {
          '--enter-delay': `${delay}s`,
          ...(duration !== undefined && { '--enter-duration': `${duration}s` }),
          ...style,
        } as React.CSSProperties
      }
      {...rest}
    >
      {children}
    </Tag>
  );
}

/* ------------------------------------------------------------------ */
/* Variants                                                            */
/* ------------------------------------------------------------------ */

export type Direction = 'up' | 'down' | 'left' | 'right' | 'scale' | 'fade';

const OFFSETS: Record<Direction, Record<string, number>> = {
  up: { y: 24 },
  down: { y: -16 },
  left: { x: -24 },
  right: { x: 24 },
  scale: { scale: 0.94, y: 8 },
  fade: {},
};

export function itemVariants(direction: Direction = 'up', duration = 0.6): Variants {
  return {
    hidden: { opacity: 0, ...OFFSETS[direction] },
    show: { opacity: 1, x: 0, y: 0, scale: 1, transition: { duration, ease: EASE_OUT_EXPO } },
  };
}

/**
 * How an animated container starts:
 * - `view`: when scrolled into view (default)
 * - `inherit`: follows the nearest animated parent (nested staggers)
 */
export type Trigger = 'view' | 'inherit';

function triggerProps(trigger: Trigger) {
  if (trigger === 'inherit') return {};
  return { initial: 'hidden', whileInView: 'show', viewport: VIEWPORT } as const;
}

const TAGS = {
  div: m.div,
  ul: m.ul,
  ol: m.ol,
  dl: m.dl,
  li: m.li,
  p: m.p,
  span: m.span,
  h1: m.h1,
  h2: m.h2,
  h3: m.h3,
} as const;

type Tag = keyof typeof TAGS;

type BaseProps = {
  as?: Tag;
  className?: string;
  id?: string;
  role?: string;
  'aria-label'?: string;
  children?: React.ReactNode;
};

/* ------------------------------------------------------------------ */
/* Stagger container + item (scroll-triggered)                         */
/* ------------------------------------------------------------------ */

export function Stagger({
  as = 'div',
  stagger = 0.08,
  delay = 0,
  trigger = 'view',
  ...props
}: BaseProps & { stagger?: number; delay?: number; trigger?: Trigger }) {
  const Comp = TAGS[as] as typeof m.div;
  return (
    <Comp
      {...triggerProps(trigger)}
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: stagger, delayChildren: delay } },
      }}
      {...props}
    />
  );
}

export function StaggerItem({
  as = 'div',
  direction = 'up',
  duration,
  ...props
}: BaseProps & { direction?: Direction; duration?: number }) {
  const Comp = TAGS[as] as typeof m.div;
  return <Comp variants={itemVariants(direction, duration)} {...props} />;
}

/* ------------------------------------------------------------------ */
/* Word-by-word heading reveal                                         */
/* ------------------------------------------------------------------ */

type HeadingTag = 'h1' | 'h2' | 'h3' | 'p';

const wordVariants: Variants = {
  hidden: { y: '110%' },
  show: { y: '0%', transition: { duration: 0.85, ease: EASE_OUT_EXPO } },
};

// Mask; padding lives on the word so descenders (g, p, y) stay inside the mask and
// inside the gradient's background box.
const MASK_CLASS = '-mb-[0.18em] inline-block overflow-hidden align-bottom';
const WORD_CLASS = 'inline-block pb-[0.18em]';

/**
 * Each word slides up from behind a mask; `accent` words get the brand gradient.
 * `trigger="mount"` animates with CSS from first paint (use above the fold);
 * `view`/`inherit` animate with JS when scrolled into view.
 */
export function WordReveal({
  as = 'h2',
  text,
  accent,
  id,
  className,
  trigger = 'view',
  stagger = 0.045,
  delay = 0,
}: {
  as?: HeadingTag;
  text: string;
  accent?: string;
  id?: string;
  className?: string;
  trigger?: Trigger | 'mount';
  stagger?: number;
  delay?: number;
}) {
  const words = [
    ...text.split(' ').map((word) => ({ word, accent: false })),
    ...(accent ? accent.split(' ').map((word) => ({ word, accent: true })) : []),
  ].filter(({ word }) => word);
  const label = accent ? `${text} ${accent}` : text;

  if (trigger === 'mount') {
    const Tag = as;
    return (
      <Tag id={id} className={className} aria-label={label}>
        {words.map(({ word, accent: isAccent }, i) => (
          <span key={i} aria-hidden>
            <span className={MASK_CLASS}>
              <span
                className={cn(WORD_CLASS, 'word-rise', isAccent && 'text-gradient')}
                style={{ '--enter-delay': `${delay + i * stagger}s` } as React.CSSProperties}
              >
                {word}
              </span>
            </span>
            {i < words.length - 1 && ' '}
          </span>
        ))}
      </Tag>
    );
  }

  const Comp = TAGS[as] as typeof m.h2;
  return (
    <Comp
      id={id}
      className={className}
      aria-label={label}
      {...triggerProps(trigger)}
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: stagger, delayChildren: delay } },
      }}
    >
      {words.map(({ word, accent: isAccent }, i) => (
        <span key={i} aria-hidden>
          <span className={MASK_CLASS}>
            <m.span variants={wordVariants} className={cn(WORD_CLASS, isAccent && 'text-gradient')}>
              {word}
            </m.span>
          </span>
          {i < words.length - 1 && ' '}
        </span>
      ))}
    </Comp>
  );
}

/* ------------------------------------------------------------------ */
/* Decorative line that draws in                                       */
/* ------------------------------------------------------------------ */

export function DrawLine({ className }: { className?: string }) {
  return (
    <m.span
      aria-hidden
      variants={{
        hidden: { scaleX: 0 },
        show: { scaleX: 1, transition: { duration: 0.8, ease: EASE_OUT_EXPO } },
      }}
      className={cn('block h-px origin-left bg-line-strong', className)}
    />
  );
}

/* ------------------------------------------------------------------ */
/* Number count-up                                                     */
/* ------------------------------------------------------------------ */

function formatCount(value: number, suffix: string) {
  return `${Math.round(value).toLocaleString('en-US')}${suffix}`;
}

/** Hydration later than this (ms after navigation start) means the number was already read. */
const LATE_HYDRATION_MS = 1500;

/**
 * Counts from 0 to `value` when scrolled into view. SSR renders the final value; if the
 * number is already on screen when JS arrives late (slow devices), it is left as is
 * rather than jumping back to 0.
 */
export function CountUp({
  value,
  suffix = '',
  duration = 1.6,
  className,
}: {
  value: number;
  suffix?: string;
  duration?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const skip = useRef<boolean | null>(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el || reduceMotion) return;
    if (skip.current === null) {
      const rect = el.getBoundingClientRect();
      const visibleOnHydrate = rect.top < window.innerHeight && rect.bottom > 0;
      skip.current = visibleOnHydrate && performance.now() > LATE_HYDRATION_MS;
    }
    if (skip.current) return;
    if (!inView) {
      el.textContent = formatCount(0, suffix);
      return;
    }
    const controls = animate(0, value, {
      duration,
      ease: EASE_OUT_EXPO,
      onUpdate: (latest) => {
        el.textContent = formatCount(latest, suffix);
      },
    });
    return () => controls.stop();
  }, [inView, reduceMotion, value, suffix, duration]);

  return (
    <span ref={ref} className={cn('tabular-nums', className)}>
      {formatCount(value, suffix)}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Scroll-linked vertical rail                                         */
/* ------------------------------------------------------------------ */

/**
 * Absolutely-positioned vertical line (track + gradient fill) that fills as it scrolls
 * through the viewport. Place inside a `relative` container; position with `className`.
 */
export function ScrollRail({ className }: { className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 75%', 'end 60%'] });
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 24, mass: 0.4 });

  return (
    <span ref={ref} aria-hidden className={cn('absolute top-0 bottom-0 w-px bg-line', className)}>
      <m.span
        style={{ scaleY: progress }}
        className="absolute inset-0 origin-top bg-linear-to-b from-primary via-accent to-primary"
      />
    </span>
  );
}
