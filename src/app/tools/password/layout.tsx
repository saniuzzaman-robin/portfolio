import type { Metadata } from 'next';
import { generateToolMetadata } from '@/lib/tool-metadata';

export const metadata: Metadata = generateToolMetadata({
  title: 'Secure Password Generator - Developer Tool',
  description:
    'Generate strong, random passwords with customizable length and character sets. Copy with one click. Cryptographically secure and no data storage.',
  keywords: [
    'password',
    'generator',
    'secure',
    'random',
    'strong password',
    'password generator',
    'online tool',
  ],
  toolPath: 'password',
});

export { default } from './page';
