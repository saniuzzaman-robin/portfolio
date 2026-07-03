import type { Metadata } from 'next';
import { generateToolMetadata } from '@/lib/tool-metadata';

export const metadata: Metadata = generateToolMetadata({
  title: 'Markdown Preview - Live Markdown Editor & Renderer - Developer Tool',
  description:
    'Write Markdown and preview the rendered HTML instantly. Perfect for documentation, README files, and blog posts. WYSIWYG editor in your browser.',
  keywords: [
    'markdown',
    'preview',
    'editor',
    'renderer',
    'live preview',
    'html',
    'documentation',
    'readme',
    'online tool',
  ],
  toolPath: 'markdown',
});

export { default } from './page';
