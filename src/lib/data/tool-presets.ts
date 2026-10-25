import type { Messages } from '@/i18n/messages/en';
import { TOOLS_PATH, type ToolSlug } from './tools';

/**
 * Deep links into one view of a tool, e.g. `/tools/generate/uuid-generator`. Each preset is a
 * prerendered, indexable landing page with its own title and description that opens its tool in
 * the right mode. Add one by giving it text under `tools.presets` in every locale.
 */
export type PresetKey = keyof Messages['tools']['presets'];

export type ToolPreset = {
  /** Also the URL segment after the tool's slug. */
  key: PresetKey;
  slug: ToolSlug;
  /** Query params (see `TOOL_PARAMS`) that put the tool in this view; list values are comma-separated. */
  params: Record<string, string>;
  /** Extra search terms for this view (untranslated: "guid", "bcrypt"…). */
  keywords: string[];
};

/** A persisted tool setting that a URL query param can set. */
export type ToolParam = {
  /** The `usePersistentState` key, without its `tools:` prefix. */
  key: string;
  /** The setting is a list; the param holds comma-separated values. */
  list?: boolean;
};

/**
 * The query params each tool understands (`?mode=minify`, `?language=sql`…) and the setting each
 * one sets. Values are validated by the tool's own setting, which ignores anything it doesn't
 * know. A preset's `params` use the same names.
 */
export const TOOL_PARAMS: Partial<Record<ToolSlug, Record<string, ToolParam>>> = {
  json: { mode: { key: 'json:mode' } },
  format: { mode: { key: 'format:mode' }, language: { key: 'format:language' } },
  convert: { conversion: { key: 'convert:conversion' } },
  encode: { mode: { key: 'encode:mode' } },
  jwt: { mode: { key: 'jwt:mode' } },
  crypto: {
    mode: { key: 'crypto:mode' },
    algorithms: { key: 'crypto:algorithms', list: true },
  },
  generate: { mode: { key: 'generate:mode' }, kind: { key: 'generate:ids' } },
  time: { mode: { key: 'time:mode' } },
  diff: { mode: { key: 'diff:mode' } },
  regex: { mode: { key: 'regex:mode' } },
  text: { mode: { key: 'text:mode' } },
  network: { mode: { key: 'network:mode' } },
  'qr-code': { type: { key: 'qr:type' } },
};

