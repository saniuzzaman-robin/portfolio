'use client';

import { m, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Trophy, Users } from 'lucide-react';
import { CV_DATA } from '@/lib/cv-data';
import { cn } from '@/lib/cn';
import { Enter } from '@/components/ui/motion';
import { useDictionary } from '@/i18n/provider';
import { fmt } from '@/i18n/dictionary';

type TokenKind = 'kw' | 'str' | 'num' | 'prop' | 'punct' | 'plain';
type Line = [TokenKind, string][];

const TOKEN_CLASSES: Record<TokenKind, string> = {
  kw: 'text-code-keyword',
  str: 'text-code-string',
  num: 'text-code-number',
  prop: 'text-code-property',
  punct: 'text-code-punct',
  plain: 'text-fg',
};

const str = (value: string): [TokenKind, string] => ['str', `'${value}'`];

function prop(name: string, value: [TokenKind, string][]): Line {
  return [['plain', '  '], ['prop', name], ['punct', ': '], ...value, ['punct', ',']];
}

function list(values: string[]): [TokenKind, string][] {
  return [
    ['punct', '['],
    ...values.flatMap((v, i): [TokenKind, string][] =>
      i === 0 ? [str(v)] : [['punct', ', '], str(v)]
    ),
    ['punct', ']'],
  ];
}

/** Code "types in" line by line after the card lands (seconds). */
const FIRST_LINE_DELAY = 0.6;
const LINE_STAGGER = 0.07;

/** Max tilt (degrees) of the card when the pointer is at its edge. */
const MAX_TILT = 6;

function FloatingChip({
  icon: Icon,
  label,
  className,
  delay = 0,
}: {
  icon: typeof Trophy;
  label: string;
  className?: string;
  delay?: number;
}) {
  return (
    <Enter direction="pop" delay={delay} className={cn('absolute z-10 hidden sm:block', className)}>
      <m.div
        style={{ z: 40 }}
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay }}
        className="flex items-center gap-2 rounded-full border border-line-strong bg-elevated/90 px-3 py-1.5 font-mono text-[11px] font-medium text-fg shadow-pop backdrop-blur"
      >
        <Icon className="size-3.5 text-primary-text" />
        {label}
      </m.div>
    </Enter>
  );
}

export function ProfileCard() {
  const { t, cv } = useDictionary();
  const current = cv.experience[0];
  const lines: Line[] = [
    [
      ['kw', 'const '],
      ['plain', 'engineer '],
      ['punct', '= {'],
    ],
    prop('name', [str(CV_DATA.name.replace('Md. ', ''))]),
    prop('role', [str(cv.role)]),
    prop('based', [str(cv.location)]),
    prop('experience', [str(fmt(t.profileCard.years, { years: CV_DATA.yearsOfExperience }))]),
    prop('stack', list(['Next.js', 'NestJS', 'Angular'])),
    prop('data', list(['MongoDB', 'Redis', 'Pub/Sub'])),
    prop('solved', [['num', '1700']]),
    prop('openToWork', [['kw', 'true']]),
    [['punct', '};']],
    [],
    [
      ['kw', 'export default '],
      ['plain', 'engineer'],
      ['punct', ';'],
    ],
  ];

  // Pointer-driven 3D tilt (mouse / pen only; touch keeps the card flat).
  const pointerX = useMotionValue(0.5);
  const pointerY = useMotionValue(0.5);
  const rotateX = useSpring(useTransform(pointerY, [0, 1], [MAX_TILT, -MAX_TILT]), {
    stiffness: 200,
    damping: 20,
  });
  const rotateY = useSpring(useTransform(pointerX, [0, 1], [-MAX_TILT, MAX_TILT]), {
    stiffness: 200,
    damping: 20,
  });

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'touch') return;
    const rect = event.currentTarget.getBoundingClientRect();
    pointerX.set((event.clientX - rect.left) / rect.width);
    pointerY.set((event.clientY - rect.top) / rect.height);
  };

  const resetTilt = () => {
    pointerX.set(0.5);
    pointerY.set(0.5);
  };

  return (
    <m.div
      onPointerMove={handlePointerMove}
      onPointerLeave={resetTilt}
      style={{ rotateX, rotateY, transformPerspective: 1200, transformStyle: 'preserve-3d' }}
      className="relative"
    >
      <div
        aria-hidden
        className="absolute -inset-6 -z-10 rounded-4xl bg-linear-to-br from-primary/25 via-accent/10 to-transparent opacity-80 blur-2xl"
      />

      <figure
        dir="ltr"
        className="overflow-hidden rounded-2xl border border-line-strong bg-elevated shadow-pop"
      >
        <div className="flex items-center gap-3 border-b border-line bg-surface-2/70 px-4 py-3">
          <div className="flex gap-1.5" aria-hidden>
            <span className="size-2.5 rounded-full bg-[#ff5f57]" />
            <span className="size-2.5 rounded-full bg-[#febc2e]" />
            <span className="size-2.5 rounded-full bg-[#28c840]" />
          </div>
          <span className="font-mono text-xs text-fg-muted">engineer.ts</span>
          <span className="ml-auto font-mono text-[10px] tracking-wider text-fg-subtle uppercase">
            TypeScript
          </span>
        </div>

        <pre
          className="overflow-x-auto py-4 pl-4 font-mono text-[11px] leading-6 sm:pl-0 sm:text-[13px] lg:text-[12px] xl:text-[13px]"
          aria-label={fmt(t.profileCard.summary, { role: cv.role, location: cv.location })}
        >
          <code className="block">
            {lines.map((line, i) => (
              <Enter
                key={i}
                as="span"
                direction="left"
                delay={FIRST_LINE_DELAY + i * LINE_STAGGER}
                duration={0.45}
                className="flex"
                style={{ '--enter-x': '-10px' } as React.CSSProperties}
              >
                <span
                  aria-hidden
                  className="hidden w-10 shrink-0 pr-4 text-right text-fg-subtle/60 select-none sm:block"
                >
                  {i + 1}
                </span>
                <span className="pr-4 whitespace-pre">
                  {line.map(([kind, text], j) => (
                    <span key={j} className={TOKEN_CLASSES[kind]}>
                      {text}
                    </span>
                  ))}
                  {i === lines.length - 1 && (
                    <span
                      aria-hidden
                      className="ml-0.5 inline-block h-4 w-1.75 translate-y-0.5 animate-blink bg-primary"
                    />
                  )}
                </span>
              </Enter>
            ))}
          </code>
        </pre>

        <figcaption className="flex items-center justify-between gap-3 border-t border-line px-4 py-3 font-mono text-[11px] text-fg-subtle">
          <span className="flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-success" aria-hidden />
            {t.profileCard.currentlyAt} <span className="text-fg">{current.company}</span>
          </span>
          <span>{fmt(t.profileCard.since, { year: current.startDate.slice(0, 4) })}</span>
        </figcaption>
      </figure>

      <FloatingChip
        icon={Users}
        label={t.profileCard.chipUsers}
        className="-inset-s-4 -top-4"
        delay={1.2}
      />
      <FloatingChip
        icon={Trophy}
        label={t.profileCard.chipRank}
        className="-inset-e-3 -bottom-4"
        delay={1.5}
      />
    </m.div>
  );
}
