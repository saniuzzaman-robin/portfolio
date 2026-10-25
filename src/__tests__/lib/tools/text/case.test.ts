import { describe, it, expect } from 'vitest';
import { CASES, convertCase, splitWords } from '@/lib/tools/text/case';
import { slugify, slugifyLines } from '@/lib/tools/text/slug';

describe('splitWords', () => {
  it.each([
    ['fooBarBaz', ['foo', 'Bar', 'Baz']],
    ['XMLHttpRequest', ['XML', 'Http', 'Request']],
    ['base64UrlEncode', ['base64', 'Url', 'Encode']],
    ['user_id', ['user', 'id']],
    ['  --kebab-case--  ', ['kebab', 'case']],
    ['CONSTANT_CASE', ['CONSTANT', 'CASE']],
    ['café crème', ['café', 'crème']],
    ['বাংলা লেখা', ['বাংলা', 'লেখা']],
    ['', []],
  ])('%s', (input, words) => {
    expect(splitWords(input)).toEqual(words);
  });
});

describe('convertCase', () => {
  const from = (input: string) =>
    Object.fromEntries(CASES.map((kind) => [kind, convertCase(input, kind)]));

  it('converts identifiers', () => {
    expect(from('XMLHttpRequest')).toEqual({
      camel: 'xmlHttpRequest',
      pascal: 'XmlHttpRequest',
      snake: 'xml_http_request',
      kebab: 'xml-http-request',
      constant: 'XML_HTTP_REQUEST',
      dot: 'xml.http.request',
      title: 'Xml Http Request',
      sentence: 'Xml http request',
      lower: 'xmlhttprequest',
      upper: 'XMLHTTPREQUEST',
    });
  });

  it('keeps punctuation in prose for title and sentence case', () => {
    expect(convertCase('the QUICK brown fox. it jumps! (over) dogs', 'title')).toBe(
      'The Quick Brown Fox. It Jumps! (Over) Dogs'
    );
    expect(convertCase('the QUICK brown fox. it jumps!  "over" dogs', 'sentence')).toBe(
      'The quick brown fox. It jumps!  "Over" dogs'
    );
  });

  it('converts line by line and keeps line endings', () => {
    expect(convertCase('first_name\r\nlastName\r\n\r\n', 'camel')).toBe(
      'firstName\r\nlastName\r\n\r\n'
    );
  });
});

describe('slugify', () => {
  it.each([
    ['Hello, World!', 'hello-world'],
    ['Crème Brûlée & Café', 'creme-brulee-and-cafe'],
    ['Straße Øresund Łódź', 'strasse-oresund-lodz'],
    ["Don't stop  believin’", 'dont-stop-believin'],
    ['  --already-a-slug--  ', 'already-a-slug'],
    ['ﬁle №5', 'file-no5'],
    ['বাংলা লেখা', 'বাংলা-লেখা'],
    ['مرحبا بالعالم', 'مرحبا-بالعالم'],
  ])('%s', (input, slug) => {
    expect(slugify(input)).toBe(slug);
  });

  it('honors the separator and case options', () => {
    expect(slugify('Hello World', { separator: '_', lowercase: false })).toBe('Hello_World');
    expect(slugifyLines('One Two\nThree', { separator: '.', lowercase: true })).toBe(
      'one.two\nthree'
    );
  });
});
