import {
  Binary,
  Hash,
  FileJson,
  Minimize2,
  KeyRound,
  Link2,
  Clock,
  Regex,
  Palette,
  Fingerprint,
  Type,
  FileText,
  Database,
  Lock,
  QrCode,
  FileCode2,
  CalendarClock,
  Code2,
  FileImage,
  Code,
  type LucideIcon,
} from 'lucide-react';
import type { AccentToken } from '@/lib/accent';

export interface DevTool {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  href: string;
  icon: LucideIcon;
  accent: AccentToken;
  tags: string[];
}

export const DEV_TOOLS: DevTool[] = [
  {
    id: 'base64',
    title: 'Base64',
    subtitle: 'Encoder / Decoder',
    description: 'Encode strings & files to Base64 or decode Base64 back to plain text instantly.',
    href: '/tools/base64',
    icon: Binary,
    accent: 'primary',
    tags: ['encode', 'decode', 'data'],
  },
  {
    id: 'uuid',
    title: 'ID Generator',
    subtitle: 'UUID · ULID · NanoID',
    description: 'Generate UUIDs v4/v7, ULIDs, and NanoIDs. Bulk generation with one click.',
    href: '/tools/uuid',
    icon: Fingerprint,
    accent: 'secondary',
    tags: ['uuid', 'ulid', 'nanoid', 'guid'],
  },
  {
    id: 'json',
    title: 'JSON Tools',
    subtitle: 'Format · Validate · Diff',
    description:
      'Pretty-print JSON, validate syntax, minify, and compare two JSON documents side by side.',
    href: '/tools/json',
    icon: FileJson,
    accent: 'tertiary',
    tags: ['format', 'validate', 'diff', 'minify'],
  },
  {
    id: 'minify',
    title: 'Minify / Beautify',
    subtitle: 'HTML · CSS · JS',
    description:
      'Minify HTML, CSS, and JavaScript for production or beautify minified code for reading.',
    href: '/tools/minify',
    icon: Minimize2,
    accent: 'primary',
    tags: ['html', 'css', 'js', 'compress'],
  },
  {
    id: 'jwt',
    title: 'JWT Decoder',
    subtitle: 'Inspect & Verify',
    description:
      'Decode JWT tokens, inspect header/payload, check expiry and structure at a glance.',
    href: '/tools/jwt',
    icon: KeyRound,
    accent: 'secondary',
    tags: ['jwt', 'token', 'auth', 'decode'],
  },
  {
    id: 'url',
    title: 'URL Tools',
    subtitle: 'Encode · Decode · Parse',
    description:
      'URL-encode/decode strings, parse query parameters, and build query strings visually.',
    href: '/tools/url',
    icon: Link2,
    accent: 'tertiary',
    tags: ['url', 'encode', 'decode', 'query'],
  },
  {
    id: 'hash',
    title: 'Hash Generator',
    subtitle: 'MD5 · SHA-256 · SHA-512',
    description:
      'Generate cryptographic hashes from any string. Compare hashes to verify integrity.',
    href: '/tools/hash',
    icon: Hash,
    accent: 'primary',
    tags: ['md5', 'sha256', 'sha512', 'checksum'],
  },
  {
    id: 'timestamp',
    title: 'Timestamp',
    subtitle: 'Unix ↔ Human Date',
    description:
      'Convert Unix timestamps to readable dates and back. Supports milliseconds and UTC offsets.',
    href: '/tools/timestamp',
    icon: Clock,
    accent: 'secondary',
    tags: ['unix', 'date', 'time', 'epoch'],
  },
  {
    id: 'regex',
    title: 'Regex Tester',
    subtitle: 'Live Match & Explain',
    description:
      'Test regular expressions live, see match groups highlighted, and explore flags interactively.',
    href: '/tools/regex',
    icon: Regex,
    accent: 'tertiary',
    tags: ['regex', 'pattern', 'match', 'test'],
  },
  {
    id: 'color',
    title: 'Color Converter',
    subtitle: 'HEX · RGB · HSL · CSS',
    description:
      'Convert between color formats, pick colors visually, and copy CSS-ready values instantly.',
    href: '/tools/color',
    icon: Palette,
    accent: 'primary',
    tags: ['color', 'hex', 'rgb', 'hsl'],
  },
  {
    id: 'case-converter',
    title: 'Case Converter',
    subtitle: 'camelCase · snake_case · kebab-case',
    description:
      'Convert strings between camelCase, snake_case, kebab-case, PascalCase, and more formats.',
    href: '/tools/case-converter',
    icon: Type,
    accent: 'secondary',
    tags: ['case', 'convert', 'format', 'string'],
  },
  {
    id: 'markdown',
    title: 'Markdown Preview',
    subtitle: 'Live Preview & Editor',
    description:
      'Write Markdown and preview the rendered HTML instantly. Perfect for documentation.',
    href: '/tools/markdown',
    icon: FileText,
    accent: 'tertiary',
    tags: ['markdown', 'preview', 'html', 'editor'],
  },
  {
    id: 'csv-json',
    title: 'CSV to JSON',
    subtitle: 'Convert & Format',
    description:
      'Convert CSV data to JSON format instantly. Supports headers, custom delimiters, and bulk processing.',
    href: '/tools/csv-json',
    icon: Database,
    accent: 'primary',
    tags: ['csv', 'json', 'data', 'convert'],
  },
  {
    id: 'password',
    title: 'Password Generator',
    subtitle: 'Secure & Customizable',
    description:
      'Generate strong, random passwords with customizable length and character sets. Copy with one click.',
    href: '/tools/password',
    icon: Lock,
    accent: 'secondary',
    tags: ['password', 'generator', 'secure', 'random'],
  },
  {
    id: 'qr-code',
    title: 'QR Code',
    subtitle: 'Generator & Reader',
    description: 'Generate QR codes from any text or URL. Download as PNG. Fast and reliable.',
    href: '/tools/qr-code',
    icon: QrCode,
    accent: 'tertiary',
    tags: ['qr', 'code', 'generator', 'barcode'],
  },
  {
    id: 'diff',
    title: 'Diff Viewer',
    subtitle: 'Text Comparison',
    description:
      'Compare two texts side-by-side with line-by-line highlighting. Perfect for comparing code, configs, or documents.',
    href: '/tools/diff',
    icon: FileCode2,
    accent: 'primary',
    tags: ['diff', 'compare', 'text', 'code'],
  },
  {
    id: 'lorem',
    title: 'Lorem Ipsum',
    subtitle: 'Placeholder Generator',
    description:
      'Generate placeholder text in various styles (Lorem, Bacon, Hipster, Corporate). Perfect for mockups and testing.',
    href: '/tools/lorem',
    icon: FileText,
    accent: 'secondary',
    tags: ['lorem', 'placeholder', 'text', 'generator'],
  },
  {
    id: 'cron',
    title: 'Cron Expression',
    subtitle: 'Builder & Tester',
    description:
      'Build and test cron expressions visually. Get human-readable explanations and preview execution schedules.',
    href: '/tools/cron',
    icon: CalendarClock,
    accent: 'tertiary',
    tags: ['cron', 'schedule', 'timer', 'expression'],
  },
  {
    id: 'sql',
    title: 'SQL Formatter',
    subtitle: 'Format & Minify',
    description:
      'Format SQL queries for readability or minify them for production. Supports common SQL dialects.',
    href: '/tools/sql',
    icon: Database,
    accent: 'primary',
    tags: ['sql', 'format', 'database', 'query'],
  },
  {
    id: 'html-entities',
    title: 'HTML Entities',
    subtitle: 'Encode / Decode',
    description:
      'Encode special characters to HTML entities or decode them back. Essential for safe HTML display.',
    href: '/tools/html-entities',
    icon: Code2,
    accent: 'secondary',
    tags: ['html', 'entities', 'encode', 'decode'],
  },
  {
    id: 'slug',
    title: 'Text Transform',
    subtitle: 'Slug · Case Converter',
    description:
      'Transform text between different formats: URL slugs, camelCase, snake_case, kebab-case, and more.',
    href: '/tools/slug',
    icon: Type,
    accent: 'primary',
    tags: ['slug', 'case', 'transform', 'convert'],
  },
  {
    id: 'image-base64',
    title: 'Image to Base64',
    subtitle: 'Convert & Embed',
    description:
      'Convert images to Base64 encoding. Perfect for embedding images in HTML, CSS, or JSON.',
    href: '/tools/image-base64',
    icon: FileImage,
    accent: 'primary',
    tags: ['image', 'base64', 'encode', 'embed'],
  },
  {
    id: 'yaml-json',
    title: 'YAML ↔ JSON',
    subtitle: 'Converter',
    description:
      'Convert between YAML and JSON formats. Perfect for config files, Kubernetes manifests, and CI/CD pipelines.',
    href: '/tools/yaml-json',
    icon: Code,
    accent: 'secondary',
    tags: ['yaml', 'json', 'convert', 'config'],
  },
];
