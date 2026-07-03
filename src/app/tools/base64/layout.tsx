import type { Metadata } from 'next';
import { generateToolMetadata } from '@/lib/tool-metadata';

export const metadata: Metadata = generateToolMetadata({
  title: 'Base64 Encoder/Decoder - Developer Tool',
  description:
    'Encode any text to Base64 or decode Base64 back to plain text. Handles Unicode strings correctly. Fast, free, runs entirely in your browser with no data tracking.',
  keywords: [
    'base64',
    'encode',
    'decode',
    'encoder',
    'decoder',
    'base64 encoding',
    'text encoding',
    'online tool',
    'unicode',
  ],
  toolPath: 'base64',
});

export { default } from './page';
