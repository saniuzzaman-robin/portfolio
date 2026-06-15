'use client';

import type { CSSProperties } from 'react';
import { useCountUp } from '@/hooks/use-count-up';
import { ACHIEVEMENTS, type AchievementItem } from '@/lib/data/achievements';
import { av, ava } from '@/lib/accent';

function AchievementRow({ item, rank }: { item: AchievementItem; rank: number }) {
  const { count, ref } = useCountUp(item.numericValue ?? 0, 1800);
  const Icon = item.icon;
  const accent = av(item.color);
  const accentA = (a: number) => ava(item.color, a);
  const displayStat = item.numericValue !== undefined ? `${count}${item.suffix ?? ''}` : item.stat;

  return (
    <div
      ref={ref}
      className="group animate-slide-up relative"
      style={{ animationDelay: `${item.delay}ms`, animationFillMode: 'both' } as CSSProperties}
    >
      <div className="relative flex items-center gap-3 overflow-hidden px-5 py-5 transition-all duration-300 md:gap-6 md:px-7">
        {/* Hover bg fill */}
        <div
          className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{ background: accentA(0.05) }}
        />
        {/* Left accent bar */}
        <div
          className="absolute top-2 bottom-2 left-0 w-0.5 rounded-full transition-all duration-300 group-hover:top-0 group-hover:bottom-0"
          style={{ background: accent }}
        />

        {/* Rank */}
        <span
          className="font-poppins relative z-10 w-7 shrink-0 text-xs font-bold tabular-nums opacity-35 transition-opacity duration-300 group-hover:opacity-80 lg:text-sm"
          style={{ color: accent }}
        >
          #{String(rank).padStart(2, '0')}
        </span>

        {/* Icon + Category */}
        <div className="relative z-10 hidden w-16 shrink-0 flex-col items-center gap-1.5 sm:flex">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-sm border transition-all duration-300 group-hover:scale-110"
            style={{ borderColor: accentA(0.3), background: accentA(0.08), color: accent }}
          >
            <Icon className="h-3.5 w-3.5" strokeWidth={1.5} />
          </div>
          <span
            className="font-poppins text-center text-[9px] leading-tight font-bold tracking-widest uppercase"
            style={{ color: accent }}
          >
            {item.tag}
          </span>
        </div>

        {/* Big stat */}
        <div
          className="font-poppins relative z-10 w-32 shrink-0 text-3xl leading-none font-bold tabular-nums md:w-40 md:text-4xl lg:text-5xl"
          style={{ color: accent, textShadow: `0 0 24px ${accentA(0.4)}` }}
        >
          {displayStat}
        </div>

        {/* Label + description */}
        <div className="relative z-10 min-w-0 flex-1">
          <p className="font-poppins text-neutral-90 mb-1 text-sm font-bold tracking-widest uppercase transition-colors group-hover:text-neutral-100">
            {item.label}
          </p>
          <p className="text-neutral-60 group-hover:text-neutral-70 line-clamp-2 text-xs leading-relaxed transition-colors lg:text-sm">
            {item.description}
          </p>
        </div>
      </div>

      {/* Row divider */}
      <div
        className="mx-5 h-px md:mx-7"
        style={{ background: `linear-gradient(to right, ${accentA(0.18)}, transparent)` }}
      />
    </div>
  );
}

export function Achievements() {
  return (
    <section className="relative overflow-hidden px-6 py-24 md:px-12 lg:px-20">
      <div className="cyber-grid-dense pointer-events-none absolute inset-0 opacity-20" />
      <div className="bg-secondary-50/4 animate-float-slow pointer-events-none absolute top-1/3 right-0 h-96 w-96 rounded-full blur-3xl" />
      <div className="bg-primary-50/3 animate-float pointer-events-none absolute bottom-0 left-1/4 h-80 w-80 rounded-full blur-3xl" />

      <div className="relative z-10 mx-auto max-w-5xl">
        {/* Header */}
        <div className="animate-slide-right mb-14 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="section-label mb-3">Career &amp; Competitive</p>
            <h2 className="font-poppins text-4xl font-bold md:text-5xl">
              Achievements &amp; <span className="neon-cyan">Milestones</span>
            </h2>
          </div>
          <div className="terminal-text shrink-0 self-start text-xs sm:self-auto lg:text-sm">
            <span className="neon-green">5</span> records loaded
          </div>
        </div>

        {/* Scoreboard panel */}
        <div className="glass animate-scale-in overflow-hidden rounded-sm border border-white/8 [animation-delay:100ms]">
          {/* Panel header */}
          <div className="flex items-center gap-3 border-b border-white/5 bg-white/2 px-5 py-3 md:gap-6 md:px-7">
            <div className="flex gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-red-500/60" />
              <span className="h-2.5 w-2.5 rounded-full bg-yellow-400/60" />
              <span className="bg-primary-50/60 h-2.5 w-2.5 rounded-full" />
            </div>
            <span className="terminal-text text-[10px]">~/metrics --career --competitive</span>
          </div>

          {/* Column labels */}
          <div className="flex items-center gap-3 border-b border-white/5 px-5 py-2.5 md:gap-6 md:px-7">
            <span className="font-poppins w-7 shrink-0 text-[9px] tracking-widest text-neutral-50 uppercase">
              RNK
            </span>
            <span className="font-poppins hidden w-16 text-[9px] tracking-widest text-neutral-50 uppercase sm:block">
              CAT
            </span>
            <span className="font-poppins w-32 text-[9px] tracking-widest text-neutral-50 uppercase md:w-40">
              STAT
            </span>
            <span className="font-poppins flex-1 text-[9px] tracking-widest text-neutral-50 uppercase">
              ACHIEVEMENT
            </span>
          </div>

          {/* Rows */}
          <div>
            {ACHIEVEMENTS.map((item, i) => (
              <AchievementRow key={item.label} item={item} rank={i + 1} />
            ))}
          </div>

          {/* Footer */}
          <div className="flex items-center gap-2 border-t border-white/5 bg-white/1 px-5 py-3 md:px-7">
            <span className="bg-primary-50 animate-glow inline-block h-1.5 w-1.5 rounded-full" />
            <span className="font-poppins text-neutral-60 text-[9px] tracking-widest uppercase">
              All metrics verified · Last updated 2026
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
