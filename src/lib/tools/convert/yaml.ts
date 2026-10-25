import type { JsonNode } from '@/lib/tools/json/parse';
import type { FormatIssue } from '@/lib/tools/format/types';
import { arrayNode, fromPlain, isEmptyContainer } from './nodes';

/* JSON → YAML is our own emitter: it writes number lexemes as they are (big integers survive)
   and quotes anything a YAML 1.1 or 1.2 reader could misread. YAML → JSON uses js-yaml. */

/** Words YAML 1.1 readers turn into booleans or null; quoted in any case. */
const RESERVED = /^(?:y|yes|n|no|true|false|on|off|null)$/i;
/** Letters, digits and a few safe punctuation marks, starting with a letter, `_` or `/`. */
const PLAIN = /^[\p{L}_/][\p{L}\p{M}\p{N}_ ./@()+=,:-]*$/u;
/** Characters YAML can't hold unescaped (non-printable), or that some readers treat as breaks. */
const UNPRINTABLE = new RegExp(
  `[\\x7f-\\x9f${String.fromCharCode(0x2028, 0x2029, 0xfeff, 0xfffe, 0xffff)}]`
);

const isPlain = (text: string) =>
  PLAIN.test(text) &&
  !RESERVED.test(text) &&
  !text.endsWith(' ') &&
  !text.endsWith(':') &&
  !text.includes(': ');

/** A string on one line: plain when unambiguous, otherwise double-quoted with JSON escapes. */
function quote(text: string): string {
  if (isPlain(text)) return text;
  return JSON.stringify(text).replace(
    new RegExp(UNPRINTABLE.source, 'g'),
    (char) => `\\u${char.charCodeAt(0).toString(16).padStart(4, '0')}`
  );
}

/** Multi-line text that a literal block (`|`) can hold exactly. */
const fitsLiteral = (text: string) =>
  text.includes('\n') &&
  !/^[ \n]/.test(text) &&
  // Tabs and line feeds are the only control characters a literal block keeps as they are.
  !/[\0-\x08\x0b-\x1f]/.test(text) &&
  !UNPRINTABLE.test(text);

function scalar(node: JsonNode): string {
  switch (node.type) {
    case 'string':
      return quote(node.value);
    case 'number':
      return node.raw;
    case 'boolean':
      return String(node.value);
    case 'null':
      return 'null';
    case 'object':
      return '{}';
    case 'array':
      return '[]';
  }
}

/** `key: value` or `- value` for one-line values, a literal block for multi-line strings. */
function inline(node: JsonNode, contentPad: string): string[] {
  if (node.type !== 'string' || !fitsLiteral(node.value)) return [scalar(node)];
  const text = node.value;
  const trailing = text.length - text.replace(/\n+$/, '').length;
  const chomp = trailing === 0 ? '-' : trailing === 1 ? '' : '+';
  const body = trailing ? text.slice(0, -1) : text;
  return [
    `|${chomp}`,
    ...body.split('\n').map((line) => (line === '' ? '' : `${contentPad}${line}`)),
  ];
}

const isBlock = (node: JsonNode) =>
  (node.type === 'object' || node.type === 'array') && !isEmptyContainer(node);

function block(node: JsonNode, pad: string, unit: string): string[] {
  const lines: string[] = [];
  if (node.type === 'object') {
    for (const entry of node.entries) {
      const key = `${pad}${quote(entry.key)}:`;
      if (isBlock(entry.value)) {
        lines.push(key, ...block(entry.value, pad + unit, unit));
      } else {
        const [first, ...rest] = inline(entry.value, pad + unit);
        lines.push(`${key} ${first}`, ...rest);
      }
    }
  } else if (node.type === 'array') {
    // Item content sits two columns in, right after `- `, whatever the indent unit is.
    const itemPad = `${pad}  `;
    for (const item of node.items) {
      if (isBlock(item)) {
        const [first, ...rest] = block(item, itemPad, unit);
        lines.push(`${pad}- ${first.slice(itemPad.length)}`, ...rest);
      } else {
        const [first, ...rest] = inline(item, itemPad);
        lines.push(`${pad}- ${first}`, ...rest);
      }
    }
  }
  return lines;
}

function document(node: JsonNode, unit: string): string {
  const lines = isBlock(node) ? block(node, '', unit) : [scalar(node)];
  return `${lines.join('\n')}\n`;
}

/**
 * Block-style YAML for a JSON tree. With `multiDocument`, a top-level array becomes one YAML
 * document per item, separated by `---`.
 */
export function jsonToYaml(node: JsonNode, indent: number, multiDocument: boolean): string {
  const unit = ' '.repeat(indent);
  if (multiDocument && node.type === 'array' && node.items.length > 0) {
    return node.items.map((item) => `---\n${document(item, unit)}`).join('');
  }
  return document(node, unit);
}

export type YamlToJson =
  { ok: true; value: JsonNode; warnings: FormatIssue[] } | { ok: false; error: FormatIssue };

/**
 * Parses YAML 1.2 (core schema). A stream of several documents becomes an array. Syntax errors
 * come back with their offset; a rejection means js-yaml failed to load.
 */
export async function yamlToJson(text: string): Promise<YamlToJson> {
  const yaml = await import('js-yaml');
  let documents: unknown[];
  try {
    documents = yaml.loadAll(text);
  } catch (error) {
    if (!(error instanceof yaml.YAMLException)) throw error;
    const at = error.mark?.position ?? 0;
    return { ok: false, error: { message: error.reason || error.message, from: at, to: at + 1 } };
  }
  const warnings: FormatIssue[] = [];
  const warn = (message: string) => warnings.push({ message, from: 0, to: 0 });
  const nodes = documents.map((value) => fromPlain(value, warn));
  return { ok: true, value: nodes.length === 1 ? nodes[0] : arrayNode(nodes), warnings };
}
