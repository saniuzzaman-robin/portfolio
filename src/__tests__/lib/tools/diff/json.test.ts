import { describe, it, expect } from 'vitest';
import { parseJson, type JsonNode } from '@/lib/tools/json/parse';
import { stringifyJson } from '@/lib/tools/json/format';
import { formatPath } from '@/lib/tools/json/path';
import { diffJson, normalizeJson, type JsonDiffOptions } from '@/lib/tools/diff/json';

function parse(text: string): JsonNode {
  const result = parseJson(text);
  if (!result.ok) throw new Error(result.error.message);
  return result.value;
}

const normalized = (text: string, options?: JsonDiffOptions) =>
  stringifyJson(normalizeJson(parse(text), options));

/** Changes as `kind path before → after` lines. */
function changes(a: string, b: string, options?: JsonDiffOptions): string[] {
  return diffJson(parse(a), parse(b), options).changes.map((change) => {
    const before = 'before' in change ? stringifyJson(change.before) : '';
    const after = 'after' in change ? stringifyJson(change.after) : '';
    return `${change.kind} ${formatPath(change.path)} ${before}→${after}`;
  });
}

describe('normalizeJson', () => {
  it('sorts keys at every level and keeps the last of duplicate keys', () => {
    expect(normalized('{"b": 1, "a": {"d": [{"z": 1, "y": 2}], "c": 0}, "b": 2}')).toBe(
      '{"a":{"c":0,"d":[{"y":2,"z":1}]},"b":2}'
    );
  });

  it('keeps array order unless told to ignore it', () => {
    expect(normalized('[3, 1, {"b": 1, "a": 2}, 2]')).toBe('[3,1,{"a":2,"b":1},2]');
    expect(normalized('[3, 1, {"b": 1, "a": 2}, 2]', { ignoreArrayOrder: true })).toBe(
      '[1,2,3,{"a":2,"b":1}]'
    );
  });

  it('keeps number lexemes', () => {
    expect(normalized('{"n": 12345678901234567890, "f": 1.10}')).toBe(
      '{"f":1.10,"n":12345678901234567890}'
    );
  });
});

describe('diffJson', () => {
  it('finds nothing when only key order and layout differ', () => {
    expect(changes('{"a": 1, "b": [1, 2]}', '{\n  "b": [1, 2],\n  "a": 1\n}')).toEqual([]);
  });

  it('lists added, removed and changed keys by path', () => {
    expect(
      changes(
        '{"name": "x", "old": true, "deep": {"n": 1, "keep": null}}',
        '{"name": "y", "deep": {"n": 2, "keep": null}, "new": [1]}'
      )
    ).toEqual([
      'changed $.deep.n 1→2',
      'changed $.name "x"→"y"',
      'added $.new →[1]',
      'removed $.old true→',
    ]);
  });

  it('aligns array items, so an insertion is not a cascade of changes', () => {
    expect(changes('["a", "b", "c"]', '["a", "x", "b", "c"]')).toEqual(['added $[1] →"x"']);
    expect(changes('[1, 2, 3]', '[1, 3]')).toEqual(['removed $[1] 2→']);
  });

  it('compares replaced array items pairwise', () => {
    expect(changes('[{"id": 1, "v": "a"}]', '[{"id": 1, "v": "b"}]')).toEqual([
      'changed $[0].v "a"→"b"',
    ]);
  });

  it('treats arrays as multisets when ignoring order', () => {
    const options = { ignoreArrayOrder: true };
    expect(changes('[1, 2, 2, 3]', '[3, 2, 1, 2]', options)).toEqual([]);
    expect(changes('[1, 2, 2, 3]', '[3, 2, 4]', options)).toEqual([
      'removed $[0] 1→',
      'removed $[2] 2→',
      'added $[2] →4',
    ]);
    expect(
      changes('{"t": [{"b": 1, "a": 2}, 5]}', '{"t": [5, {"a": 2, "b": 1}]}', options)
    ).toEqual([]);
  });

  it('reports a type change as one change', () => {
    expect(changes('{"a": [1]}', '{"a": {"0": 1}}')).toEqual(['changed $.a [1]→{"0":1}']);
    expect(changes('1', '"1"')).toEqual(['changed $ 1→"1"']);
  });

  it('compares numbers by lexeme and uses the last duplicate key', () => {
    expect(changes('{"n": 1.0}', '{"n": 1}')).toEqual(['changed $.n 1.0→1']);
    expect(changes('{"a": 1, "a": 2}', '{"a": 2}')).toEqual([]);
  });
});
