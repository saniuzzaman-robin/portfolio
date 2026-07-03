import type { Metadata } from 'next';
import { generateToolMetadata } from '@/lib/tool-metadata';

export const metadata: Metadata = generateToolMetadata({
  title: 'QR Code Generator - Create & Download QR Codes - Developer Tool',
  description:
    'Generate QR codes from any text or URL. Download as PNG. Fast, reliable, and works entirely in your browser. No sign-up required.',
  keywords: ['qr', 'qr code', 'generator', 'barcode', 'qr code generator', 'online tool'],
  toolPath: 'qr-code',
});

export { default } from './page';
