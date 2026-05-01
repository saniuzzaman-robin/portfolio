'use client';

import { LucideIcon } from 'lucide-react';
import { ACCENT_CLASSES, type AccentToken } from '@/lib/accent';

type StatCardColor = AccentToken | 'neutral';

interface StatCardProps {
  number: string;
  label: string;
  color: StatCardColor;
  icon: LucideIcon;
  delay?: number;
}

const NEUTRAL_CLASSES = {
  text: 'text-neutral-70',
  background: 'from-neutral-50/10 to-neutral-50/5',
};
const BG_MAP: Record<AccentToken, string> = {
  primary: 'from-primary-50/10 to-primary-50/5',
  secondary: 'from-secondary-50/10 to-secondary-50/5',
  tertiary: 'from-tertiary-50/10 to-tertiary-50/5',
};

export function StatCard({ number, label, color, icon: Icon, delay = 0 }: StatCardProps) {
  const textClass = color === 'neutral' ? NEUTRAL_CLASSES.text : ACCENT_CLASSES[color].text;
  const bgClass = color === 'neutral' ? NEUTRAL_CLASSES.background : BG_MAP[color];

  return (
    <div
      className={`bg-linear-to-br ${bgClass} rounded-2xl p-8 border border-neutral-20 hover:border-neutral-30 transition-all duration-300 animate-scale-in hover:shadow-lg group will-change-transform`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div
        className={`${textClass} mb-4 group-hover:scale-110 transition-transform duration-300 will-change-transform`}
      >
        <Icon className="w-8 h-8" strokeWidth={1.5} />
      </div>
      <p className={`${textClass} font-space-grotesk text-3xl md:text-4xl font-bold mb-2`}>
        {number}
      </p>
      <p className="text-neutral-70 text-sm font-medium">{label}</p>
    </div>
  );
}
