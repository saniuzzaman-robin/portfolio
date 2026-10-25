/**
 * Cheat sheet entries: the syntax to show (and insert when clicked) per section. Descriptions
 * live in the tool strings under `regex.reference.<section>.<key>`.
 */
export const REFERENCE = {
  classes: {
    any: '.',
    digit: '\\d',
    notDigit: '\\D',
    word: '\\w',
    notWord: '\\W',
    space: '\\s',
    notSpace: '\\S',
    set: '[abc]',
    negatedSet: '[^abc]',
    range: '[a-z]',
    property: '\\p{L}',
    notProperty: '\\P{L}',
  },
  anchors: {
    start: '^',
    end: '$',
    wordBoundary: '\\b',
    notWordBoundary: '\\B',
  },
  escapes: {
    lineFeed: '\\n',
    tab: '\\t',
    carriageReturn: '\\r',
    hex: '\\x41',
    unicode: '\\u00e9',
    codePoint: '\\u{1F600}',
    escaped: '\\.',
  },
  groups: {
    capture: '(abc)',
    named: '(?<name>abc)',
    nonCapture: '(?:abc)',
    backreference: '\\1',
    namedBackreference: '\\k<name>',
    alternation: 'a|b',
    lookahead: '(?=abc)',
    negativeLookahead: '(?!abc)',
    lookbehind: '(?<=abc)',
    negativeLookbehind: '(?<!abc)',
  },
  quantifiers: {
    zeroOrMore: '*',
    oneOrMore: '+',
    optional: '?',
    exactly: '{3}',
    atLeast: '{3,}',
    between: '{3,5}',
    lazy: '*?',
  },
  /** Inserted into the replacement, not the pattern. */
  replacement: {
    group: '$1',
    namedGroup: '$<name>',
    match: '$&',
    before: '$`',
    after: "$'",
    dollar: '$$',
  },
} as const satisfies Record<string, Record<string, string>>;

export type ReferenceSection = keyof typeof REFERENCE;
