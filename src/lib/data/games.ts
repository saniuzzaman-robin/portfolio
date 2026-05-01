import { Zap, Brain, Grid3X3, type LucideIcon } from 'lucide-react';
import type { AccentToken } from '@/lib/accent';

export interface Game {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  href: string;
  icon: LucideIcon;
  accent: AccentToken;
  controls: string[];
  difficulty: string;
  tech: string[];
}

export const GAMES: Game[] = [
  {
    id: 'snake',
    title: 'Snake',
    subtitle: 'Classic Arcade',
    description:
      'Navigate the neon serpent, collect data packets, avoid collisions. How long can your chain grow?',
    href: '/games/snake',
    icon: Zap,
    accent: 'primary',
    controls: ['Arrow Keys', 'WASD', 'Swipe'],
    difficulty: 'Easy → Hard',
    tech: ['Canvas API', 'requestAnimationFrame', 'Keyboard Events'],
  },
  {
    id: 'tetris',
    title: 'Tetris',
    subtitle: 'Block Stacker',
    description:
      'Drop tetrominos, clear lines, survive the cascade. A classic reimagined with neon aesthetics.',
    href: '/games/tetris',
    icon: Grid3X3,
    accent: 'secondary',
    controls: ['Arrow Keys', 'Space to Drop', 'Z to Rotate'],
    difficulty: 'Medium → Expert',
    tech: ['Canvas API', 'State Machine', 'Collision Detection'],
  },
  {
    id: 'memory',
    title: 'Memory Match',
    subtitle: 'Card Flip Game',
    description:
      'Flip holographic cards, find matching pairs, beat the clock. Tests your pattern recognition.',
    href: '/games/memory',
    icon: Brain,
    accent: 'tertiary',
    controls: ['Click / Tap'],
    difficulty: 'Medium',
    tech: ['CSS 3D Transforms', 'React State', 'Timer Hook'],
  },
];
