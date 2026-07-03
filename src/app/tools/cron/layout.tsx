import type { Metadata } from 'next';
import { generateToolMetadata } from '@/lib/tool-metadata';

export const metadata: Metadata = generateToolMetadata({
  title: 'Cron Expression Builder & Tester - Developer Tool',
  description:
    'Build and test cron expressions visually. Get human-readable explanations and preview execution schedules. Perfect for job scheduling and automation.',
  keywords: [
    'cron',
    'cron expression',
    'cron builder',
    'schedule',
    'scheduler',
    'timer',
    'expression',
    'online tool',
  ],
  toolPath: 'cron',
});

export { default } from './page';
