'use client';

import { useCountUp } from '@/hooks/use-count-up';
import { ACHIEVEMENTS, type AchievementItem } from '@/lib/data/achievements';
import { av, ava } from '@/lib/accent';
import { FadeInUp, StaggerContainer, StaggerItem } from '@/components/ui/motion-wrapper';
import { SectionHeader } from '@/components/ui/section-header';

const ACCENT_MAP = { primary: '#14b8a6', secondary: '#6366f1', tertiary: '#f43f5e' } as const;

function MetricCard({ item, index }: { item: AchievementItem; index: number }) {
  const { count, ref } = useCountUp(item.numericValue ?? 0, 2000);
  const accent = av(item.color);
  const accentA = (a: number) => ava(item.color, a);
  const Icon = item.icon;
  const displayStat = item.numericValue !== undefined ? `${count}${item.suffix ?? ''}` : item.stat;
  const hexColor = ACCENT_MAP[item.color];

  return (
    <StaggerItem>
      <div
        ref={ref}
        className="group relative overflow-hidden rounded-xl border transition-all duration-500 hover:-translate-y-1"
        style={{ borderColor: accentA(0.15), background: accentA(0.02) }}
      >
        {/* Hover gradient overlay */}
        <div
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          style={{
            background: `linear-gradient(135deg, ${accentA(0.06)}, transparent 60%)`,
          }}
        />

        {/* Top accent line */}
        <div className="h-0.5 w-full origin-left scale-x-0 transition-transform duration-500 group-hover:scale-x-100" style={{ background: `linear-gradient(to right, ${accent}, ${accentA(0.3)})` }} />

        <div className="relative p-6">
          {/* Icon + Tag row */}
          <div className="mb-4 flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-lg transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg"
              style={{ background: accentA(0.1), color: accent }}
            >
              <Icon className="h-4 w-4" strokeWidth={1.5} />
            </div>
            <span className="font-poppins text-[10px] font-bold tracking-widest uppercase" style={{ color: accent }}>
              {item.tag}
            </span>
          </div>

          {/* Stat with animated ring */}
          <div className="mb-4 flex items-end gap-3">
            <span
              className="font-poppins text-4xl leading-none font-black tabular-nums md:text-5xl"
              style={{ color: accent }}
            >
              {displayStat}
            </span>
            {/* Progress ring */}
            <svg className="mb-1 h-10 w-10 shrink-0" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="15.5" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.1" />
              <circle
                cx="18" cy="18" r="15.5" fill="none"
                stroke={hexColor}
                strokeWidth="2"
                strokeLinecap="round"
                strokeDasharray={`${Math.min((index + 1) * 18, 97)} ${100 - Math.min((index + 1) * 18, 97)}`}
                strokeDashoffset="0"
                className="transition-all duration-1000"
                style={{ opacity: 0.6, filter: `drop-shadow(0 0 4px ${accentA(0.5)})` }}
                transform="rotate(-90 18 18)"
              />
            </svg>
          </div>

          {/* Label */}
          <h3 className="font-poppins text-neutral-90 mb-1 text-sm font-bold tracking-wide">
            {item.label}
          </h3>

          {/* Description */}
          <p className="text-neutral-60 text-xs leading-relaxed">
            {item.description}
          </p>
        </div>

        {/* Bottom-right number */}
        <span
          className="pointer-events-none absolute right-3 bottom-2 font-poppins text-[2.5rem] font-black leading-none select-none"
          style={{ color: accentA(0.06) }}
        >
          {String(index + 1).padStart(2, '0')}
        </span>
      </div>
    </StaggerItem>
  );
}

export function Achievements() {
  return (
    <section className="relative overflow-hidden px-6 py-24 md:px-12 lg:px-20">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="bg-primary-50/3 absolute top-20 right-1/4 h-96 w-96 rounded-full blur-[120px]" />
        <div className="bg-secondary-50/3 absolute -bottom-20 left-1/4 h-80 w-80 rounded-full blur-[100px]" />
        <div className="bg-tertiary-50/2 absolute top-1/3 left-1/2 h-64 w-64 rounded-full blur-[80px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl">
        <SectionHeader
          label="Career & Competitive"
          title={<>Achievements & <span className="gradient-text">Milestones</span></>}
          description="Quantified impact across professional engineering and competitive programming"
        />

        <StaggerContainer>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {ACHIEVEMENTS.map((item, i) => (
              <MetricCard key={item.label} item={item} index={i} />
            ))}
          </div>
        </StaggerContainer>

        <FadeInUp className="mt-10 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border px-4 py-2" style={{ borderColor: 'rgb(from var(--color-neutral-50) r g b / 0.12)' }}>
            <span className="bg-primary-50/70 inline-block h-1.5 w-1.5 rounded-full" />
            <span className="font-poppins text-neutral-50 text-[10px] tracking-widest uppercase">
              All metrics verified &middot; Last updated 2026
            </span>
          </div>
        </FadeInUp>
      </div>
    </section>
  );
}
