import type { Metadata } from 'next';
import { generateToolMetadata } from '@/lib/tool-metadata';

export const metadata: Metadata = generateToolMetadata({
  title: 'Color Converter - HEX, RGB, HSL, CSS Colors - Developer Tool',
  description:
    'Convert between color formats: HEX, RGB, HSL, and CSS. Pick colors visually and copy CSS-ready values instantly. Perfect for web designers and developers.',
  keywords: [
    'color',
    'converter',
    'hex',
    'rgb',
    'hsl',
    'css',
    'color picker',
    'color converter',
    'online tool',
  ],
  toolPath: 'color',
});

export { default } from './page';
