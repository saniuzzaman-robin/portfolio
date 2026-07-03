import type { Metadata } from 'next';
import { generateToolMetadata } from '@/lib/tool-metadata';

export const metadata: Metadata = generateToolMetadata({
  title: 'Image to Base64 Converter - Developer Tool',
  description:
    'Convert images to Base64 encoding. Perfect for embedding images in HTML, CSS, or JSON. Supports all common image formats. No file uploads to servers.',
  keywords: ['image', 'base64', 'converter', 'encode', 'image to base64', 'embed', 'online tool'],
  toolPath: 'image-base64',
});

export { default } from './page';
