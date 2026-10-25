import { failed, formatted, type FormatResult } from './types';

export type CssMinifyOptions = {
  /** SCSS/Less: `//` starts a comment that runs to the end of the line. */
  lineComments?: boolean;
  /** The input is a declaration list, like a `style` attribute, rather than a stylesheet. */
  declarations?: boolean;
};

const isSpace = (char: string) =>
  char === ' ' || char === '\t' || char === '\n' || char === '\r' || char === '\f';
const isHex = (char: string) => /^[0-9a-fA-F]$/.test(char);
const isIdent = (char: string) => /^[\w-]$/.test(char) || char.charCodeAt(0) > 0x7f;

/** A space can go after these… */
const NO_SPACE_AFTER = new Set(['{', '}', ';', ',', '>', '~', '(', ':']);
/** …and before these, without changing what the stylesheet means. `+`/`-` are left alone (calc). */
const NO_SPACE_BEFORE = new Set(['{', '}', ';', ',', '>', '~', ')', '!']);

/**
 * Whitespace- and comment-only CSS minifier. It works on tokens, so strings, unquoted `url()`,
 * escapes (`\31 0`) and the spaces `calc()` needs survive; `/*! … *\/` license comments are kept.
 * Spaces are kept before a selector's `:` (`a :hover` ≠ `a:hover`) and before `(` (`and (`).
 * The only other change is dropping the `;` before a `}`.
 */
export function minifyCss(css: string, options: CssMinifyOptions = {}): FormatResult {
  let out = '';
  // `last` is the last significant character written; `''` at the start.
  let last = '';
  let space = false;
  // One entry per open `{`: true when it opened an interpolation (`#{…}`, `@{…}`).
  const braces: boolean[] = [];

  const emit = (token: string, first = token[0]) => {
    if (space && last !== '' && !NO_SPACE_AFTER.has(last) && !NO_SPACE_BEFORE.has(first)) {
      out += ' ';
    }
    space = false;
    out += token;
    last = token[token.length - 1];
  };

  let i = 0;
  while (i < css.length) {
    const char = css[i];

    if (isSpace(char)) {
      space = true;
      i++;
      continue;
    }

    if (char === '/' && css[i + 1] === '*') {
      const end = css.indexOf('*/', i + 2);
      if (end === -1) return failed('Unterminated comment', i, css.length);
      if (css[i + 2] === '!') {
        emit(css.slice(i, end + 2));
        // Like a rule boundary: nothing after a kept comment needs a space.
        last = '}';
      } else {
        space = true;
      }
      i = end + 2;
      continue;
    }

    if (options.lineComments && char === '/' && css[i + 1] === '/') {
      while (i < css.length && css[i] !== '\n' && css[i] !== '\r') i++;
      space = true;
      continue;
    }

    if (char === '"' || char === "'") {
      let j = i + 1;
      while (j < css.length && css[j] !== char) {
        if (css[j] === '\n' || css[j] === '\r') return failed('Unterminated string', i, j);
        j += css[j] === '\\' ? 2 : 1;
      }
      if (j >= css.length) return failed('Unterminated string', i, css.length);
      emit(css.slice(i, j + 1));
      i = j + 1;
      continue;
    }

    if (char === '\\') {
      // Escapes are copied whole: up to 6 hex digits plus the one space that ends them.
      let j = i + 1;
      if (isHex(css[j] ?? '')) {
        while (j < i + 7 && isHex(css[j] ?? '')) j++;
        if (css.startsWith('\r\n', j)) j += 2;
        else if (isSpace(css[j] ?? '')) j++;
      } else if (j < css.length) {
        j++;
      }
      emit(css.slice(i, j));
      // An escaped character is part of an identifier, never punctuation.
      last = 'a';
      i = j;
      continue;
    }

    // Unquoted url(…) is one token whose contents (`//`, `;`, `}`) are copied as they are.
    if (/^url\(/i.test(css.slice(i, i + 4)) && !isIdent(css[i - 1] ?? '')) {
      let j = i + 4;
      while (isSpace(css[j] ?? '')) j++;
      if (css[j] !== '"' && css[j] !== "'") {
        const close = css.indexOf(')', j);
        if (close === -1) return failed('Unterminated url()', i, css.length);
        emit(`${css.slice(i, i + 4)}${css.slice(j, close).trim()})`);
        i = close + 1;
        continue;
      }
    }

    if (char === '{') {
      const interpolation = last === '#' || last === '@' ? !space : false;
      braces.push(interpolation);
      emit(char);
      i++;
      continue;
    }

    if (char === '}') {
      const interpolation = braces.pop() ?? false;
      if (!interpolation && last === ';') out = out.slice(0, -1);
      emit(char);
      // An interpolation ends inside a value or selector, where a following space matters.
      if (interpolation) last = 'a';
      i++;
      continue;
    }

    // `color : red` → `color:red`, but `a :hover {` keeps its space (a selector is followed by `{`).
    if (
      char === ':' &&
      space &&
      (braces.length > 0 || options.declarations) &&
      !startsBlock(css, i)
    ) {
      space = false;
    }

    emit(char);
    i++;
  }

  if (options.declarations && last === ';') out = out.slice(0, -1);
  return formatted(out);
}

/** Whether a `{` comes before the next `;` or `}` (ignoring parentheses): a selector, not a value. */
function startsBlock(css: string, from: number): boolean {
  let depth = 0;
  for (let i = from; i < css.length; i++) {
    const char = css[i];
    if (char === '(') depth++;
    else if (char === ')') depth--;
    else if (depth <= 0 && (char === ';' || char === '}')) return false;
    else if (depth <= 0 && char === '{') return css[i - 1] !== '#' && css[i - 1] !== '@';
  }
  return false;
}
