import type { Metadata } from 'next';
import { generateToolMetadata } from '@/lib/tool-metadata';

export const metadata: Metadata = generateToolMetadata({
  title: 'Case Converter - camelCase, snake_case, kebab-case & More - Developer Tool',
  description:
    'Convert strings between different case formats: camelCase, snake_case, kebab-case, PascalCase, CONSTANT_CASE, and more. Essential for developers.',
  keywords: [
    'case',
    'case converter',
    'camelcase',
    'snake_case',
    'kebab-case',
    'pascalcase',
    'constant case',
    'convert',
    'format',
    'string',
    'online tool',
  ],
  toolPath: 'case-converter',
});

export { default } from './page';
