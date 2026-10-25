import { describe, it, expect } from 'vitest';
import { parseJson } from '@/lib/tools/json/parse';
import { escapeJsonString, stringifyJson, unescapeJsonString } from '@/lib/tools/json/format';
import type { StringifyOptions } from '@/lib/tools/json/format';

function format(text: string, options?: StringifyOptions, lenient = false): string {
  const result = parseJson(text, { lenient });
  if (!result.ok) throw new Error(result.error.message);
  return stringifyJson(result.value, options);
}

const SAMPLE = '{"b": [1, {"c": null, "a": "x\\ny"}], "a": {}, "e": [], "d": true}';

describe('stringifyJson', () => {
  it('matches JSON.stringify layout for every indent', () => {
    const value = JSON.parse(SAMPLE);
    expect(format(SAMPLE)).toBe(JSON.stringify(value));
    expect(format(SAMPLE, { indent: 2 })).toBe(JSON.stringify(value, null, 2));
    expect(format(SAMPLE, { indent: 4 })).toBe(JSON.stringify(value, null, 4));
    expect(format(SAMPLE, { indent: 'tab' })).toBe(JSON.stringify(value, null, '\t'));
  });

  it('keeps big numbers, number formatting and duplicate keys', () => {
    expect(format('{"id": 12345678901234567890, "p": 1.10, "id": 2e-3}')).toBe(
      '{"id":12345678901234567890,"p":1.10,"id":2e-3}'
    );
  });

  it('sorts keys at every level, keeping duplicates in order', () => {
    expect(
      format('{"b": {"z": 1, "y": 2}, "a": [{"d": 1, "c": 2}], "b": 0}', { sortKeys: true })
    ).toBe('{"a":[{"c":2,"d":1}],"b":{"y":2,"z":1},"b":0}');
  });

  it('turns a lenient parse into strict JSON (repair)', () => {
    expect(format("{a: 'x', /* c */ b: [1,],}", undefined, true)).toBe('{"a":"x","b":[1]}');
  });
});

describe('escapeJsonString / unescapeJsonString', () => {
  it('round-trips text through a string literal', () => {
    const text = 'He said "hi"\n\tC:\\path 😀';
    const escaped = escapeJsonString(text);
    expect(escaped).toBe('"He said \\"hi\\"\\n\\tC:\\\\path 😀"');
    expect(unescapeJsonString(escaped)).toEqual({ ok: true, value: text });
  });

  it('accepts a literal without its quotes', () => {
    expect(unescapeJsonString('line 1\\nline 2')).toEqual({ ok: true, value: 'line 1\nline 2' });
  });

  it('reports error offsets relative to the input', () => {
    expect(unescapeJsonString('ab\\xcd')).toMatchObject({ ok: false, error: { from: 2, to: 4 } });
    expect(unescapeJsonString('a"b')).toMatchObject({ ok: false, error: { from: 1, to: 2 } });
  });

  it('rejects quoted input that is not a single string', () => {
    expect(unescapeJsonString('"a" + "b"').ok).toBe(false);
  });
});
