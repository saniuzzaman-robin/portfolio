import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'JSON Tools (Format, Validate, Diff, Minify) | Developer Tools',
  description:
    'Format, validate, minify, and compare JSON documents. Pretty-print with custom indentation, validate syntax, and diff two JSON files side by side.',
  keywords: [
    'json',
    'format',
    'validate',
    'minify',
    'diff',
    'json formatter',
    'json validator',
    'json compare',
    'json beautify',
  ],
  openGraph: {
    title: 'JSON Tools | Developer Tools',
    description:
      'Format, validate, minify, and diff JSON. Custom indentation, instant validation, side-by-side comparison.',
    url: 'https://saniuzzaman.dev/tools/json',
  },
};

export { default } from './page';
