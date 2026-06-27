'use client';

import { useCountUp } from '@/hooks/use-count-up';
import { ACHIEVEMENTS, type AchievementItem } from '@/lib/data/achievements';
import { av, ava } from '@/lib/accent';
import { StaggerContainer, StaggerItem } from '@/components/ui/motion-wrapper';
import { SectionHeader } from '@/components/ui/section-header';

function MetricCard({ item, index }: { item: AchievementItem; index: number }) {
  const { count, ref } = useCountUp(item.numericValue ?? 0, 2000);
  const accent = av(item.color);
  const accentA = (a: number) => ava(item.color, a);
  const Icon = item.icon;
  const displayStat = item.numericValue !== undefined ? `${count}${item.suffix ?? ''}` : item.stat;

  return (
    <StaggerItem>
      <div
        ref={ref}
        className="group relative overflow-hidden rounded-2xl glass p-6 transition-all duration-500 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/5 dark:hover:shadow-black/20"
      >
        {/* Hover gradient overlay */}
        <div
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          style={{
            background: `linear-gradient(135deg, ${accentA(0.08)}, transparent 60%)`,
          }}
        />

        <div className="relative">
          {/* Icon */}
          <div
            className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110"
            style={{ background: accentA(0.1), color: accent }}
          >
            <Icon className="h-5 w-5" strokeWidth={1.5} />
          </div>

          {/* Stat */}
          <div className="mb-2">
            <span
              className="font-heading text-4xl font-extrabold tabular-nums md:text-5xl"
              style={{ color: accent }}
            >
              {displayStat}
            </span>
          </div>

          {/* Label */}
          <h3 className="mb-1 text-sm font-semibold text-midnight-950">
            {item.label}
          </h3>

          {/* Description */}
          <p className="text-sm leading-relaxed text-midnight-500">
            {item.description}
          </p>
        </div>

        {/* Decorative number */}
        <span
          className="pointer-events-none absolute right-4 bottom-4 text-5xl font-extrabold leading-none select-none"
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
      {/* Background blobs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="aurora-blob aurora-blob-primary absolute top-20 right-1/4 h-100 w-100 opacity-10" />
        <div className="aurora-blob aurora-blob-secondary absolute -bottom-20 left-1/4 h-87.5 w-87.5 opacity-10" style={{ animationDelay: '-8s' }} />
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
      </div>
    </section>
  );
}
