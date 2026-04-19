'use client';

import { LucideIcon } from 'lucide-react';

type ColorType = 'primary' | 'secondary' | 'tertiary' | 'neutral';

interface StatCardProps {
  number: string;
  label: string;
  color: ColorType;
  icon: LucideIcon;
  delay?: number;
}

const colorMap: Record<ColorType, { text: string; background: string }> = {
  primary: {
    text: 'text-primary-50',
    background: 'from-primary-50/10 to-primary-50/5',
  },
  secondary: {
    text: 'text-secondary-50',
    background: 'from-secondary-50/10 to-secondary-50/5',
  },
  tertiary: {
    text: 'text-tertiary-50',
    background: 'from-tertiary-50/10 to-tertiary-50/5',
  },
  neutral: {
    text: 'text-neutral-70',
    background: 'from-neutral-50/10 to-neutral-50/5',
  },
};

export function StatCard({ number, label, color, icon: Icon, delay = 0 }: StatCardProps) {
  const colorClasses = colorMap[color];

  return (
    <div
      className={`bg-linear-to-br ${colorClasses.background} rounded-2xl p-8 border border-neutral-20 hover:border-neutral-30 transition-all duration-300 animate-scale-in hover:shadow-lg group will-change-transform`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div
        className={`${colorClasses.text} mb-4 group-hover:scale-110 transition-transform duration-300 will-change-transform`}
      >
        <Icon className="w-8 h-8" strokeWidth={1.5} />
      </div>
      <p className={`${colorClasses.text} font-space-grotesk text-3xl md:text-4xl font-bold mb-2`}>
        {number}
      </p>
      <p className="text-neutral-70 text-sm font-medium">{label}</p>
    </div>
  );
}
