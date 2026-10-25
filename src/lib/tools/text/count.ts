import { utf8Length } from '@/lib/tools/bytes';

/** Average silent reading speed for adults, in words per minute (Brysbaert, 2019). */
export const READING_WPM = 238;
/** Typical speaking pace for presentations and narration. */
export const SPEAKING_WPM = 140;

export type TextCounts = {
  /** Unicode code points (what most editors call characters). */
  characters: number;
  /** User-perceived characters: "👍🏽" and "নি" count once. */
  graphemes: number;
  /** UTF-16 code units: JavaScript's `length`, and many database and API limits. */
  utf16: number;
  bytes: number;
  words: number;
  sentences: number;
  /** Runs of non-blank lines. */
  paragraphs: number;
  lines: number;
  whitespace: number;
  /** Seconds, rounded up. */
  readingSeconds: number;
  speakingSeconds: number;
};

function countSegments(
  text: string,
  locale: string,
  granularity: 'grapheme' | 'word' | 'sentence',
  keep: (segment: Intl.SegmentData) => boolean = () => true
): number {
  let count = 0;
  for (const segment of new Intl.Segmenter(locale, { granularity }).segment(text)) {
    if (keep(segment)) count++;
  }
  return count;
}

/** Counters for the whole text; words and sentences follow the locale's segmentation rules. */
export function countText(text: string, locale: string): TextCounts {
  let characters = 0;
  let whitespace = 0;
  for (const char of text) {
    characters++;
    if (/\s/u.test(char)) whitespace++;
  }
  const words = countSegments(text, locale, 'word', (segment) => segment.isWordLike === true);
  const lines = text === '' ? 0 : text.split(/\r\n|\r|\n/).length;
  const paragraphs = text.split(/(?:\r\n|\r|\n)[^\S\r\n]*(?:\r\n|\r|\n)/).filter((block) => {
    return block.trim() !== '';
  }).length;
  return {
    characters,
    graphemes: countSegments(text, locale, 'grapheme'),
    utf16: text.length,
    bytes: utf8Length(text),
    words,
    sentences: countSegments(text, locale, 'sentence', (segment) => segment.segment.trim() !== ''),
    paragraphs,
    lines,
    whitespace,
    readingSeconds: Math.ceil((words / READING_WPM) * 60),
    speakingSeconds: Math.ceil((words / SPEAKING_WPM) * 60),
  };
}
