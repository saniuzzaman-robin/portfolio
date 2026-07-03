import type { Metadata } from 'next';
import { generateToolMetadata } from '@/lib/tool-metadata';

export const metadata: Metadata = generateToolMetadata({
  title: 'Diff Viewer - Text Comparison - Developer Tool',
  description:
    'Compare two texts side-by-side with line-by-line highlighting. Perfect for comparing code, configs, or documents. Instant visual diff in your browser.',
  keywords: ['diff', 'compare', 'text comparison', 'code diff', 'compare files', 'online tool'],
  toolPath: 'diff',
});

export { default } from './page';
