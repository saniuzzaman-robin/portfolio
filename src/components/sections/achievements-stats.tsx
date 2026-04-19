'use client';

import { Zap, Target, Trophy, Puzzle } from 'lucide-react';
import { StatCard } from '../reusable/stat-card';

export function AchievementsStats() {
  const stats = [
    {
      number: '5+',
      label: 'Years of Experience',
      color: 'primary' as const,
      icon: Zap,
    },
    {
      number: '1700+',
      label: 'Problems Solved',
      color: 'secondary' as const,
      icon: Target,
    },
    {
      number: '10+',
      label: 'National Contests',
      color: 'tertiary' as const,
      icon: Trophy,
    },
    {
      number: '50+',
      label: 'Reusable Components',
      color: 'primary' as const,
      icon: Puzzle,
    },
  ];

  return (
    <section className="px-6 py-20 md:px-12 lg:px-20 bg-neutral-10">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <StatCard key={index} {...stat} delay={index * 100} />
          ))}
        </div>
      </div>
    </section>
  );
}
