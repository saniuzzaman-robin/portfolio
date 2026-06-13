import { type LucideIcon, Zap, Target, Trophy, BookOpen, TrendingUp } from 'lucide-react';
import type { AccentToken } from '@/lib/accent';

export interface AchievementItem {
  icon: LucideIcon;
  tag: string;
  numericValue?: number;
  suffix?: string;
  stat: string;
  label: string;
  description: string;
  color: AccentToken;
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
      'Full-stack software engineer building scalable applications with NestJS, Next.js, and Angular across production systems with 180M+ app downloads.',
    color: 'primary',
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
      'Solved across Codeforces (Specialist, Max 1544), Codechef, LightOJ & UVA — covering dynamic programming, graph theory, segment trees, and advanced data structures.',
    color: 'secondary',
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
      'Participated in ICPC Dhaka Regional, NCPC, and university-level circuits across Bangladesh. Led CP team and was selected for the university first-choice team.',
    color: 'tertiary',
    delay: 160,
  },
  {
    icon: BookOpen,
    tag: 'Community',
    stat: 'Judge',
    label: 'Problem Setter',
    description:
      'Designed, tested, and judged problems for several intra and inter-university programming contests, ensuring mathematical rigor and fairness.',
    color: 'primary',
    delay: 240,
  },
  {
    icon: TrendingUp,
    tag: 'Impact',
    numericValue: 30,
    suffix: '% YoY',
    stat: '30% YoY',
    label: 'Donation Increase',
    description:
      'Re-platformed the MuslimPro Giving donation engine from WordPress to Next.js/WooCommerce with advanced SEO — drove a 30% year-over-year increase in donations in 2025–2026.',
    color: 'secondary',
    delay: 320,
  },
];
