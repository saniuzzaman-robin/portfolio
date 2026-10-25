import { parseJson } from '@/lib/tools/json/parse';
import { stringifyJson } from '@/lib/tools/json/format';
import { minifyCss } from './css-minify';
import { minifyJs } from './js-minify';
import { failed, formatted, type FormatIssue, type FormatResult } from './types';

export type HtmlMinifyOptions = {
  /** Also minify `<style>`, `<script>` (JS and JSON) and `style="…"` attributes. */
  inline: boolean;
  /** Passed to terser for inline scripts. */
  mangle: boolean;
};

/** Whitespace next to these tags is never rendered, so it can go entirely. */
const BLOCK_TAGS = new Set(
  (
    'html head body address article aside blockquote caption col colgroup dd details dialog div ' +
    'dl dt fieldset figcaption figure footer form h1 h2 h3 h4 h5 h6 header hgroup hr li main ' +
    'menu nav ol optgroup option p pre section summary table tbody td tfoot th thead tr ul'
  ).split(' ')
);
/** Contents are copied as they are, up to the matching end tag. */
const RAW_TAGS = new Set(['script', 'style', 'textarea', 'title', 'xmp']);
const JS_TYPES = new Set([
  '',
  'module',
  'text/javascript',
  'application/javascript',
  'text/ecmascript',
  'application/ecmascript',
]);
const JSON_TYPES = new Set([
  'application/json',
  'application/ld+json',
  'importmap',
  'speculationrules',
]);

type Token =
  | { kind: 'text'; text: string }
  | { kind: 'tag'; text: string; name: string; block: boolean }
  | { kind: 'other'; text: string };

type Attribute = { name: string; value: string | null; quote: string; from: number };

const WHITESPACE = /[ \t\n\r\f]+/g;
const isSpace = (char: string | undefined) => char !== undefined && /[ \t\n\r\f]/.test(char);

/**
 * Conservative HTML minifier: removes comments (keeping IE conditional comments), collapses
 * whitespace in text and drops it next to block-level tags, normalizes the spacing inside tags,
 * and leaves `<pre>`, `<textarea>` and raw-text elements untouched. With `inline`, embedded CSS,
 * JS and JSON are minified too; any that fail are kept as they are and reported as warnings.
 */
