import type { Metadata } from 'next';
import { generateToolMetadata } from '@/lib/tool-metadata';

export const metadata: Metadata = generateToolMetadata({
  title: 'Regex Tester - Live Regular Expression Matcher - Developer Tool',
  description:
    'Test regular expressions live with highlighted matches and groups. Explore regex flags interactively. Perfect for learning and debugging patterns.',
  keywords: [
    'regex',
    'regular expression',
    'regex tester',
    'pattern',
    'match',
    'test',
    'online tool',
    'regexp',
  ],
  toolPath: 'regex',
});

export { default } from './page';
