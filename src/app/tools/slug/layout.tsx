import type { Metadata } from 'next';
import { generateToolMetadata } from '@/lib/tool-metadata';

export const metadata: Metadata = generateToolMetadata({
  title: 'Text Transform - Slug, Case Converter & More - Developer Tool',
  description:
    'Transform text between different formats: URL slugs, camelCase, snake_case, kebab-case, PascalCase, and CONSTANT_CASE. All-in-one text transformation tool.',
  keywords: [
    'slug',
    'text transform',
    'url slug',
    'slugify',
    'case converter',
    'camelcase',
    'snake_case',
    'kebab-case',
    'online tool',
  ],
  toolPath: 'slug',
});

export { default } from './page';
