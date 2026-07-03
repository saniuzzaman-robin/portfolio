import type { Metadata } from 'next';
import { generateToolMetadata } from '@/lib/tool-metadata';

export const metadata: Metadata = generateToolMetadata({
  title: 'HTML Entities Encoder/Decoder - Developer Tool',
  description:
    'Encode special characters to HTML entities or decode them back. Essential for safe HTML display and preventing XSS vulnerabilities.',
  keywords: [
    'html',
    'entities',
    'encoder',
    'decoder',
    'html entities',
    'encode',
    'decode',
    'online tool',
  ],
  toolPath: 'html-entities',
});

export { default } from './page';
