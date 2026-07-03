import type { Metadata } from 'next';
import { generateToolMetadata } from '@/lib/tool-metadata';

export const metadata: Metadata = generateToolMetadata({
  title: 'Cryptographic Hash Generator - MD5, SHA256, SHA512 - Developer Tool',
  description:
    'Generate MD5, SHA-256, SHA-512, and other cryptographic hashes from any string. Compare hashes to verify integrity. Fast and secure browser-based processing.',
  keywords: [
    'hash',
    'generator',
    'md5',
    'sha256',
    'sha-256',
    'sha512',
    'sha-512',
    'hash generator',
    'checksum',
    'cryptographic',
    'online tool',
  ],
  toolPath: 'hash',
});

export { default } from './page';
