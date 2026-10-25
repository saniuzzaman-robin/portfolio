import { StreamLanguage, type StreamParser } from '@codemirror/language';
import type { Extension } from '@codemirror/state';
import { tags } from '@lezer/highlight';

type State = { part: number };

// Distinct names: built-in token names like "header" would map to other tags (heading).
const PARTS = ['jwtHeader', 'jwtPayload', 'jwtSignature'] as const;

/**
 * Colors a compact JWT by part, like jwt.io: header, payload and signature each get their own
 * token color (matching the section headings in the tool), dots are punctuation and anything
 * past the third part is flagged as invalid.
 */
const parser: StreamParser<State> = {
  name: 'jwt',
  startState: () => ({ part: 0 }),
  token(stream, state) {
    if (stream.sol() && state.part === 0 && stream.match(/^\s*Bearer\s+/i)) return 'meta';
    if (stream.eatSpace()) return null;
    if (stream.eat('.')) {
      state.part++;
      return 'separator';
    }
    stream.eatWhile(/[^.\s]/);
    return PARTS[state.part] ?? 'invalid';
  },
  tokenTable: {
    jwtHeader: tags.keyword,
    jwtPayload: tags.propertyName,
    jwtSignature: tags.string,
    separator: tags.punctuation,
    meta: tags.meta,
    invalid: tags.invalid,
  },
};

export const jwtLanguage: Extension = StreamLanguage.define(parser);