export async function minifyHtml(html: string, options: HtmlMinifyOptions): Promise<FormatResult> {
  const tokens: Token[] = [];
  const warnings: FormatIssue[] = [];
  let preDepth = 0;
  let i = 0;

  const pushText = (text: string) => {
    const previous = tokens[tokens.length - 1];
    if (previous?.kind === 'text') previous.text += text;
    else tokens.push({ kind: 'text', text });
  };

  while (i < html.length) {
    if (html[i] !== '<') {
      const next = html.indexOf('<', i);
      const end = next === -1 ? html.length : next;
      const text = html.slice(i, end);
      if (preDepth > 0) tokens.push({ kind: 'other', text });
      else pushText(text);
      i = end;
      continue;
    }

    if (html.startsWith('<!--', i)) {
      const end = html.indexOf('-->', i + 4);
      if (end === -1) return failed('Unterminated comment', i, html.length);
      const body = html.slice(i + 4, end);
      if (/^\[if\b|^<!\[endif\]|^\s*\[endif\]/i.test(body) || preDepth > 0) {
        tokens.push({ kind: 'other', text: html.slice(i, end + 3) });
      }
      i = end + 3;
      continue;
    }

    if (html.startsWith('<![CDATA[', i)) {
      const end = html.indexOf(']]>', i);
      if (end === -1) return failed('Unterminated CDATA section', i, html.length);
      tokens.push({ kind: 'other', text: html.slice(i, end + 3) });
      i = end + 3;
      continue;
    }

    if (html[i + 1] === '!' || html[i + 1] === '?') {
      const end = html.indexOf('>', i);
      if (end === -1) return failed('Unterminated declaration', i, html.length);
      tokens.push({ kind: 'other', text: html.slice(i, end + 1) });
      i = end + 1;
      continue;
    }

    const closing = html[i + 1] === '/';
    const nameMatch = /^[a-zA-Z][^\s/>]*/.exec(html.slice(i + (closing ? 2 : 1), i + 200));
    if (!nameMatch) {
      // A `<` that doesn't start a tag is text.
      pushText('<');
      i++;
      continue;
    }
    const name = nameMatch[0].toLowerCase();
    const tag = readTag(html, i, closing ? 2 : 1, nameMatch[0].length);
    if (!tag.ok) return failed(tag.message, tag.from, tag.to);
    const { attributes, selfClosing } = tag;
    i = tag.end;

    if (closing) {
      if (name === 'pre' && preDepth > 0) preDepth--;
      tokens.push({ kind: 'tag', text: `</${nameMatch[0]}>`, name, block: BLOCK_TAGS.has(name) });
      continue;
    }

    let attributeText = '';
    for (const attribute of attributes) {
      attributeText += ` ${attribute.name}`;
      if (attribute.value === null) continue;
      let value = attribute.value;
      const lowerName = attribute.name.toLowerCase();
      if (lowerName === 'class' && preDepth === 0) {
        value = value.replace(WHITESPACE, ' ').trim();
      } else if (lowerName === 'style' && options.inline) {
        const result = minifyCss(value, { declarations: true });
        if (result.ok) value = result.text;
        else warnings.push(inlineWarning('style attribute', result.error, attribute.from));
      }
      attributeText += `=${attribute.quote}${value}${attribute.quote}`;
    }
    const open = `<${nameMatch[0]}${attributeText}${selfClosing ? '/>' : '>'}`;
    tokens.push({ kind: 'tag', text: open, name, block: BLOCK_TAGS.has(name) });
    if (selfClosing) continue;
    if (name === 'pre') preDepth++;

    if (RAW_TAGS.has(name)) {
      const close = new RegExp(`</${name}[\\s/>]`, 'ig');
      close.lastIndex = i;
      const match = close.exec(html);
      if (!match) return failed(`<${name}> is never closed`, tag.start, tag.end);
      const content = html.slice(i, match.index);
      const minified =
        options.inline && (name === 'script' || name === 'style')
          ? await minifyRawText(name, attributes, content, options, i, warnings)
          : content;
      tokens.push({ kind: 'other', text: minified });
      i = match.index;
    }
  }

  return formatted(joinTokens(tokens), warnings);
}

type ReadTagResult =
  | { ok: true; start: number; end: number; attributes: Attribute[]; selfClosing: boolean }
  | { ok: false; message: string; from: number; to: number };

/** Reads the attributes of the tag at `start` (name already matched) up to its `>`. */
function readTag(html: string, start: number, prefix: number, nameLength: number): ReadTagResult {
  const attributes: Attribute[] = [];
  let i = start + prefix + nameLength;
  for (;;) {
    while (isSpace(html[i])) i++;
    if (i >= html.length) return { ok: false, message: 'Unterminated tag', from: start, to: i };
    if (html[i] === '>') return { ok: true, start, end: i + 1, attributes, selfClosing: false };
    if (html.startsWith('/>', i)) {
      return { ok: true, start, end: i + 2, attributes, selfClosing: true };
    }
    if (html[i] === '/') {
      i++;
      continue;
    }
    const from = i;
    while (i < html.length && !isSpace(html[i]) && !'/>='.includes(html[i])) i++;
    // An attribute name may start with `=` or `/` in the HTML spec's error handling; take one char.
    if (i === from) i++;
    const name = html.slice(from, i);
    let j = i;
    while (isSpace(html[j])) j++;
    if (html[j] !== '=') {
      attributes.push({ name, value: null, quote: '', from });
      continue;
    }
    j++;
    while (isSpace(html[j])) j++;
    const quote = html[j] === '"' || html[j] === "'" ? html[j] : '';
    if (quote) {
      const end = html.indexOf(quote, j + 1);
      if (end === -1) {
        return { ok: false, message: 'Unterminated attribute value', from: j, to: html.length };
      }
      attributes.push({ name, value: html.slice(j + 1, end), quote, from });
      i = end + 1;
    } else {
      let end = j;
      while (end < html.length && !isSpace(html[end]) && html[end] !== '>') end++;
      attributes.push({ name, value: html.slice(j, end), quote: '', from });
      i = end;
    }
  }
}

async function minifyRawText(
  name: string,
  attributes: Attribute[],
  content: string,
  options: HtmlMinifyOptions,
  offset: number,
  warnings: FormatIssue[]
): Promise<string> {
  if (content.trim() === '') return '';
  const type = (
    attributes.find((attribute) => attribute.name.toLowerCase() === 'type')?.value ?? ''
  )
    .trim()
    .toLowerCase();

  if (name === 'style' && (type === '' || type === 'text/css')) {
    const result = minifyCss(content);
    if (result.ok) return result.text;
    warnings.push(inlineWarning('<style>', result.error, offset));
  } else if (name === 'script' && JS_TYPES.has(type)) {
    const result = await minifyJs(content, { mangle: options.mangle });
    if (result.ok) return result.text;
    warnings.push(inlineWarning('<script>', result.error, offset));
  } else if (name === 'script' && JSON_TYPES.has(type)) {
    const result = parseJson(content);
    if (result.ok) return stringifyJson(result.value);
    warnings.push(inlineWarning('<script>', result.error, offset));
  }
  return content;
}

function inlineWarning(where: string, error: FormatIssue, offset: number): FormatIssue {
  return {
    message: `${where} left as is: ${error.message}`,
    from: offset + error.from,
    to: offset + error.to,
  };
}

/** Collapses text whitespace, dropping it at the edges of the document and of block-level tags. */
function joinTokens(tokens: Token[]): string {
  let out = '';
  tokens.forEach((token, index) => {
    if (token.kind !== 'text') {
      out += token.text;
      return;
    }
    let text = token.text.replace(WHITESPACE, ' ');
    const previous = tokens[index - 1];
    const next = tokens[index + 1];
    if (!previous || (previous.kind === 'tag' && previous.block)) text = text.trimStart();
    if (!next || (next.kind === 'tag' && next.block)) text = text.trimEnd();
    if (text === ' ' && isHeadLevel(tokens, index)) text = '';
    out += text;
  });
  return out;
}

const HEAD_TAGS = new Set(['meta', 'link', 'base', 'title', 'script', 'style', 'noscript']);

/** Space between two head-only tags (`<meta>`, `<link>`…) inside `<head>` is never rendered. */
function isHeadLevel(tokens: Token[], index: number): boolean {
  const previous = tokens[index - 1];
  const next = tokens[index + 1];
  if (previous?.kind !== 'tag' || next?.kind !== 'tag') return false;
  for (let j = index - 1; j >= 0; j--) {
    const token = tokens[j];
    if (token.kind !== 'tag') continue;
    if (token.name === 'head') return !token.text.startsWith('</');
    if (token.name === 'body') return false;
    if (!HEAD_TAGS.has(token.name)) return false;
  }
  return false;
}
