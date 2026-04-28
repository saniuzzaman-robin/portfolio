import { type LucideIcon, Zap, Target, Trophy, Puzzle, Scale } from 'lucide-react';

export type AchievementColor = 'green' | 'cyan' | 'purple';

export interface AchievementItem {
  icon: LucideIcon;
  tag: string;
  numericValue?: number;
  suffix?: string;
  stat: string;
  label: string;
  description: string;
  color: AchievementColor;
  delay: number;
}

export const ACHIEVEMENTS: AchievementItem[] = [
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
