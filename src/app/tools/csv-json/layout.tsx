import type { Metadata } from 'next';
import { generateToolMetadata } from '@/lib/tool-metadata';

export const metadata: Metadata = generateToolMetadata({
  title: 'CSV to JSON Converter - Developer Tool',
  description:
    'Convert CSV data to JSON format instantly. Supports headers, custom delimiters, and bulk processing. Perfect for data transformation and API integration.',
  keywords: ['csv', 'json', 'converter', 'convert', 'csv to json', 'data', 'format', 'online tool'],
  toolPath: 'csv-json',
});

export { default } from './page';
