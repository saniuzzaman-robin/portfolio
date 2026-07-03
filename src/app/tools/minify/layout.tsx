import type { Metadata } from 'next';
import { generateToolMetadata } from '@/lib/tool-metadata';

export const metadata: Metadata = generateToolMetadata({
  title: 'HTML, CSS & JavaScript Minifier/Beautifier - Developer Tool',
  description:
    'Minify HTML, CSS, and JavaScript for production optimization. Beautify minified code for reading and debugging. Compress for smaller file sizes. Fast browser-based processing.',
  keywords: [
    'minify',
    'minifier',
    'beautify',
    'html',
    'css',
    'javascript',
    'js',
    'compress',
    'compression',
    'online tool',
    'code optimizer',
  ],
  toolPath: 'minify',
});

export { default } from './page';
