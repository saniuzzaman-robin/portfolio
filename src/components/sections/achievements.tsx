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
      className="relative group animate-slide-up"
      style={{ animationDelay: `${item.delay}ms`, animationFillMode: 'both' } as CSSProperties}
    >
      <div className="relative flex items-center gap-3 md:gap-6 px-5 md:px-7 py-5 transition-all duration-300 overflow-hidden">
        {/* Hover bg fill */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{ background: accentA(0.05) }}
        />
        {/* Left accent bar */}
        <div
          className="absolute left-0 top-2 bottom-2 w-0.5 rounded-full group-hover:top-0 group-hover:bottom-0 transition-all duration-300"
          style={{ background: accent }}
        />

        {/* Rank */}
        <span
          className="font-space-grotesk font-bold text-xs tabular-nums w-7 shrink-0 opacity-35 group-hover:opacity-80 transition-opacity duration-300 relative z-10"
          style={{ color: accent }}
        >
          #{String(rank).padStart(2, '0')}
        </span>

        {/* Icon + Category */}
        <div className="hidden sm:flex flex-col items-center gap-1.5 shrink-0 w-16 relative z-10">
          <div
            className="w-8 h-8 rounded-sm flex items-center justify-center border transition-all duration-300 group-hover:scale-110"
            style={{ borderColor: accentA(0.3), background: accentA(0.08), color: accent }}
          >
            <Icon className="w-3.5 h-3.5" strokeWidth={1.5} />
          </div>
          <span
            className="text-[9px] uppercase tracking-widest font-space-grotesk font-bold text-center leading-tight"
            style={{ color: accent }}
          >
            {item.tag}
          </span>
        </div>

        {/* Big stat */}
        <div
          className="font-space-grotesk font-bold tabular-nums text-3xl md:text-4xl lg:text-5xl shrink-0 w-32 md:w-40 leading-none relative z-10"
          style={{ color: accent, textShadow: `0 0 24px ${accentA(0.4)}` }}
        >
          {displayStat}
        </div>

        {/* Label + description */}
        <div className="flex-1 min-w-0 relative z-10">
          <p className="font-space-grotesk font-bold text-neutral-90 text-sm uppercase tracking-widest mb-1 group-hover:text-neutral-100 transition-colors">
            {item.label}
          </p>
          <p className="text-neutral-60 text-xs leading-relaxed line-clamp-2 group-hover:text-neutral-70 transition-colors">
            {item.description}
          </p>
        </div>
      </div>

      {/* Row divider */}
      <div
        className="mx-5 md:mx-7 h-px"
        style={{ background: `linear-gradient(to right, ${accentA(0.18)}, transparent)` }}
      />
    </div>
  );
}

export function Achievements() {
  return (
    <section className="px-6 py-24 md:px-12 lg:px-20 relative overflow-hidden">
      <div className="absolute inset-0 cyber-grid-dense opacity-20 pointer-events-none" />
      <div className="absolute top-1/3 right-0 w-96 h-96 bg-secondary-50/4 rounded-full blur-3xl pointer-events-none animate-float-slow" />
      <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-primary-50/3 rounded-full blur-3xl pointer-events-none animate-float" />

      <div className="max-w-5xl mx-auto relative z-10">
        {/* Header */}
        <div className="mb-14 animate-slide-right flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <p className="section-label mb-3">Career &amp; Competitive</p>
            <h2 className="font-space-grotesk text-4xl md:text-5xl font-bold">
              Achievements &amp; <span className="neon-cyan">Milestones</span>
            </h2>
          </div>
          <div className="terminal-text text-xs shrink-0 self-start sm:self-auto">
            <span className="neon-green">5</span> records loaded
          </div>
        </div>

        {/* Scoreboard panel */}
        <div className="glass rounded-sm border border-white/8 overflow-hidden animate-scale-in [animation-delay:100ms]">
          {/* Panel header */}
          <div className="flex items-center gap-3 md:gap-6 px-5 md:px-7 py-3 border-b border-white/5 bg-white/2">
            <div className="flex gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-400/60" />
              <span className="w-2.5 h-2.5 rounded-full bg-primary-50/60" />
            </div>
            <span className="terminal-text text-[10px]">~/metrics --career --competitive</span>
          </div>

          {/* Column labels */}
          <div className="flex items-center gap-3 md:gap-6 px-5 md:px-7 py-2.5 border-b border-white/5">
            <span className="w-7 shrink-0 text-[9px] font-space-grotesk uppercase tracking-widest text-neutral-50">RNK</span>
            <span className="hidden sm:block w-16 text-[9px] font-space-grotesk uppercase tracking-widest text-neutral-50">CAT</span>
            <span className="w-32 md:w-40 text-[9px] font-space-grotesk uppercase tracking-widest text-neutral-50">STAT</span>
            <span className="flex-1 text-[9px] font-space-grotesk uppercase tracking-widest text-neutral-50">ACHIEVEMENT</span>
          </div>

          {/* Rows */}
          <div>
            {ACHIEVEMENTS.map((item, i) => (
              <AchievementRow key={item.label} item={item} rank={i + 1} />
            ))}
          </div>

          {/* Footer */}
          <div className="px-5 md:px-7 py-3 border-t border-white/5 bg-white/1 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary-50 animate-glow inline-block" />
            <span className="text-[9px] font-space-grotesk text-neutral-60 uppercase tracking-widest">
              All metrics verified · Last updated 2026
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
