import { describe, it, expect } from 'vitest';
import { MAX_DEPTH, parseJson, positionAt, type JsonNode } from '@/lib/tools/json/parse';

function parsed(text: string, lenient = false): JsonNode {
  const result = parseJson(text, { lenient });
  if (!result.ok) throw new Error(`Expected ${text} to parse: ${result.error.message}`);
  return result.value;
}

function errorOf(text: string, lenient = false) {
  const result = parseJson(text, { lenient });
  if (result.ok) throw new Error(`Expected ${text} to fail`);
  return { ...result.error, ...positionAt(text, result.error.from) };
}

describe('parseJson', () => {
  it('parses every value type with source offsets', () => {
    const node = parsed('{"a": [1, "x", true, false, null]}');
    expect(node).toMatchObject({ type: 'object', from: 0, to: 34 });
    if (node.type !== 'object') throw new Error('object expected');
    const [entry] = node.entries;
    expect(entry).toMatchObject({ key: 'a', keyFrom: 1, keyTo: 4 });
    expect(entry.value).toMatchObject({ type: 'array', from: 6, to: 33 });
    if (entry.value.type !== 'array') throw new Error('array expected');
    expect(entry.value.items.map((item) => item.type)).toEqual([
      'number',
      'string',
      'boolean',
      'boolean',
      'null',
    ]);
  });

  it('keeps number lexemes exactly, including big integers', () => {
    expect(parsed('9007199254740993')).toMatchObject({ type: 'number', raw: '9007199254740993' });
    expect(parsed('1.10')).toMatchObject({ raw: '1.10' });
    expect(parsed('-0.5E+10')).toMatchObject({ raw: '-0.5E+10' });
  });

  it('decodes string escapes, including surrogate pairs', () => {
    expect(parsed(String.raw`"a\"b\\c\/\b\f\n\r\té😀"`)).toMatchObject({
      value: 'a"b\\c/\b\f\n\r\té😀',
    });
  });

  it('accepts a leading byte-order mark and surrounding whitespace', () => {
    expect(parsed('﻿ \n {} \r\n')).toMatchObject({ type: 'object' });
  });

  it('agrees with JSON.parse on what is valid', () => {
    const valid = ['[]', '{}', '0', '-0', '1e5', '" "', '[[[]]]', '{"":""}'];
    const invalid = ['', '01', '1.', '.5', '+1', '[1,]', "'a'", '{a:1}', 'NaN', '"\t"', '[1 2]'];
    for (const text of valid) expect(parseJson(text).ok, text).toBe(true);
    for (const text of invalid) expect(parseJson(text).ok, text).toBe(false);
  });

  it('warns about duplicate keys at the repeated key', () => {
    const text = '{"a": 1, "b": 2, "a": 3}';
    const result = parseJson(text);
    expect(result.ok).toBe(true);
    expect(result.warnings).toEqual([{ message: 'Duplicate key "a"', from: 17, to: 20 }]);
  });

  it('enforces the nesting limit without overflowing the stack', () => {
    const deep = (levels: number) => '['.repeat(levels) + ']'.repeat(levels);
    expect(parseJson(deep(MAX_DEPTH)).ok).toBe(true);
    expect(errorOf(deep(MAX_DEPTH + 1)).message).toMatch(/Nesting is deeper/);
  });
});

describe('parseJson errors', () => {
  it('points at the exact line and column', () => {
    expect(errorOf('{\n  "a": 1,\n  "b": tru\n}')).toMatchObject({
      message: "Unexpected token 'tru'",
      line: 3,
      col: 8,
      to: 22,
    });
  });

  it('explains a missing comma', () => {
    expect(errorOf('{"a": 1 "b": 2}')).toMatchObject({
      message: "Expected ',' or '}' after the property value but found '\"'",
      col: 9,
    });
  });

  it('reports unexpected end of input', () => {
    expect(errorOf('[1, 2')).toMatchObject({
      message: "Unexpected end of input; expected ',' or ']' after the array item",
      col: 6,
    });
  });

  it('marks an unterminated string up to the end of its line', () => {
    expect(errorOf('{"a": "abc\n}')).toMatchObject({
      message: expect.stringMatching(/^Unterminated string/),
      from: 6,
      to: 10,
    });
  });

  it('rejects invalid escapes and raw control characters', () => {
    expect(errorOf(String.raw`"\x"`).message).toBe("Invalid escape sequence '\\x'");
    expect(errorOf(String.raw`"\u12G4"`).message).toMatch(/Invalid Unicode escape/);
    expect(errorOf('"a\u0001"').message).toBe(
      'Control character U+0001 must be escaped inside strings'
    );
  });

  it('names the strict-mode rule that lenient mode relaxes', () => {
    expect(errorOf('[1,]')).toMatchObject({
      message: 'Trailing commas are not allowed in JSON',
      col: 3,
    });
    expect(errorOf('{a: 1}').message).toBe('Property names must be double-quoted strings');
    expect(errorOf("{'a': 1}").message).toBe('Property names must use double quotes');
    expect(errorOf("['a']").message).toBe('Strings must use double quotes');
    expect(errorOf('// note\n1')).toMatchObject({
      message: 'Comments are not allowed in JSON',
      to: 7,
    });
  });

  it('rejects leading zeros and data after the value', () => {
    expect(errorOf('012').message).toBe('Numbers cannot have leading zeros');
    expect(errorOf('{} x')).toMatchObject({
      message: "Unexpected 'x' after the JSON value",
      col: 4,
    });
    expect(errorOf('  ').message).toBe('The document is empty');
  });
});

describe('parseJson lenient mode', () => {
  it('accepts comments, trailing commas, single quotes and unquoted keys', () => {
    const text = `{
      // line comment
      name: 'Ada', /* block */
      'it\\'s': [1, 2,],
      $id: "x",
    }`;
    const node = parsed(text, true);
    if (node.type !== 'object') throw new Error('object expected');
    expect(node.entries.map((entry) => entry.key)).toEqual(['name', "it's", '$id']);
  });

  it('still rejects things that are not JSON-like', () => {
    expect(parseJson('[1,,2]', { lenient: true }).ok).toBe(false);
    expect(parseJson('{a b: 1}', { lenient: true }).ok).toBe(false);
    expect(errorOf('/* open', true).message).toBe('Unterminated comment');
  });
});

describe('positionAt', () => {
  it('treats \\n, \\r\\n and \\r as single line breaks', () => {
    expect(positionAt('a\nb\r\nc\rd', 7)).toEqual({ line: 4, col: 1 });
    expect(positionAt('abc', 2)).toEqual({ line: 1, col: 3 });
  });
});
