import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Base64 Encoder/Decoder | Developer Tools',
  description:
    'Encode any text to Base64 or decode Base64 back to plain text. Handles Unicode strings correctly. Fast, free, runs entirely in your browser.',
  keywords: [
    'base64',
    'encode',
    'decode',
    'encoder',
    'decoder',
    'base64 encoding',
    'text encoding',
  ],
  openGraph: {
    title: 'Base64 Encoder/Decoder | Developer Tools',
    description: 'Encode & decode Base64 strings instantly. Unicode support, no server processing.',
    url: 'https://saniuzzaman.dev/tools/base64',
  },
};

export { default } from './page';
