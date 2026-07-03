import type { Metadata } from 'next';
import { generateToolMetadata } from '@/lib/tool-metadata';

export const metadata: Metadata = generateToolMetadata({
  title: 'UUID Generator | UUID v4, v7, ULID, NanoID - Developer Tool',
  description:
    'Generate cryptographically random identifiers: UUID v4, UUID v7 (time-sortable), ULID, and NanoID. Bulk generation, copy-to-clipboard ready. No sign-up required.',
  keywords: [
    'uuid',
    'uuid generator',
    'uuid v4',
    'uuid v7',
    'ulid',
    'ulid generator',
    'nanoid',
    'guid',
    'id generator',
    'random id',
    'unique identifier',
    'online tool',
  ],
  toolPath: 'uuid',
});

export { default } from './page';
