import { describe, it, expect } from 'vitest';
import { explainRegex, type RegexToken } from '@/lib/tools/regex/explain';

const shape = (pattern: string, flags = '') => explainRegex(pattern, flags).tokens;

const kinds = (pattern: string, flags = '') =>
  explainRegex(pattern, flags).tokens.map((token: RegexToken) => `${token.depth}:${token.label}`);

describe('explainRegex', () => {
  it('merges plain text and splits off a quantified last character', () => {
    expect(shape('abc+')).toMatchObject([
      { kind: 'literal', text: 'ab', depth: 0, label: 'ab', quantifier: null },
      {
        kind: 'literal',
        text: 'c',
        depth: 0,
        label: 'c+',
        quantifier: { min: 1, max: null, lazy: false },
      },
    ]);
  });

  it('reads every quantifier form', () => {
    const quantifiers = explainRegex('a*b+?c?d{3}e{2,}f{2,5}?', '').tokens.map((t) => t.quantifier);
    expect(quantifiers).toEqual([
      { min: 0, max: null, lazy: false },
      { min: 1, max: null, lazy: true },
      { min: 0, max: 1, lazy: false },
      { min: 3, max: 3, lazy: false },
      { min: 2, max: null, lazy: false },
      { min: 2, max: 5, lazy: true },
    ]);
  });

  it('numbers and names capture groups and nests their contents', () => {
    const { tokens, groups } = explainRegex('(?<year>\\d{4})-(\\d+)(?:x|y)', '');
    expect(groups).toEqual([
      { index: 1, name: 'year' },
      { index: 2, name: null },
    ]);
    expect(tokens.map((t) => `${t.depth}:${t.label}`)).toEqual([
      '0:(?<year>…)',
      '1:\\d{4}',
      '0:-',
      '0:(…)',
      '1:\\d+',
      '0:(?:…)',
      '1:x',
      '1:|',
      '1:y',
    ]);
    expect(tokens[0]).toMatchObject({ from: 0, to: 14, group: 'capture', index: 1 });
  });

  it('attaches a quantifier to a whole group', () => {
    const [group] = explainRegex('(ab)+?', '').tokens;
    expect(group).toMatchObject({
      label: '(…)+?',
      to: 6,
      quantifier: { min: 1, max: null, lazy: true },
    });
  });

  it('recognizes lookarounds and modifiers', () => {
    const groups = explainRegex('(?=a)(?!b)(?<=c)(?<!d)(?i-m:e)', '')
      .tokens.filter((t) => t.kind === 'group')
      .map((t) => (t.kind === 'group' ? [t.group, t.enable, t.disable] : null));
    expect(groups).toEqual([
      ['lookahead', '', ''],
      ['negativeLookahead', '', ''],
      ['lookbehind', '', ''],
      ['negativeLookbehind', '', ''],
      ['modifiers', 'i', 'm'],
    ]);
  });

  it('describes anchors by the m flag and dots by the s flag', () => {
    expect(shape('^.$')).toMatchObject([
      { assertion: 'inputStart' },
      { kind: 'any', dotAll: false },
      { assertion: 'inputEnd' },
    ]);
    expect(shape('^.$', 'ms')).toMatchObject([
      { assertion: 'lineStart' },
      { kind: 'any', dotAll: true },
      { assertion: 'lineEnd' },
    ]);
  });

  it('reads escapes', () => {
    expect(shape('\\d\\W\\b\\B\\n\\x41\\u00e9\\cJ\\0\\.')).toMatchObject([
      { kind: 'classEscape', escape: 'digit' },
      { kind: 'classEscape', escape: 'notWord' },
      { kind: 'assertion', assertion: 'wordBoundary' },
      { kind: 'assertion', assertion: 'notWordBoundary' },
      { kind: 'char', code: 10, name: 'lineFeed' },
      { kind: 'char', code: 0x41, name: null },
      { kind: 'char', code: 0xe9 },
      { kind: 'char', code: 10 },
      { kind: 'char', code: 0, name: 'nul' },
      { kind: 'literal', text: '.' },
    ]);
  });

  it('reads Unicode-only escapes only in Unicode mode', () => {
    expect(shape('\\u{1F600}\\p{Script=Greek}\\P{L}\\uD83D\\uDE00', 'u')).toMatchObject([
      { kind: 'char', code: 0x1f600 },
      { kind: 'property', negated: false, name: 'Script', value: 'Greek' },
      { kind: 'property', negated: true, name: 'L', value: null },
      { kind: 'char', code: 0x1f600 },
    ]);
    // Without u, `\u{2}` is "u" twice and `\p` is just "p".
    expect(shape('\\u{2}\\p')).toMatchObject([
      { kind: 'literal', text: 'u', quantifier: { min: 2, max: 2 } },
      { kind: 'literal', text: 'p' },
    ]);
  });

  it('tells backreferences from legacy octal escapes', () => {
    expect(shape('(a)\\1\\2')).toMatchObject([
      { kind: 'group' },
      { kind: 'literal', text: 'a' },
      { kind: 'backreference', ref: '1' },
      { kind: 'char', code: 2 },
    ]);
    expect(shape('(?<x>a)\\k<x>')[2]).toMatchObject({ kind: 'backreference', ref: 'x' });
    expect(shape('\\k<x>')[0]).toMatchObject({ kind: 'literal', text: 'k<x>' });
    expect(shape('\\2', 'u')[0]).toMatchObject({ kind: 'backreference', ref: '2' });
  });

  it('reads classes with ranges, escapes and members', () => {
    expect(kinds('[^a-z_\\d\\-]+')).toEqual(['0:[^a-z_\\d\\-]+', '1:a-z', '1:_', '1:\\d', '1:\\-']);
    expect(shape('[^a-z_\\d\\-]+')).toMatchObject([
      { kind: 'class', negated: true, quantifier: { min: 1 } },
      { kind: 'range', first: 0x61, last: 0x7a },
      { kind: 'members', text: '_' },
      { kind: 'classEscape', escape: 'digit' },
      { kind: 'members', text: '-' },
    ]);
    // A dash next to a class escape is a plain character.
    expect(shape('[\\w-.]').slice(1)).toMatchObject([
      { kind: 'classEscape' },
      { kind: 'members', text: '-.' },
    ]);
    expect(shape('[\\b]')[1]).toMatchObject({ kind: 'char', code: 8, name: 'backspace' });
  });

  it('reads v-mode set operations, nested classes and string literals', () => {
    expect(kinds('[\\p{L}--[a-z]&&\\q{ab|c}]', 'v')).toEqual([
      '0:[\\p{L}--[a-z]&&\\q{ab|c}]',
      '1:\\p{L}',
      '1:--',
      '1:[a-z]',
      '2:a-z',
      '1:&&',
      '1:\\q{ab|c}',
    ]);
    expect(shape('[\\q{ab|c}]', 'v')[1]).toMatchObject({ kind: 'strings', items: ['ab', 'c'] });
  });

  it('keeps going through invalid input', () => {
    expect(shape('*a)')).toMatchObject([
      { kind: 'invalid', text: '*' },
      { kind: 'literal', text: 'a' },
      { kind: 'invalid', text: ')' },
    ]);
    expect(kinds('(a[b')).toEqual(['0:(…', '1:a', '1:[b', '2:b']);
    expect(shape('a{,3}')).toMatchObject([{ kind: 'literal', text: 'a{,3}' }]);
  });

  it('keeps astral characters whole', () => {
    expect(shape('😀+')).toMatchObject([{ kind: 'literal', text: '😀', label: '😀+' }]);
  });
});
