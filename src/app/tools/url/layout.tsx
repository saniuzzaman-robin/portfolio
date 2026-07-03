import type { Metadata } from 'next';
import { generateToolMetadata } from '@/lib/tool-metadata';

export const metadata: Metadata = generateToolMetadata({
  title: 'URL Encoder/Decoder & Query Parser - Developer Tool',
  description:
    'URL-encode/decode strings, parse query parameters, and build query strings visually. Perfect for debugging URLs and working with web APIs.',
  keywords: [
    'url',
    'url encoder',
    'url decoder',
    'encode',
    'decode',
    'query parser',
    'query string',
    'uri',
  ],
  toolPath: 'url',
});

export { default } from './page';
