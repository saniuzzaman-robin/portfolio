import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ID Generator (UUID, ULID, NanoID) | Developer Tools',
  description:
    'Generate cryptographically random identifiers: UUID v4, UUID v7 (time-sortable), ULID, and NanoID. Bulk generation, copy-to-clipboard ready.',
  keywords: [
    'uuid',
    'ulid',
    'nanoid',
    'guid',
    'id generator',
    'random id',
    'uuid generator',
    'unique identifier',
  ],
  openGraph: {
    title: 'ID Generator | Developer Tools',
    description: 'Generate UUID v4/v7, ULID, and NanoID identifiers in bulk. All in your browser.',
    url: 'https://saniuzzaman.dev/tools/uuid',
  },
};

export { default } from './page';
