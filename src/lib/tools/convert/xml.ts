import type { JsonEntry, JsonNode } from '@/lib/tools/json/parse';
import type { JsonIndent } from '@/lib/tools/json/format';
import { offsetAt, type FormatIssue } from '@/lib/tools/format/types';
import { fromPlain, inferScalar, scalarText, stringNode } from './nodes';

/** Prefixes that mark attributes in JSON (`{"@_id": 1}` ↔ `id="1"`). */
export const ATTRIBUTE_PREFIXES = ['@_', '@', '-', '_', '$'] as const;
export type AttributePrefix = (typeof ATTRIBUTE_PREFIXES)[number];

const TEXT_KEY = '#text';
/** The element name used when the JSON has no single top-level key to use as the root. */
const ROOT = 'root';
/** The element name for items of an array that has no key of its own (top level, nested arrays). */
const ITEM = 'item';

export type XmlToJson =
  { ok: true; value: JsonNode; warnings: FormatIssue[] } | { ok: false; error: FormatIssue };

/**
 * Parses XML with fast-xml-parser: attributes become prefixed keys, repeated elements arrays and
 * mixed text `#text`. With `inferTypes`, values are typed by `inferScalar` rather than the
 * library, so number lexemes (`1.0`, big integers) survive and `007` stays text. Well-formedness
 * errors come back with their offset.
 */
export async function xmlToJson(
  text: string,
  options: { attributePrefix: AttributePrefix; inferTypes: boolean }
): Promise<XmlToJson> {
  const { XMLParser, XMLValidator } = await import('fast-xml-parser');
  const valid = XMLValidator.validate(text);
  if (valid !== true) {
    const at = offsetAt(text, valid.err.line, valid.err.col);
    return { ok: false, error: { message: valid.err.msg, from: at, to: at + 1 } };
  }
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: options.attributePrefix,
    textNodeName: TEXT_KEY,
    parseTagValue: false,
    parseAttributeValue: false,
  });
  const warnings: FormatIssue[] = [];
  const value = fromPlain(
    parser.parse(text),
    (message) => warnings.push({ message, from: 0, to: 0 }),
    options.inferTypes ? inferScalar : stringNode
  );
  return { ok: true, value, warnings };
}

/** XML 1.0 names, minus the rarer ranges. */
const XML_NAME = /^[\p{L}_:][\p{L}\p{M}\p{N}_:.-]*$/u;

const safeName = (name: string) => {
  if (XML_NAME.test(name)) return name;
  const replaced = name.replace(/[^\p{L}\p{M}\p{N}_:.-]/gu, '_');
  return XML_NAME.test(replaced) ? replaced : `_${replaced}`;
};

export type JsonToXml = { ok: true; text: string; warnings: FormatIssue[] };

/**
 * Builds XML from JSON. A single top-level key becomes the root element; anything else is
 * wrapped in `<root>`. Keys starting with `attributePrefix` become attributes and `#text` the
 * element text. Numbers keep their lexeme, null is an empty element, and invalid names are
 * rewritten (reported as warnings at the key).
 */
export async function jsonToXml(
  node: JsonNode,
  options: { attributePrefix: AttributePrefix; indent: JsonIndent }
): Promise<JsonToXml> {
  const { XMLBuilder } = await import('fast-xml-parser');
  const prefix = options.attributePrefix;
  const warnings: FormatIssue[] = [];

  const name = (key: string, from: number, to: number) => {
    const isAttribute = key.startsWith(prefix);
    const bare = isAttribute ? key.slice(prefix.length) : key;
    if (key === TEXT_KEY || key.startsWith('?')) return key;
    const safe = safeName(bare);
    if (safe !== bare) {
      warnings.push({
        message: `“${bare}” is not a valid XML name; written as “${safe}”.`,
        from,
        to,
      });
    }
    return isAttribute ? prefix + safe : safe;
  };

  const plainEntries = (entries: JsonEntry[]) =>
    Object.fromEntries(
      entries.map((entry) => [name(entry.key, entry.keyFrom, entry.keyTo), plain(entry.value)])
    );
  const plain = (current: JsonNode): unknown => {
    switch (current.type) {
      case 'object':
        return plainEntries(current.entries);
      case 'array':
        // Repeated elements; an array directly inside an array needs elements of its own.
        return current.items.map((item) =>
          item.type === 'array' ? { [ITEM]: plain(item) } : plain(item)
        );
      default:
        return scalarText(current);
    }
  };

  // `?xml` and other processing instructions sit beside the root element, not inside it.
  const entries = node.type === 'object' ? node.entries : [];
  const instructions = entries.filter((entry) => entry.key.startsWith('?'));
  const elements = entries.filter((entry) => !entry.key.startsWith('?'));
  const [only] = elements;
  const hasRoot =
    elements.length === 1 &&
    only.value.type !== 'array' &&
    only.key !== TEXT_KEY &&
    !only.key.startsWith(prefix);
  let body: Record<string, unknown>;
  if (hasRoot) {
    body = plainEntries(entries);
  } else {
    let content: unknown;
    if (node.type === 'object') content = plainEntries(elements);
    else if (node.type === 'array') content = { [ITEM]: plain(node) };
    else content = plain(node);
    body = { ...plainEntries(instructions), [ROOT]: content };
  }
  if (!('?xml' in body)) {
    body = { '?xml': { [`${prefix}version`]: '1.0', [`${prefix}encoding`]: 'UTF-8' }, ...body };
  }

  const builder = new XMLBuilder({
    ignoreAttributes: false,
    attributeNamePrefix: prefix,
    textNodeName: TEXT_KEY,
    format: true,
    indentBy: options.indent === 'tab' ? '\t' : ' '.repeat(options.indent),
    suppressEmptyNode: true,
  });
  const text = String(builder.build(body)).trim();
  return { ok: true, text: `${text}\n`, warnings };
}