export const TOOL_PRESETS: ToolPreset[] = [
  {
    key: 'uuid-generator',
    slug: 'generate',
    params: { mode: 'ids', kind: 'uuid-v4' },
    keywords: ['guid generator', 'uuid generator', 'uuid v4', 'random uuid', 'generate guid'],
  },
  {
    key: 'uuid-v7-generator',
    slug: 'generate',
    params: { mode: 'ids', kind: 'uuid-v7' },
    keywords: ['uuid v7', 'uuidv7 generator', 'time-ordered uuid', 'sortable uuid'],
  },
  {
    key: 'ulid-generator',
    slug: 'generate',
    params: { mode: 'ids', kind: 'ulid' },
    keywords: ['ulid', 'ulid generator', 'sortable id', 'generate ulid'],
  },
  {
    key: 'password-generator',
    slug: 'generate',
    params: { mode: 'password' },
    keywords: ['password generator', 'random password', 'passphrase generator', 'strong password'],
  },
  {
    key: 'uuid-decoder',
    slug: 'generate',
    params: { mode: 'inspect' },
    keywords: ['uuid decoder', 'uuid inspector', 'ulid decoder', 'objectid timestamp'],
  },
  {
    key: 'json-minifier',
    slug: 'json',
    params: { mode: 'minify' },
    keywords: ['json minifier', 'minify json', 'compress json', 'json compact'],
  },
  {
    key: 'json-tree-viewer',
    slug: 'json',
    params: { mode: 'tree' },
    keywords: ['json viewer', 'json tree viewer', 'json explorer', 'json online viewer'],
  },
  {
    key: 'jsonpath-tester',
    slug: 'json',
    params: { mode: 'query' },
    keywords: ['jsonpath tester', 'jsonpath evaluator', 'jsonpath online', 'json query'],
  },
  {
    key: 'json-escape',
    slug: 'json',
    params: { mode: 'escape' },
    keywords: ['json escape', 'json stringify online', 'escape json string', 'json unescape'],
  },
  {
    key: 'url-encoder',
    slug: 'encode',
    params: { mode: 'url' },
    keywords: ['url encoder', 'url decoder', 'percent encoding', 'encodeuricomponent'],
  },
  {
    key: 'html-entity-encoder',
    slug: 'encode',
    params: { mode: 'html' },
    keywords: ['html entities', 'html encoder', 'html decoder', 'escape html'],
  },
  {
    key: 'image-to-base64',
    slug: 'encode',
    params: { mode: 'file' },
    keywords: ['image to base64', 'file to base64', 'data uri generator', 'base64 image'],
  },
  {
    key: 'url-parser',
    slug: 'encode',
    params: { mode: 'urlParts' },
    keywords: ['url parser', 'query string parser', 'parse url', 'url components'],
  },
  {
    key: 'jwt-generator',
    slug: 'jwt',
    params: { mode: 'encode' },
    keywords: ['jwt generator', 'jwt encoder', 'create jwt', 'sign jwt', 'hs256', 'rs256'],
  },
  {
    key: 'bcrypt-generator',
    slug: 'crypto',
    params: { mode: 'bcrypt' },
    keywords: ['bcrypt generator', 'bcrypt hash', 'bcrypt verify', 'bcrypt online'],
  },
  {
    key: 'aes-encryption',
    slug: 'crypto',
    params: { mode: 'aes' },
    keywords: ['aes encrypt', 'aes decrypt', 'aes online', 'aes gcm', 'text encryption'],
  },
  {
    key: 'key-pair-generator',
    slug: 'crypto',
    params: { mode: 'keys' },
    keywords: ['rsa key generator', 'ssh key pair', 'ed25519 key generator', 'pem', 'jwk'],
  },
  {
    key: 'date-difference-calculator',
    slug: 'time',
    params: { mode: 'diff' },
    keywords: ['date difference', 'days between dates', 'date calculator', 'duration calculator'],
  },
  {
    key: 'cron-expression-parser',
    slug: 'time',
    params: { mode: 'cron' },
    keywords: ['cron expression', 'cron parser', 'cron explainer', 'crontab', 'quartz cron'],
  },
  {
    key: 'json-diff',
    slug: 'diff',
    params: { mode: 'json' },
    keywords: ['json diff', 'compare json', 'json compare', 'json difference'],
  },
  {
    key: 'word-counter',
    slug: 'text',
    params: { mode: 'count' },
    keywords: ['word counter', 'character counter', 'word count', 'text counter'],
  },
  {
    key: 'lorem-ipsum-generator',
    slug: 'text',
    params: { mode: 'lorem' },
    keywords: ['lorem ipsum', 'lorem ipsum generator', 'placeholder text', 'dummy text'],
  },
  {
    key: 'javascript-minifier',
    slug: 'format',
    params: { language: 'javascript', mode: 'minify' },
    keywords: ['javascript minifier', 'minify js', 'js minifier', 'terser online', 'uglify'],
  },
  {
    key: 'css-minifier',
    slug: 'format',
    params: { language: 'css', mode: 'minify' },
    keywords: ['css minifier', 'minify css', 'compress css'],
  },
  {
    key: 'html-minifier',
    slug: 'format',
    params: { language: 'html', mode: 'minify' },
    keywords: ['html minifier', 'minify html', 'compress html'],
  },
  {
    key: 'sql-formatter',
    slug: 'format',
    params: { language: 'sql', mode: 'beautify' },
    keywords: ['sql formatter', 'format sql', 'sql beautifier', 'sql pretty print'],
  },
  {
    key: 'xml-formatter',
    slug: 'format',
    params: { language: 'xml', mode: 'beautify' },
    keywords: ['xml formatter', 'format xml', 'xml beautifier', 'xml pretty print'],
  },
  {
    key: 'yaml-formatter',
    slug: 'format',
    params: { language: 'yaml', mode: 'beautify' },
    keywords: ['yaml formatter', 'format yaml', 'yaml validator', 'yaml beautifier'],
  },
  {
    key: 'json-to-yaml',
    slug: 'convert',
    params: { conversion: 'json-yaml' },
    keywords: ['json to yaml', 'convert json to yaml'],
  },
  {
    key: 'yaml-to-json',
    slug: 'convert',
    params: { conversion: 'yaml-json' },
    keywords: ['yaml to json', 'convert yaml to json'],
  },
  {
    key: 'json-to-csv',
    slug: 'convert',
    params: { conversion: 'json-csv' },
    keywords: ['json to csv', 'convert json to csv'],
  },
  {
    key: 'csv-to-json',
    slug: 'convert',
    params: { conversion: 'csv-json' },
    keywords: ['csv to json', 'convert csv to json'],
  },
  {
    key: 'json-to-typescript',
    slug: 'convert',
    params: { conversion: 'json-typescript' },
    keywords: ['json to typescript', 'json to ts interface', 'typescript interface generator'],
  },
  {
    key: 'xml-to-json',
    slug: 'convert',
    params: { conversion: 'xml-json' },
    keywords: ['xml to json', 'convert xml to json'],
  },
  {
    key: 'wifi-qr-code-generator',
    slug: 'qr-code',
    params: { type: 'wifi' },
    keywords: ['wifi qr code', 'wifi qr generator', 'share wifi qr'],
  },
  {
    key: 'vcard-qr-code-generator',
    slug: 'qr-code',
    params: { type: 'vcard' },
    keywords: ['vcard qr code', 'contact qr code', 'business card qr'],
  },
  {
    key: 'md5-hash-generator',
    slug: 'crypto',
    params: { mode: 'hash', algorithms: 'md5' },
    keywords: ['md5 hash', 'md5 generator', 'md5 checksum', 'md5 online'],
  },
  {
    key: 'sha256-hash-generator',
    slug: 'crypto',
    params: { mode: 'hash', algorithms: 'sha256' },
    keywords: ['sha256 hash', 'sha256 generator', 'sha-256 online', 'sha256 checksum'],
  },
  {
    key: 'base32-encoder',
    slug: 'encode',
    params: { mode: 'base32' },
    keywords: ['base32 encoder', 'base32 decoder', 'base32 online'],
  },
  {
    key: 'hex-encoder',
    slug: 'encode',
    params: { mode: 'hex' },
    keywords: ['hex encoder', 'hex decoder', 'text to hex', 'hex to text'],
  },
  {
    key: 'subnet-splitter',
    slug: 'network',
    params: { mode: 'split' },
    keywords: ['subnet splitter', 'cidr splitter', 'split subnet', 'subnet calculator'],
  },
  {
    key: 'regex-replace-tester',
    slug: 'regex',
    params: { mode: 'replace' },
    keywords: ['regex replace', 'regex replacement tester', 'regex substitute'],
  },
];

