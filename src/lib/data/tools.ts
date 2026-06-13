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
];
