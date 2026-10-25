import { mapLines } from './lines';

export const CASES = [
  'camel',
  'pascal',
  'snake',
  'kebab',
  'constant',
  'dot',
  'title',
  'sentence',
  'lower',
  'upper',
] as const;
export type CaseKind = (typeof CASES)[number];

/* Letters keep their combining marks (Bengali vowel signs, accents written separately). */
const WORD = /[\p{L}\p{M}\p{N}]+/gu;
/** "fooBar" / "v2Beta" → split before the capital. */
const LOWER_UPPER = /([\p{Ll}\p{N}])(\p{Lu})/gu;
/** "XMLHttp" → "XML Http": an acronym ends before its last capital when a lowercase follows. */
const UPPER_UPPER = /(\p{Lu})(\p{Lu}\p{Ll})/gu;
const WHITESPACE = /\s/u;

/**
 * Identifier words: splits on anything that isn't a letter or digit and on camelCase
 * boundaries. Digits stay with their word ("base64Url" → base64, Url).
 */
export function splitWords(text: string): string[] {
  const spaced = text.replace(LOWER_UPPER, '$1 $2').replace(UPPER_UPPER, '$1 $2');
  return spaced.match(WORD) ?? [];
}

const lower = (word: string) => word.toLowerCase();
const upper = (word: string) => word.toUpperCase();
/** First code point upper, the rest lower ("xML" → "Xml"). */
function capitalize(word: string): string {
  const [first = '', ...rest] = word;
  return first.toUpperCase() + rest.join('').toLowerCase();
}

/** Upper-cases the first letter of each word, keeping spaces and punctuation as they are. */
function titleProse(line: string): string {
  return line.toLowerCase().replace(/(^|[\s\-–—/("'“‘])(\p{Ll})/gu, (_, before: string, letter) => {
    return before + (letter as string).toUpperCase();
  });
}

/** Lower-cases everything, then upper-cases the first letter of each sentence. */
function sentenceProse(line: string): string {
  return line
    .toLowerCase()
    .replace(/(^\P{L}*|[.!?…]\s+\P{L}*)(\p{Ll})/gu, (_, before: string, letter: string) => {
      return before + letter.toUpperCase();
    });
}

function convertLine(line: string, kind: CaseKind): string {
  if (kind === 'lower') return line.toLowerCase();
  if (kind === 'upper') return line.toUpperCase();
  // Prose keeps its punctuation; a line without spaces is read as an identifier
  // ("userId" → "User Id").
  const prose = WHITESPACE.test(line.trim());
  if (kind === 'title' && prose) return titleProse(line);
  if (kind === 'sentence' && prose) return sentenceProse(line);

  const words = splitWords(line);
  switch (kind) {
    case 'camel':
      return words.map((word, i) => (i === 0 ? lower(word) : capitalize(word))).join('');
    case 'pascal':
      return words.map(capitalize).join('');
    case 'snake':
      return words.map(lower).join('_');
    case 'kebab':
      return words.map(lower).join('-');
    case 'constant':
      return words.map(upper).join('_');
    case 'dot':
      return words.map(lower).join('.');
    case 'title':
      return words.map(capitalize).join(' ');
    case 'sentence':
      return words.map((word, i) => (i === 0 ? capitalize(word) : lower(word))).join(' ');
  }
}

/** Converts each line on its own, so a list of names converts in one go. */
export function convertCase(text: string, kind: CaseKind): string {
  return mapLines(text, (line) => convertLine(line, kind));
}
