import { describe, it, expect } from 'vitest';
import {
  CONVERSIONS,
  formatForFile,
  reverseConversion,
  runConvert,
  type ConvertOptions,
} from '@/lib/tools/convert/convert';

const OPTIONS: ConvertOptions = {
  indent: 2,
  multiDocument: false,
  delimiter: 'auto',
  header: true,
  flatten: true,
  inferTypes: true,
  attributePrefix: '@_',
  rootName: 'Root',
};

describe('runConvert', () => {
  it('reports JSON syntax errors with their offset', async () => {
    expect(await runConvert('{"a":}', 'json-yaml', OPTIONS)).toMatchObject({
      ok: false,
      error: { from: 5 },
    });
  });

  it('keeps the last duplicate key (as JSON.parse does) and warns', async () => {
    const result = await runConvert('{"a":1,"b":2,"a":3}', 'json-yaml', OPTIONS);
    expect(result).toMatchObject({ ok: true, text: 'a: 3\nb: 2\n' });
    expect(result.ok && result.warnings).toHaveLength(1);
  });

  it('writes YAML with two spaces when tab indent is chosen', async () => {
    expect(
      await runConvert('{"a":{"b":1}}', 'json-yaml', { ...OPTIONS, indent: 'tab' })
    ).toMatchObject({
      text: 'a:\n  b: 1\n',
    });
  });

  it('reads every source format into JSON with the chosen indent', async () => {
    const cases: [Parameters<typeof runConvert>[1], string][] = [
      ['yaml-json', 'a: 1\n'],
      ['csv-json', 'a\n1\n'],
      ['xml-json', '<a>1</a>'],
      ['query-json', 'a=1'],
    ];
    for (const [conversion, input] of cases) {
      const result = await runConvert(input, conversion, { ...OPTIONS, indent: 4 });
      expect(result.ok && result.text, conversion).toMatch(/^[[{]\n {4}/);
    }
  });

  it('writes CSV with a comma when the delimiter is auto', async () => {
    expect(await runConvert('[{"a":1,"b":2}]', 'json-csv', OPTIONS)).toMatchObject({
      text: 'a,b\n1,2\n',
    });
  });

  it('points writer errors at the JSON root', async () => {
    expect(await runConvert('  [1]', 'json-query', OPTIONS)).toMatchObject({
      ok: false,
      error: { from: 2, to: 5 },
    });
  });

  it('sanitizes the root type name', async () => {
    const result = await runConvert('{"a":1}', 'json-typescript', {
      ...OPTIONS,
      rootName: ' api response ',
    });
    expect(result.ok && result.text).toContain('export interface ApiResponse {');
  });
});

describe('conversions', () => {
  it('pairs each conversion with its reverse where one exists', () => {
    expect(reverseConversion('json-yaml')).toBe('yaml-json');
    expect(reverseConversion('query-json')).toBe('json-query');
    expect(reverseConversion('json-zod')).toBeUndefined();
    expect(CONVERSIONS.filter((conversion) => !reverseConversion(conversion))).toEqual([
      'json-typescript',
      'json-zod',
    ]);
  });

  it('detects the source format from a file name', () => {
    expect(formatForFile('data.YML')).toBe('yaml');
    expect(formatForFile('export.tsv')).toBe('csv');
    expect(formatForFile('notes.txt')).toBeUndefined();
  });
});
