import type { Metadata } from 'next';
import { generateToolMetadata } from '@/lib/tool-metadata';

export const metadata: Metadata = generateToolMetadata({
  title: 'SQL Formatter & Minifier - Developer Tool',
  description:
    'Format SQL queries for readability or minify them for production. Supports common SQL dialects. Fast browser-based formatting with no data storage.',
  keywords: [
    'sql',
    'formatter',
    'minifier',
    'sql formatter',
    'format',
    'minify',
    'database',
    'query',
    'online tool',
  ],
  toolPath: 'sql',
});

export { default } from './page';
