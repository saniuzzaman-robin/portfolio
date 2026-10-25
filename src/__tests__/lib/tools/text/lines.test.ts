import { describe, it, expect } from 'vitest';
import { Random } from '@/lib/tools/generate/random';
import {
  DEFAULT_LINE_OPTIONS,
  processLines,
  splitLines,
  type LineOptions,
} from '@/lib/tools/text/lines';

const random = new Random();
const run = (text: string, options: Partial<LineOptions>) =>
  processLines(text, { ...DEFAULT_LINE_OPTIONS, ...options }, 'en', random);

describe('splitLines', () => {
  it('keeps the terminator and whether the text ends with one', () => {
    expect(splitLines('a\r\nb\r\n')).toEqual({ lines: ['a', 'b'], eol: '\r\n', finalEol: true });
    expect(splitLines('a')).toEqual({ lines: ['a'], eol: '\n', finalEol: false });
    expect(splitLines('\n')).toEqual({ lines: [''], eol: '\n', finalEol: true });
  });
});

describe('processLines', () => {
  it('returns nothing for empty input', () => {
    expect(run('', { prefix: '> ' })).toMatchObject({ text: '', inputLines: 0, outputLines: 0 });
  });

  it('sorts naturally, by locale or by code point', () => {
    const text = 'file10\nfile2\nFile1\néclair\nzebra';
    expect(run(text, { order: 'sort' }).text).toBe('éclair\nFile1\nfile2\nfile10\nzebra');
    expect(run(text, { order: 'sort', sortMethod: 'locale' }).text).toBe(
      'éclair\nFile1\nfile10\nfile2\nzebra'
    );
    expect(run(text, { order: 'sort', sortMethod: 'codepoint' }).text).toBe(
      'File1\nfile10\nfile2\nzebra\néclair'
    );
    expect(run(text, { order: 'sort', descending: true }).text).toBe(
      'zebra\nfile10\nfile2\nFile1\néclair'
    );
  });

  it('dedupes after trimming, keeping the first occurrence', () => {
    const result = run(' b\na\nb \nA\n\n\na', { trim: true, dedupe: true, removeBlank: true });
    expect(result).toEqual({
      text: 'b\na\nA',
      inputLines: 7,
      outputLines: 3,
      blankRemoved: 2,
      duplicatesRemoved: 2,
    });
    expect(run('a\nA\nb', { dedupe: true, ignoreCase: true }).text).toBe('a\nb');
  });

  it('reverses, adds a prefix and suffix, and keeps the final newline', () => {
    expect(run('1\r\n2\r\n3\r\n', { order: 'reverse', prefix: '- ', suffix: ';' }).text).toBe(
      '- 3;\r\n- 2;\r\n- 1;\r\n'
    );
  });

  it('shuffles with an even spread of positions', () => {
    const counts = [0, 0, 0];
    for (let i = 0; i < 3000; i++) counts[Number(run('0\n1\n2', { order: 'shuffle' }).text[0])]++;
    for (const count of counts) expect(count).toBeGreaterThan(850);
    const shuffled = run('a\nb\nc\nd', { order: 'shuffle' }).text.split('\n');
    expect([...shuffled].sort()).toEqual(['a', 'b', 'c', 'd']);
  });
});
