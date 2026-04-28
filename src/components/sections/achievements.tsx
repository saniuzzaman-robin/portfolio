'use client';

import { useEffect, useRef, useState } from 'react';
import { type LucideIcon, Zap, Target, Trophy, Puzzle, Scale } from 'lucide-react';

function useCountUp(target: number, duration = 1800) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const start = performance.now();
          const tick = (now: number) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(eased * target));
            if (progress < 1) requestAnimationFrame(tick);
            else setCount(target);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.4 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration]);

  return { count, ref };
}

const COLOR_MAP = {
  green: {
    text: 'neon-green',
    border: 'border-primary-50/25',
    hoverBorder: 'hover:border-primary-50/70',
    glow: 'hover:neon-box-green',
    accent: '#00ff87',
    iconText: 'text-primary-50',
    tag: 'bg-primary-50/10 text-primary-50',
  },
  cyan: {
    text: 'neon-cyan',
    border: 'border-secondary-50/25',
    hoverBorder: 'hover:border-secondary-50/70',
    glow: 'hover:neon-box-cyan',
    accent: '#00d4ff',
    iconText: 'text-secondary-50',
    tag: 'bg-secondary-50/10 text-secondary-50',
  },
  purple: {
    text: 'neon-purple',
    border: 'border-tertiary-50/25',
    hoverBorder: 'hover:border-tertiary-50/70',
    glow: 'hover:neon-box-purple',
    accent: '#a476ff',
    iconText: 'text-tertiary-50',
    tag: 'bg-tertiary-50/10 text-tertiary-50',
  },
} as const;

type Color = keyof typeof COLOR_MAP;

interface AchievementItem {
  icon: LucideIcon;
  tag: string;
  numericValue?: number;
  suffix?: string;
  stat: string;
  label: string;
  description: string;
  color: Color;
  delay: number;
}

function AchievementCard({ item }: { item: AchievementItem }) {
  const { count, ref } = useCountUp(item.numericValue ?? 0, 1800);
  const s = COLOR_MAP[item.color];
  const Icon = item.icon;

  const displayStat = item.numericValue !== undefined ? `${count}${item.suffix ?? ''}` : item.stat;

  return (
    <div
      ref={ref}
      className={`relative glass rounded-sm border ${s.border} ${s.hoverBorder} ${s.glow} p-7 transition-all duration-500 group animate-scale-in overflow-hidden flex flex-col gap-4`}
      style={{ animationDelay: `${item.delay}ms`, animationFillMode: 'both' }}
    >
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 holographic pointer-events-none rounded-sm" />
      <div
        className="absolute top-0 left-0 w-16 h-16 opacity-15 group-hover:opacity-50 transition-opacity duration-300 pointer-events-none"
        style={{ background: `linear-gradient(135deg, ${s.accent} 0%, transparent 65%)` }}
      />

      <div className="flex items-center justify-between relative z-10">
        <div className={`${s.iconText} opacity-70 group-hover:opacity-100 transition-opacity`}>
          <Icon className="w-5 h-5" strokeWidth={1.5} />
        </div>
        <span
          className={`text-[10px] uppercase tracking-widest font-space-grotesk font-bold px-2 py-0.5 rounded-full ${s.tag}`}
        >
          {item.tag}
        </span>
      </div>

      <div className={`font-space-grotesk font-bold tabular-nums text-5xl relative z-10 ${s.text}`}>
        {displayStat}
      </div>

      <div className="relative z-10">
        <p className="font-space-grotesk font-bold text-neutral-90 text-sm uppercase tracking-widest mb-2 group-hover:text-neutral-100 transition-colors">
          {item.label}
        </p>
        <p className="text-neutral-60 text-sm leading-relaxed">{item.description}</p>
      </div>

      <div
        className="absolute bottom-0 left-0 h-px w-0 group-hover:w-full transition-all duration-700"
        style={{ background: `linear-gradient(to right, ${s.accent}, transparent)` }}
      />
    </div>
  );
}

const ACHIEVEMENTS: AchievementItem[] = [
  {
    icon: Zap,
    tag: 'Experience',
    numericValue: 5,
    suffix: '+ yrs',
    stat: '5+ yrs',
    label: 'Professional Engineer',
    description:
      'Full-stack software engineer building scalable applications with NestJS, Next.js, and Angular across production systems reaching 180M+ users.',
    color: 'green',
    delay: 0,
  },
  {
    icon: Target,
    tag: 'Algorithms',
    numericValue: 1700,
    suffix: '+',
    stat: '1700+',
    label: 'Problems Solved',
    description:
      'Solved across Codeforces, Codechef, LightOJ & UVA — covering dynamic programming, graph theory, segment trees, and advanced data structures.',
    color: 'cyan',
    delay: 80,
  },
  {
    icon: Trophy,
    tag: 'Competitive',
    numericValue: 10,
    suffix: '+',
    stat: '10+',
    label: 'National Contests',
    description:
      'Participated in ICPC, NCPC, and university-level circuits across Bangladesh, consistently ranking among top performers.',
    color: 'purple',
    delay: 160,
  },
  {
    icon: Scale,
    tag: 'Community',
    stat: 'Judge',
    label: 'Problem Setter',
    description:
      'Designed, tested, and judged problems for Intra and Inter-University programming contests, ensuring mathematical rigor and fairness.',
    color: 'green',
    delay: 240,
  },
  {
    icon: Puzzle,
    tag: 'Engineering',
    numericValue: 50,
    suffix: '+',
    stat: '50+',
    label: 'UI Components',
    description:
      'Reusable, accessible components built across production projects — from design-system primitives to complex data-heavy interfaces.',
    color: 'cyan',
    delay: 320,
  },
];

export function Achievements() {
  return (
    <section className="px-6 py-24 md:px-12 lg:px-20 relative cyber-grid-dense">
      <div className="max-w-7xl mx-auto">
        <div className="mb-14 animate-slide-right">
          <p className="section-label mb-3">Career &amp; Competitive</p>
          <h2 className="font-space-grotesk text-4xl md:text-5xl font-bold">
            Achievements &amp; <span className="neon-cyan">Milestones</span>
          </h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
          {ACHIEVEMENTS.map((item) => (
            <AchievementCard key={item.label} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
}
