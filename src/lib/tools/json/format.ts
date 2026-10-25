import type { JsonEntry, JsonIssue, JsonNode } from './parse';
import { parseJson } from './parse';

export type JsonIndent = 2 | 4 | 'tab';

export type StringifyOptions = {
  /** Omit for minified output. */
  indent?: JsonIndent;
  /** Order object keys by code point at every level (stable for duplicate keys). */
  sortKeys?: boolean;
};

const byKey = (a: JsonEntry, b: JsonEntry) => (a.key < b.key ? -1 : a.key > b.key ? 1 : 0);

/**
 * Serializes a parsed tree back to strict JSON. Numbers are written exactly as they were parsed
 * and duplicate keys are kept, so nothing in the document is lost. The layout matches
 * `JSON.stringify(value, null, indent)`.
 */
export function stringifyJson(node: JsonNode, options: StringifyOptions = {}): string {
  const unit =
    options.indent === undefined
      ? ''
      : options.indent === 'tab'
        ? '\t'
        : ' '.repeat(options.indent);
  const pretty = unit !== '';
  const colon = pretty ? ': ' : ':';
  const parts: string[] = [];

  const write = (value: JsonNode, indent: string) => {
    switch (value.type) {
      case 'string':
        parts.push(JSON.stringify(value.value));
        return;
      case 'number':
        parts.push(value.raw);
        return;
      case 'boolean':
        parts.push(value.value ? 'true' : 'false');
        return;
      case 'null':
        parts.push('null');
        return;
    }
    const children = value.type === 'array' ? value.items : value.entries;
    const [open, close] = value.type === 'array' ? ['[', ']'] : ['{', '}'];
    if (children.length === 0) {
      parts.push(open + close);
      return;
    }
    const inner = indent + unit;
    const separator = pretty ? `,\n${inner}` : ',';
    parts.push(pretty ? `${open}\n${inner}` : open);
    if (value.type === 'array') {
      value.items.forEach((item, index) => {
        if (index > 0) parts.push(separator);
        write(item, inner);
      });
    } else {
      const entries = options.sortKeys ? [...value.entries].sort(byKey) : value.entries;
      entries.forEach((entry, index) => {
        if (index > 0) parts.push(separator);
        parts.push(JSON.stringify(entry.key), colon);
        write(entry.value, inner);
      });
    }
    parts.push(pretty ? `\n${indent}${close}` : close);
  };

  write(node, '');
  return parts.join('');
}

/** Text as a JSON string literal, quotes included: `a"b` → `"a\"b"`. */
export function escapeJsonString(text: string): string {
  return JSON.stringify(text);
}

export type UnescapeResult = { ok: true; value: string } | { ok: false; error: JsonIssue };

/**
 * Decodes a JSON string literal. The surrounding quotes are optional, so both `"a\nb"` and the
 * bare `a\nb` work; error offsets always point into `text` as given.
 */
export function unescapeJsonString(text: string): UnescapeResult {
  const trimmed = text.trim();
  const quoted = trimmed.length >= 2 && trimmed.startsWith('"') && trimmed.endsWith('"');
  if (!quoted) {
    // Without this check, a bare quote would end the wrapped literal early and the error would
    // point at whatever follows it.
    for (let i = 0; i < text.length; i++) {
      if (text[i] === '\\') i++;
      else if (text[i] === '"') {
        return {
          ok: false,
          error: {
            message: 'Double quotes inside the string must be escaped as \\"',
            from: i,
            to: i + 1,
          },
        };
      }
    }
  }
  const shift = quoted ? 0 : 1;
  const result = parseJson(quoted ? text : `"${text}"`);
  if (!result.ok) {
    const clamp = (offset: number) => Math.min(Math.max(0, offset - shift), text.length);
    const { message, from, to } = result.error;
    return { ok: false, error: { message, from: clamp(from), to: clamp(to) } };
  }
  if (result.value.type !== 'string') {
    return {
      ok: false,
      error: { message: 'Expected a JSON string literal', from: 0, to: text.length },
    };
  }
  return { ok: true, value: result.value.value };
}
