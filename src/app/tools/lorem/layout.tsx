import type { Metadata } from 'next';
import { generateToolMetadata } from '@/lib/tool-metadata';

export const metadata: Metadata = generateToolMetadata({
  title: 'Lorem Ipsum Generator - Placeholder Text - Developer Tool',
  description:
    'Generate placeholder text in various styles: Lorem Ipsum, Bacon, Hipster, and Corporate. Perfect for mockups, prototypes, and testing. Customizable length.',
  keywords: [
    'lorem',
    'lorem ipsum',
    'placeholder',
    'generator',
    'placeholder text',
    'dummy text',
    'online tool',
  ],
  toolPath: 'lorem',
});

export { default } from './page';