export function presetPath(preset: ToolPreset): `/${string}` {
  return `${TOOLS_PATH}/${preset.slug}/${preset.key}`;
}

export function findPreset(slug: string, key: string): ToolPreset | undefined {
  return TOOL_PRESETS.find((preset) => preset.slug === slug && preset.key === key);
}

type PresetText = { title: string; description: string };

/** Typed lookup: the assignment checks that every preset's messages match `PresetText`. */
export function presetText(t: Messages, key: PresetKey): PresetText {
  const presets: Record<PresetKey, PresetText> = t.tools.presets;
  return presets[key];
}

/**
 * The preset a `?mode=`-style link points at, when there is one, so the request can be redirected
 * to its indexable path. `path` is the unprefixed pathname. Only params the tool understands count,
 * and they must match the preset's exactly.
 */
export function presetForQuery(path: string, query: URLSearchParams): ToolPreset | undefined {
  const [, section, slug, ...rest] = path.split('/');
  if (`/${section}` !== TOOLS_PATH || !slug || rest.length > 0) return undefined;
  const known = Object.keys(TOOL_PARAMS[slug as ToolSlug] ?? {}).filter((name) => query.has(name));
  if (known.length === 0) return undefined;
  return TOOL_PRESETS.find(
    (preset) =>
      preset.slug === slug &&
      Object.keys(preset.params).length === known.length &&
      known.every((name) => preset.params[name] === query.get(name))
  );
}
