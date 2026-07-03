import type { Metadata } from 'next';
import { generateToolMetadata } from '@/lib/tool-metadata';

export const metadata: Metadata = generateToolMetadata({
  title: 'Unix Timestamp Converter - Developer Tool',
  description:
    'Convert Unix timestamps to readable dates and back. Supports milliseconds and UTC offsets. Instant timezone-aware conversions in your browser.',
  keywords: [
    'timestamp',
    'unix timestamp',
    'unix time',
    'converter',
    'epoch',
    'date converter',
    'time converter',
    'online tool',
  ],
  toolPath: 'timestamp',
});

export { default } from './page';
