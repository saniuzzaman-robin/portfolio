import { describe, it, expect } from 'vitest';
import { countText } from '@/lib/tools/text/count';
import { DEFAULT_LOREM_OPTIONS, generateLorem, LOREM_LIMITS } from '@/lib/tools/text/lorem';
import { Random } from '@/lib/tools/generate/random';

describe('countText', () => {
  it('counts an empty text as zero everything', () => {
    expect(Object.values(countText('', 'en')).every((value) => value === 0)).toBe(true);
  });

  it('separates code points, graphemes, UTF-16 units and bytes', () => {
    const counts = countText('👍🏽 café', 'en');
    expect(counts).toMatchObject({ characters: 7, graphemes: 6, utf16: 9, bytes: 14, words: 1 });
  });

  it('counts words, sentences, lines and paragraphs', () => {
    const text = 'Hello, world! How are you?\n\nI’m fine.\n  \nBye';
    expect(countText(text, 'en')).toMatchObject({
      words: 8,
      sentences: 4,
      lines: 5,
      paragraphs: 3,
    });
  });

  it('segments words in Bengali', () => {
    expect(countText('আমি বাংলায় গান গাই।', 'bn')).toMatchObject({ words: 4, sentences: 1 });
  });

  it('estimates reading time from the word count', () => {
    expect(countText('word '.repeat(238), 'en').readingSeconds).toBe(60);
  });
});

describe('generateLorem', () => {
  const random = new Random();

  it('starts with the classic sentence and makes the asked number of paragraphs', () => {
    const result = generateLorem(random, DEFAULT_LOREM_OPTIONS);
    if (!result.ok) throw new Error('expected text');
    const paragraphs = result.text.split('\n\n');
    expect(paragraphs).toHaveLength(3);
    expect(paragraphs[0]).toMatch(/^Lorem ipsum dolor sit amet, consectetur adipiscing elit\. /);
    for (const paragraph of paragraphs) expect(paragraph).toMatch(/^[A-Z][A-Za-z ,.]+\.$/);
  });

  it('makes exact word and sentence counts', () => {
    const words = generateLorem(random, { unit: 'words', count: 3, classic: true, html: false });
    expect(words).toEqual({ ok: true, text: 'Lorem ipsum dolor' });
    const sentences = generateLorem(random, {
      unit: 'sentences',
      count: 5,
      classic: false,
      html: true,
    });
    if (!sentences.ok) throw new Error('expected text');
    expect(sentences.text).toMatch(/^<p>.+<\/p>$/);
    expect(sentences.text.match(/\./g)).toHaveLength(5);
  });

  it('refuses counts outside the limits', () => {
    expect(generateLorem(random, { ...DEFAULT_LOREM_OPTIONS, count: 0 })).toEqual({
      ok: false,
      max: LOREM_LIMITS.paragraphs,
    });
  });
});
