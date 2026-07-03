import type { Metadata } from 'next';
import { generateToolMetadata } from '@/lib/tool-metadata';

export const metadata: Metadata = generateToolMetadata({
  title: 'YAML to JSON Converter - Developer Tool',
  description:
    'Convert between YAML and JSON formats instantly. Perfect for config files, Kubernetes manifests, and CI/CD pipelines. Fast and accurate conversion.',
  keywords: [
    'yaml',
    'json',
    'converter',
    'convert',
    'yaml to json',
    'json to yaml',
    'config',
    'online tool',
  ],
  toolPath: 'yaml-json',
});

export { default } from './page';
