'use client';

import { useEffect, useRef, useState } from 'react';
import { Zap, Target, Trophy, Puzzle } from 'lucide-react';

function useCountUp(target: number, duration: number = 1500) {
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
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration]);

  return { count, ref };
}

interface NeonStatCardProps {
  number: string;
  numericValue: number;
  label: string;
  sublabel: string;
  color: 'green' | 'cyan' | 'purple';
  icon: React.ElementType;
  delay: number;
}

function NeonStatCard({
  number,
  numericValue,
  label,
  sublabel,
  color,
  icon: Icon,
  delay,
}: NeonStatCardProps) {
  const { count, ref } = useCountUp(numericValue, 1800);
  const suffix = number.replace(/\d+/g, '');

  const colorStyles = {
    green: {
      text: 'neon-green',
      border: 'border-primary-50/30',
      hoverBorder: 'hover:border-primary-50/60',
      box: 'neon-box-green',
      bg: 'bg-primary-50/5',
      iconColor: 'text-primary-50',
    },
    cyan: {
      text: 'neon-cyan',
      border: 'border-secondary-50/30',
      hoverBorder: 'hover:border-secondary-50/60',
      box: 'neon-box-cyan',
      bg: 'bg-secondary-50/5',
      iconColor: 'text-secondary-50',
    },
    purple: {
      text: 'neon-purple',
      border: 'border-tertiary-50/30',
      hoverBorder: 'hover:border-tertiary-50/60',
      box: 'neon-box-purple',
      bg: 'bg-tertiary-50/5',
      iconColor: 'text-tertiary-50',
    },
  };

  const s = colorStyles[color];

  return (
    <div
      ref={ref}
      className={`glass rounded-sm border ${s.border} ${s.hoverBorder} p-8 transition-all duration-500 group hover:scale-105 hover:${s.box} animate-scale-in cursor-default`}
      style={{ animationDelay: `${delay}ms`, animationFillMode: 'both' }}
    >
      {/* Icon */}
      <div className={`mb-4 ${s.iconColor} opacity-60 group-hover:opacity-100 transition-opacity`}>
        <Icon className="w-6 h-6" strokeWidth={1.5} />
      </div>

      {/* Number */}
      <div className={`font-space-grotesk font-bold text-5xl mb-2 ${s.text} tabular-nums`}>
        {count}
        {suffix}
      </div>

      {/* Label */}
      <div className="font-space-grotesk font-bold text-neutral-80 text-sm uppercase tracking-widest mb-1">
        {label}
      </div>
      <div className="text-neutral-70 text-xs">{sublabel}</div>

      {/* Bottom bar */}
      <div
        className={`mt-6 h-px w-0 group-hover:w-full ${s.bg} bg-linear-to-r transition-all duration-700`}
        style={{ background: `linear-gradient(to right, currentColor, transparent)` }}
      />
    </div>
  );
}

export function AchievementsStats() {
  const stats = [
    {
      number: '5+',
      numericValue: 5,
      label: 'Years',
      sublabel: 'of professional experience',
      color: 'green' as const,
      icon: Zap,
      delay: 0,
    },
    {
      number: '1700+',
      numericValue: 1700,
      label: 'Problems Solved',
      sublabel: 'across competitive platforms',
      color: 'cyan' as const,
      icon: Target,
      delay: 100,
    },
    {
      number: '10+',
      numericValue: 10,
      label: 'National Contests',
      sublabel: 'ICPC, NCPC & more',
      color: 'purple' as const,
      icon: Trophy,
      delay: 200,
    },
    {
      number: '50+',
      numericValue: 50,
      label: 'Components',
      sublabel: 'reusable UI components built',
      color: 'green' as const,
      icon: Puzzle,
      delay: 300,
    },
  ];

  return (
    <section className="px-6 py-20 md:px-12 lg:px-20 relative cyber-grid-dense">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <NeonStatCard key={i} {...stat} />
          ))}
        </div>
      </div>
    </section>
  );
}
