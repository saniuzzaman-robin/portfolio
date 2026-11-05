import { describe, expect, it } from 'vitest';
import { collectKeys } from '@/lib/tools/json/keys';
import { formatPastedJson } from '@/lib/tools/json/format';
import { parseJson } from '@/lib/tools/json/parse';

describe('collectKeys', () => {
  it('lists distinct keys, most used first', () => {
    expect(collectKeys('{"a":1,"b":{"a":2,"c":3},"a":4}')).toEqual(['a', 'b', 'c']);
  });

  it('decodes escapes and ignores string values', () => {
    expect(collectKeys('{"na\\u006De": "not: a key", "x" : 1}')).toEqual(['name', 'x']);
  });

  it('works on half-typed documents', () => {
    expect(collectKeys('{"id": 1, "na')).toEqual(['id']);
  });
});

describe('formatPastedJson', () => {
  it('pretty-prints a compact object or array', () => {
    expect(formatPastedJson('{"a":[1,2]}', 2)).toBe('{\n  "a": [\n    1,\n    2\n  ]\n}');
    expect(formatPastedJson(' [1] ', 'tab')).toBe('[\n\t1\n]');
  });

  it('leaves formatted, scalar and invalid text alone', () => {
    expect(formatPastedJson('{\n"a": 1\n}', 2)).toBeNull();
    expect(formatPastedJson('42', 2)).toBeNull();
    expect(formatPastedJson('{"a":', 2)).toBeNull();
    expect(formatPastedJson('{a: 1}', 2)).toBeNull();
  });
});

describe('removable issues', () => {
  it('marks trailing commas and comments as removable', () => {
    const comma = parseJson('[1,]');
    const comment = parseJson('[1 /* x */]');
    expect(!comma.ok && comma.error).toMatchObject({ from: 2, to: 3, removable: true });
    expect(!comment.ok && comment.error).toMatchObject({ removable: true });
  });

  it('does not mark other errors', () => {
    const result = parseJson("{'a': 1}");
    expect(!result.ok && result.error.removable).toBeUndefined();
  });
});
