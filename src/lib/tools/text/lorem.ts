import type { Random } from '@/lib/tools/generate/random';

/** The words of the classic passage (Cicero, "De finibus", as typeset since the 1960s). */
const WORDS = [
  ...new Set(
    `lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut
    labore et dolore magna aliqua enim ad minim veniam quis nostrud exercitation ullamco laboris
    nisi aliquip ex ea commodo consequat duis aute irure in reprehenderit voluptate velit esse
    cillum eu fugiat nulla pariatur excepteur sint occaecat cupidatat non proident sunt culpa qui
    officia deserunt mollit anim id est laborum`.split(/\s+/)
  ),
];

const OPENING_WORDS = ['lorem', 'ipsum', 'dolor', 'sit', 'amet'];
const OPENING_SENTENCE = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.';

export const LOREM_UNITS = ['paragraphs', 'sentences', 'words'] as const;
export type LoremUnit = (typeof LOREM_UNITS)[number];

export const LOREM_LIMITS: Record<LoremUnit, number> = {
  paragraphs: 100,
  sentences: 1000,
  words: 10_000,
};

export type LoremOptions = {
  unit: LoremUnit;
  count: number;
  /** Begin with "Lorem ipsum dolor sit amet…". */
  classic: boolean;
  /** Wrap each paragraph in `<p>…</p>`. */
  html: boolean;
};

export const DEFAULT_LOREM_OPTIONS: LoremOptions = {
  unit: 'paragraphs',
  count: 3,
  classic: true,
  html: false,
};

export function isLoremOptions(value: unknown): value is LoremOptions {
  const options = value as LoremOptions | null;
  return (
    typeof options === 'object' &&
    options !== null &&
    LOREM_UNITS.includes(options.unit) &&
    typeof options.count === 'number' &&
    typeof options.classic === 'boolean' &&
    typeof options.html === 'boolean'
  );
}

export type LoremResult = { ok: true; text: string } | { ok: false; max: number };

const between = (random: Random, min: number, max: number) => min + random.int(max - min + 1);
const capitalize = (word: string) => word[0].toUpperCase() + word.slice(1);

function words(random: Random, count: number): string[] {
  return Array.from({ length: count }, () => random.pick(WORDS));
}

/** 6–14 words, maybe one comma, a capital and a period. */
function sentence(random: Random): string {
  const list = words(random, between(random, 6, 14));
  if (list.length > 7 && random.int(2) === 0) {
    const comma = between(random, 3, list.length - 4);
    list[comma] += ',';
  }
  return `${capitalize(list.join(' '))}.`;
}

function sentences(random: Random, count: number, classic: boolean): string[] {
  const list = Array.from({ length: count }, () => sentence(random));
  if (classic && count > 0) list[0] = OPENING_SENTENCE;
  return list;
}

/** Placeholder text from a cryptographically secure `random` (shared with the generators). */
export function generateLorem(random: Random, options: LoremOptions): LoremResult {
  const max = LOREM_LIMITS[options.unit];
  if (!Number.isInteger(options.count) || options.count < 1 || options.count > max) {
    return { ok: false, max };
  }
  const { count, classic, html } = options;
  let paragraphs: string[];
  if (options.unit === 'words') {
    const list = words(random, count);
    if (classic) list.splice(0, OPENING_WORDS.length, ...OPENING_WORDS.slice(0, count));
    paragraphs = [capitalize(list.join(' '))];
  } else if (options.unit === 'sentences') {
    paragraphs = [sentences(random, count, classic).join(' ')];
  } else {
    paragraphs = Array.from({ length: count }, (_, i) =>
      sentences(random, between(random, 4, 7), classic && i === 0).join(' ')
    );
  }
  const text = html
    ? paragraphs.map((paragraph) => `<p>${paragraph}</p>`).join('\n')
    : paragraphs.join('\n\n');
  return { ok: true, text };
}
