import { mapLines } from './lines';

/** Latin letters that don't decompose into a base letter plus accents. */
const TRANSLITERATIONS: Record<string, string> = {
  ß: 'ss',
  ẞ: 'SS',
  æ: 'ae',
  Æ: 'AE',
  œ: 'oe',
  Œ: 'OE',
  ø: 'o',
  Ø: 'O',
  đ: 'd',
  Đ: 'D',
  ð: 'd',
  Ð: 'D',
  ł: 'l',
  Ł: 'L',
  þ: 'th',
  Þ: 'TH',
  ı: 'i',
  ħ: 'h',
  Ħ: 'H',
  ŧ: 't',
  Ŧ: 'T',
  ŋ: 'ng',
  Ŋ: 'NG',
  '&': ' and ',
};
const TRANSLITERATED = new RegExp(`[${Object.keys(TRANSLITERATIONS).join('')}]`, 'gu');

/* Accents are dropped from Latin letters only: in Bengali or Arabic the marks are vowels. */
const LATIN_MARKS = /(\p{Script=Latin})\p{M}+/gu;
const APOSTROPHES = /['’ʼ]/gu;
const NOT_WORD = /[^\p{L}\p{M}\p{N}]+/gu;

export const SLUG_SEPARATORS = ['-', '_', '.'] as const;
export type SlugSeparator = (typeof SLUG_SEPARATORS)[number];

export type SlugOptions = { separator: SlugSeparator; lowercase: boolean };
export const DEFAULT_SLUG_OPTIONS: SlugOptions = { separator: '-', lowercase: true };

export function isSlugOptions(value: unknown): value is SlugOptions {
  const options = value as SlugOptions | null;
  return (
    typeof options === 'object' &&
    options !== null &&
    SLUG_SEPARATORS.includes(options.separator) &&
    typeof options.lowercase === 'boolean'
  );
}

/**
 * URL slug: "Crème Brûlée & Café" → "creme-brulee-and-cafe". Non-Latin letters stay as they
 * are (they are valid in URLs), apostrophes vanish ("don't" → "dont"), anything else separates.
 */
export function slugify(text: string, options: SlugOptions = DEFAULT_SLUG_OPTIONS): string {
  const latin = text
    .replace(TRANSLITERATED, (char) => TRANSLITERATIONS[char])
    .normalize('NFKD')
    .replace(LATIN_MARKS, '$1')
    .normalize('NFC')
    .replace(APOSTROPHES, '');
  const words = latin.split(NOT_WORD).filter(Boolean);
  const slug = words.join(options.separator);
  return options.lowercase ? slug.toLowerCase() : slug;
}

/** One slug per line. */
export function slugifyLines(text: string, options: SlugOptions): string {
  return mapLines(text, (line) => slugify(line, options));
}
