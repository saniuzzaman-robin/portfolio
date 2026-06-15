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
      className={`bg-linear-to-br ${bgClass} border-neutral-20 hover:border-neutral-30 animate-scale-in group rounded-2xl border p-8 transition-all duration-300 will-change-transform hover:shadow-lg`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div
        className={`${textClass} mb-4 transition-transform duration-300 will-change-transform group-hover:scale-110`}
      >
        <Icon className="h-8 w-8" strokeWidth={1.5} />
      </div>
      <p className={`${textClass} font-poppins mb-2 text-3xl font-bold md:text-4xl`}>
        {number}
      </p>
      <p className="text-neutral-70 text-sm font-medium">{label}</p>
    </div>
  );
}
