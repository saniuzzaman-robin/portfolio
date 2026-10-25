import { describe, it, expect } from 'vitest';
import {
  TOOL_PARAMS,
  TOOL_PRESETS,
  findPreset,
  presetForQuery,
  presetPath,
} from '@/lib/data/tool-presets';
import { TOOLS } from '@/lib/data/tools';
import { FORMAT_LANGUAGES } from '@/lib/tools/format/languages';
import { CONVERSIONS } from '@/lib/tools/convert/convert';
import { CONTENT_TYPES } from '@/lib/tools/qr/content';
import { HASH_ALGORITHMS } from '@/lib/tools/crypto/hash';
import { ID_KINDS } from '@/lib/tools/generate/ids';
import { en } from '@/i18n/messages/en';
import { bn } from '@/i18n/messages/bn';
import { ar } from '@/i18n/messages/ar';

/** What each tool's settings accept, so a preset can't point at a view that doesn't exist. */
const MODES: Record<string, readonly string[]> = {
  json: ['format', 'minify', 'tree', 'query', 'escape', 'unescape'],
  format: ['beautify', 'minify'],
  encode: [
    'base64',
    'file',
    'base32',
    'hex',
    'binary',
    'url',
    'urlParts',
    'html',
    'unicode',
    'punycode',
    'qp',
    'rot',
  ],
  jwt: ['decode', 'encode'],
  crypto: ['hash', 'aes', 'bcrypt', 'keys'],
  generate: ['ids', 'inspect', 'password'],
  time: ['convert', 'diff', 'cron'],
  diff: ['text', 'json'],
  regex: ['match', 'replace', 'split'],
  text: ['case', 'lines', 'count', 'escape', 'lorem'],
  network: ['calculator', 'split', 'list'],
};
const VALUES: Record<string, readonly string[]> = {
  language: FORMAT_LANGUAGES,
  conversion: CONVERSIONS,
  type: CONTENT_TYPES,
  algorithms: HASH_ALGORITHMS,
  kind: ID_KINDS,
};

describe('tool presets', () => {
  it('have unique keys and point at a registered tool and a valid mode', () => {
    expect(new Set(TOOL_PRESETS.map((preset) => preset.key)).size).toBe(TOOL_PRESETS.length);
    for (const preset of TOOL_PRESETS) {
      expect(
        TOOLS.some((tool) => tool.slug === preset.slug),
        preset.key
      ).toBe(true);
      for (const [name, value] of Object.entries(preset.params)) {
        expect(TOOL_PARAMS[preset.slug]?.[name], `${preset.key}: ${name}`).toBeDefined();
        const allowed = name === 'mode' ? MODES[preset.slug] : VALUES[name];
        expect(allowed?.includes(value), `${preset.key}: ${name}=${value}`).toBe(true);
      }
    }
  });

  it('have no two presets for the same view', () => {
    const views = TOOL_PRESETS.map((p) => `${p.slug}:${JSON.stringify(p.params)}`);
    expect(new Set(views).size).toBe(views.length);
  });

  it('have a title and description in every locale', () => {
    for (const messages of [en, bn, ar]) {
      for (const preset of TOOL_PRESETS) {
        const text = messages.tools.presets[preset.key];
        expect(text.title.trim(), preset.key).not.toBe('');
        expect(text.description.trim(), preset.key).not.toBe('');
      }
      expect(Object.keys(messages.tools.presets).sort()).toEqual(
        TOOL_PRESETS.map((preset) => preset.key).sort()
      );
    }
  });

  it('resolve from their path segments', () => {
    const preset = TOOL_PRESETS[0];
    expect(findPreset(preset.slug, preset.key)).toBe(preset);
    expect(findPreset('json', preset.key)).toBeUndefined();
    expect(presetPath(preset)).toBe(`/tools/${preset.slug}/${preset.key}`);
  });
});

describe('presetForQuery', () => {
  const query = (search: string) => new URLSearchParams(search);

  it('maps a mode and kind to the matching preset', () => {
    expect(presetForQuery('/tools/generate', query('mode=ids&kind=uuid-v4'))?.key).toBe(
      'uuid-generator'
    );
    expect(presetForQuery('/tools/json', query('mode=minify'))?.key).toBe('json-minifier');
    expect(presetForQuery('/tools/format', query('language=sql&mode=beautify'))?.key).toBe(
      'sql-formatter'
    );
    expect(presetForQuery('/tools/crypto', query('mode=hash&algorithms=md5'))?.key).toBe(
      'md5-hash-generator'
    );
  });

  it('ignores links without a matching preset', () => {
    expect(presetForQuery('/tools/generate', query('mode=ids'))).toBeUndefined();
    expect(presetForQuery('/tools/json', query('mode=format'))).toBeUndefined();
    expect(presetForQuery('/tools/json', query(''))).toBeUndefined();
    expect(presetForQuery('/tools/format', query('language=sql'))).toBeUndefined();
    expect(presetForQuery('/tools/format', query('language=sql&mode=beautify&x=1'))?.key).toBe(
      'sql-formatter'
    );
    expect(presetForQuery('/tools/json/json-minifier', query('mode=minify'))).toBeUndefined();
    expect(presetForQuery('/projects', query('mode=minify'))).toBeUndefined();
  });
});
