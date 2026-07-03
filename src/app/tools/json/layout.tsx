import type { Metadata } from 'next';
import { generateToolMetadata } from '@/lib/tool-metadata';

export const metadata: Metadata = generateToolMetadata({
  title: 'JSON Formatter, Validator & Diff Tool - Developer Tool',
  description:
    'Format, validate, minify, and compare JSON documents. Pretty-print with custom indentation, validate syntax, side-by-side diff, and more. All in your browser.',
  keywords: [
    'json',
    'format',
    'formatter',
    'validate',
    'validator',
    'minify',
    'minifier',
    'diff',
    'json diff',
    'json formatter',
    'json validator',
    'json compare',
    'json beautify',
    'online tool',
  ],
  toolPath: 'json',
});

export { default } from './page';
