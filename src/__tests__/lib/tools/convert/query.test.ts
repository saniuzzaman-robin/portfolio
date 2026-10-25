import { describe, it, expect } from 'vitest';
import { jsonToQuery, queryToJson } from '@/lib/tools/convert/query';
import { parseJson, type JsonNode } from '@/lib/tools/json/parse';
import { stringifyJson } from '@/lib/tools/json/format';

const json = (text: string): JsonNode => {
  const parsed = parseJson(text);
  if (!parsed.ok) throw new Error(parsed.error.message);
  return parsed.value;
};
const toJson = (text: string, inferTypes = false) =>
  JSON.parse(stringifyJson(queryToJson(text, inferTypes)));
const toQuery = (text: string) => {
  const result = jsonToQuery(json(text));
  if (!result.ok) throw new Error(result.message);
  return result.text;
};

describe('queryToJson', () => {
  it('decodes keys and values, including + as a space', () => {
    expect(toJson('q=hello+world&name=J%C3%BCrgen&empty=&flag')).toEqual({
      q: 'hello world',
      name: 'Jürgen',
      empty: '',
      flag: '',
    });
  });

  it('accepts a whole URL or a leading ? and ignores the fragment', () => {
    expect(toJson('https://example.com/search?a=1&b=2#top')).toEqual({ a: '1', b: '2' });
    expect(toJson('?a=1')).toEqual({ a: '1' });
  });

  it('turns repeated keys and [] into arrays', () => {
    expect(toJson('tag=a&tag=b&tag=c&id[]=1&id[]=2')).toEqual({
      tag: ['a', 'b', 'c'],
      id: ['1', '2'],
    });
  });

  it('nests bracket keys into objects and indexed arrays', () => {
    expect(toJson('user[name]=Ada&user[langs][0]=en&user[langs][1]=bn&rows[0][id]=1')).toEqual({
      user: { name: 'Ada', langs: ['en', 'bn'] },
      rows: [{ id: '1' }],
    });
  });

  it('infers JSON types on request', () => {
    expect(toJson('n=42&ok=true&none=null&zip=007', true)).toEqual({
      n: 42,
      ok: true,
      none: null,
      zip: '007',
    });
  });

  it('keeps clashing and malformed bracket keys flat', () => {
    expect(toJson('a=1&a[]=2&b[=3&[x]=4')).toEqual({ a: '1', 'a[]': '2', 'b[': '3', '[x]': '4' });
  });
});

describe('jsonToQuery', () => {
  it('encodes values and repeats keys for arrays of scalars', () => {
    expect(toQuery('{"q":"a b&c","n":1.50,"ok":false,"none":null,"tag":["x","y"]}')).toBe(
      'q=a%20b%26c&n=1.50&ok=false&none=&tag=x&tag=y'
    );
  });

  it('uses brackets for nested objects and indexes for arrays of containers', () => {
    expect(toQuery('{"user":{"name":"Ada","langs":["en"]},"rows":[{"id":1}]}')).toBe(
      'user[name]=Ada&user[langs]=en&rows[0][id]=1'
    );
  });

  it('rejects anything but an object', () => {
    expect(jsonToQuery(json('[1]')).ok).toBe(false);
  });

  it('round-trips with queryToJson', () => {
    const source = '{"a":"1","list":["x","y"],"o":{"k":"v","deep":[{"z":"w"},{"z":"q"}]}}';
    expect(toJson(toQuery(source))).toEqual(JSON.parse(source));
  });
});
