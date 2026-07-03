import type { Metadata } from 'next';
import { generateToolMetadata } from '@/lib/tool-metadata';

export const metadata: Metadata = generateToolMetadata({
  title: 'JWT Decoder - Inspect & Verify JSON Web Tokens - Developer Tool',
  description:
    'Decode JWT tokens instantly. Inspect header, payload, and verify signatures. Check token expiry and structure at a glance. All processing done in your browser.',
  keywords: [
    'jwt',
    'decoder',
    'json web token',
    'token decoder',
    'jwt inspector',
    'token inspector',
    'verify jwt',
    'online tool',
    'authentication',
  ],
  toolPath: 'jwt',
});

export { default } from './page';
