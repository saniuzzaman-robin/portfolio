import { describe, it, expect } from 'vitest';
import { parseJson, type JsonNode } from '@/lib/tools/json/parse';
import { stringifyJson } from '@/lib/tools/json/format';
import { compilePath, formatPath, queryPath } from '@/lib/tools/json/path';

// The bookstore document from RFC 9535 §1.5.
const STORE = `{ "store": {
    "book": [
      { "category": "reference", "author": "Nigel Rees", "title": "Sayings of the Century", "price": 8.95 },
      { "category": "fiction", "author": "Evelyn Waugh", "title": "Sword of Honour", "price": 12.99 },
      { "category": "fiction", "author": "Herman Melville", "title": "Moby Dick", "isbn": "0-553-21311-3", "price": 8.99 },
      { "category": "fiction", "author": "J. R. R. Tolkien", "title": "The Lord of the Rings", "isbn": "0-395-19395-8", "price": 22.99 }
    ],
    "bicycle": { "color": "red", "price": 399 }
  }
}`;

function root(text = STORE): JsonNode {
  const result = parseJson(text);
  if (!result.ok) throw new Error(result.error.message);
  return result.value;
}

function query(path: string, text?: string) {
  const compiled = compilePath(path);
  if (!compiled.ok) throw new Error(compiled.error.message);
  const { matches } = queryPath(root(text), compiled.segments);
  return {
    paths: matches.map((match) => formatPath(match.path)),
    values: matches.map((match) => stringifyJson(match.node)),
  };
}

describe('formatPath', () => {
  it('uses dot notation for identifiers and quoted brackets otherwise', () => {
    expect(formatPath([])).toBe('$');
    expect(formatPath(['users', 0, 'name'])).toBe('$.users[0].name');
    expect(formatPath(['first name', "it's", 'a\\b', '1a', '\n'])).toBe(
      "$['first name']['it\\'s']['a\\\\b']['1a']['\\n']"
    );
  });

  it('produces paths that compilePath reads back', () => {
    const doc = '{"a b": {"it\'s": [0, {"\\n": 1}]}}';
    expect(query("$['a b']['it\\'s'][1]['\\n']", doc).values).toEqual(['1']);
  });
});

describe('queryPath', () => {
  it('follows names, indices and negative indices', () => {
    expect(query('$.store.book[0].author').values).toEqual(['"Nigel Rees"']);
    expect(query('$.store.book[-1].title').values).toEqual(['"The Lord of the Rings"']);
    expect(query("$['store']['bicycle'].color").values).toEqual(['"red"']);
    expect(query('$.store.book[9]').values).toEqual([]);
  });

  it('expands wildcards in document order', () => {
    expect(query('$.store.book[*].author').values).toEqual([
      '"Nigel Rees"',
      '"Evelyn Waugh"',
      '"Herman Melville"',
      '"J. R. R. Tolkien"',
    ]);
    expect(query('$.store.bicycle.*').values).toEqual(['"red"', '399']);
  });

  it('descends recursively', () => {
    expect(query('$..price').values).toEqual(['8.95', '12.99', '8.99', '22.99', '399']);
    expect(query('$..book[2].isbn').paths).toEqual(['$.store.book[2].isbn']);
  });

  it('supports slices with steps, including negative ones (RFC 9535 §2.3.4.3)', () => {
    const array = '["a", "b", "c", "d", "e", "f", "g"]';
    expect(query('$[1:3]', array).values).toEqual(['"b"', '"c"']);
    expect(query('$[5:]', array).values).toEqual(['"f"', '"g"']);
    expect(query('$[1:5:2]', array).values).toEqual(['"b"', '"d"']);
    expect(query('$[5:1:-2]', array).values).toEqual(['"f"', '"d"']);
    expect(query('$[::-1]', array).values).toEqual([
      '"g"',
      '"f"',
      '"e"',
      '"d"',
      '"c"',
      '"b"',
      '"a"',
    ]);
    expect(query('$[::0]', array).values).toEqual([]);
  });

  it('supports unions of selectors', () => {
    expect(query("$.store.book[0, -1]['title', 'price']").values).toEqual([
      '"Sayings of the Century"',
      '8.95',
      '"The Lord of the Rings"',
      '22.99',
    ]);
  });

  it('accepts a path without the leading $', () => {
    expect(query('store.bicycle.price').values).toEqual(['399']);
  });

  it('returns the last value for a duplicated key', () => {
    expect(query('$.a', '{"a": 1, "a": 2}').values).toEqual(['2']);
  });

  it('caps the number of matches', () => {
    const compiled = compilePath('$[*]');
    if (!compiled.ok) throw new Error(compiled.error.message);
    const result = queryPath(root('[1, 2, 3, 4]'), compiled.segments, 2);
    expect(result.matches).toHaveLength(2);
    expect(result.truncated).toBe(true);
  });
});

describe('compilePath errors', () => {
  it.each([
    ['$.', 2, 'Expected a property name'],
    ['$[0', 3, "Expected ']'"],
    ["$['a", 2, 'Unterminated string'],
    ['$.a b', 3, "Unexpected ' '"],
    ['$[?(@.a)]', 2, "Unexpected '?'"],
  ])('%s fails at offset %i', (path, offset, message) => {
    expect(compilePath(path)).toEqual({ ok: false, error: { offset, message } });
  });

  it('reports offsets relative to the untrimmed input', () => {
    expect(compilePath('  $.')).toMatchObject({ ok: false, error: { offset: 4 } });
  });
});
