import type { JsonIndent } from '@/lib/tools/json/format';
import { failed, formatted, type FormatResult } from './types';

type XmlElement = {
  kind: 'element';
  name: string;
  /** `name="value"` pairs, values with their original quotes. */
  attributes: string[];
  children: XmlNode[];
  selfClosing: boolean;
  /** Source range of the whole element and of its content (between the tags). */
  from: number;
  to: number;
  contentFrom: number;
  contentTo: number;
};
type XmlLeaf = {
  kind: 'text' | 'comment' | 'cdata' | 'instruction' | 'doctype';
  raw: string;
};
type XmlNode = XmlElement | XmlLeaf;

type ParseResult = { ok: true; nodes: XmlNode[] } | { ok: false; result: FormatResult };

const NAME = /^[A-Za-z_:À-￿][\w.:\-·À-￿]*/;
const isSpace = (char: string | undefined) =>
  char === ' ' || char === '\t' || char === '\n' || char === '\r';

/** Checks well-formedness (tags, attributes, nesting) and builds a tree; fragments are allowed. */
function parseXml(xml: string): ParseResult {
  const root: XmlNode[] = [];
  const stack: XmlElement[] = [];
  const children = () => (stack.length ? stack[stack.length - 1].children : root);
  const fail = (message: string, from: number, to = from + 1): ParseResult => ({
    ok: false,
    result: failed(message, from, Math.min(to, xml.length)),
  });

  const leaf = (kind: XmlLeaf['kind'], start: number, open: string, close: string) => {
    const end = xml.indexOf(close, start + open.length);
    if (end === -1) return -1;
    children().push({ kind, raw: xml.slice(start, end + close.length) });
    return end + close.length;
  };

  let i = 0;
  while (i < xml.length) {
    if (xml[i] !== '<') {
      const next = xml.indexOf('<', i);
      const end = next === -1 ? xml.length : next;
      children().push({ kind: 'text', raw: xml.slice(i, end) });
      i = end;
      continue;
    }

    const start = i;
    if (xml.startsWith('<!--', i)) {
      i = leaf('comment', start, '<!--', '-->');
      if (i === -1) return fail('Unterminated comment', start, xml.length);
      continue;
    }
    if (xml.startsWith('<![CDATA[', i)) {
      i = leaf('cdata', start, '<![CDATA[', ']]>');
      if (i === -1) return fail('Unterminated CDATA section', start, xml.length);
      continue;
    }
    if (xml.startsWith('<?', i)) {
      i = leaf('instruction', start, '<?', '?>');
      if (i === -1) return fail('Unterminated processing instruction', start, xml.length);
      continue;
    }
    if (xml.startsWith('<!', i)) {
      // <!DOCTYPE …> may carry an internal subset in brackets, with quoted strings inside.
      let j = i + 2;
      let depth = 0;
      for (; j < xml.length; j++) {
        const char = xml[j];
        if (char === '"' || char === "'") {
          const close = xml.indexOf(char, j + 1);
          if (close === -1) break;
          j = close;
        } else if (char === '[') depth++;
        else if (char === ']') depth--;
        else if (char === '>' && depth <= 0) break;
      }
      if (j >= xml.length) return fail('Unterminated declaration', i, xml.length);
      children().push({ kind: 'doctype', raw: xml.slice(i, j + 1) });
      i = j + 1;
      continue;
    }

    if (xml[i + 1] === '/') {
      const name = NAME.exec(xml.slice(i + 2))?.[0];
      if (!name) return fail('Expected an element name after "</"', i + 2);
      let j = i + 2 + name.length;
      while (isSpace(xml[j])) j++;
      if (xml[j] !== '>') return fail(`Expected ">" to close </${name}`, j);
      const open = stack.pop();
      if (!open) return fail(`Unexpected closing tag </${name}>`, i, j + 1);
      if (open.name !== name) {
        return fail(`Expected </${open.name}> but found </${name}>`, i, j + 1);
      }
      open.contentTo = i;
      open.to = j + 1;
      i = j + 1;
      continue;
    }

    const name = NAME.exec(xml.slice(i + 1))?.[0];
    if (!name) return fail('Expected an element name after "<"', i + 1);
    const element: XmlElement = {
      kind: 'element',
      name,
      attributes: [],
      children: [],
      selfClosing: false,
      from: i,
      to: i,
      contentFrom: i,
      contentTo: i,
    };
    const seen = new Set<string>();
    let j = i + 1 + name.length;
    for (;;) {
      const hadSpace = isSpace(xml[j]);
      while (isSpace(xml[j])) j++;
      if (j >= xml.length) return fail(`Unterminated tag <${name}>`, i, xml.length);
      if (xml[j] === '>' || xml.startsWith('/>', j)) break;
      const attribute = NAME.exec(xml.slice(j, j + 1000))?.[0];
      if (!attribute) return fail(`Unexpected "${xml[j]}" in <${name}>`, j);
      if (!hadSpace) return fail('Attributes must be separated by whitespace', j);
      if (seen.has(attribute)) {
        return fail(`Duplicate attribute "${attribute}"`, j, j + attribute.length);
      }
      seen.add(attribute);
      let k = j + attribute.length;
      while (isSpace(xml[k])) k++;
      if (xml[k] !== '=') return fail(`Attribute "${attribute}" needs a value`, j, k);
      k++;
      while (isSpace(xml[k])) k++;
      const quote = xml[k];
      if (quote !== '"' && quote !== "'") return fail('Attribute values must be quoted', k);
      const close = xml.indexOf(quote, k + 1);
      if (close === -1) return fail('Unterminated attribute value', k, xml.length);
      const value = xml.slice(k + 1, close);
      if (value.includes('<')) return fail('"<" is not allowed in attribute values', k + 1);
      element.attributes.push(`${attribute}=${quote}${value}${quote}`);
      j = close + 1;
    }
    children().push(element);
    if (xml[j] === '/') {
      element.selfClosing = true;
      element.to = j + 2;
      i = j + 2;
    } else {
      element.contentFrom = j + 1;
      stack.push(element);
      i = j + 1;
    }
  }

  const unclosed = stack.pop();
  if (unclosed) {
    return fail(`<${unclosed.name}> is never closed`, unclosed.from, unclosed.contentFrom);
  }
  return { ok: true, nodes: root };
}

const isBlank = (node: XmlNode) => node.kind === 'text' && node.raw.trim() === '';

const openTag = (element: XmlElement) =>
  `<${[element.name, ...element.attributes].join(' ')}${element.selfClosing ? '/>' : '>'}`;

const preservesSpace = (element: XmlElement) =>
  element.attributes.some((attribute) => /^xml:space=["']preserve["']$/.test(attribute));

/** Element-only content: no text other than whitespace between the child nodes. */
const isElementContent = (nodes: XmlNode[]) =>
  nodes.some((node) => node.kind !== 'text' && node.kind !== 'cdata') &&
  nodes.every((node) => (node.kind === 'text' ? isBlank(node) : node.kind !== 'cdata'));

/**
 * Indents element-only content one level per depth. Text-only and mixed content (where
 * whitespace may matter) and `xml:space="preserve"` elements are kept as written.
 */
export function formatXml(xml: string, indent: JsonIndent): FormatResult {
  const parsed = parseXml(xml);
  if (!parsed.ok) return parsed.result;
  const unit = indent === 'tab' ? '\t' : ' '.repeat(indent);
  const lines: string[] = [];

  const printNodes = (nodes: XmlNode[], depth: number) => {
    for (const node of nodes) {
      if (isBlank(node)) continue;
      const prefix = unit.repeat(depth);
      if (node.kind !== 'element') {
        lines.push(prefix + (node.kind === 'text' ? node.raw.trim() : node.raw));
      } else if (node.selfClosing) {
        lines.push(prefix + openTag(node));
      } else if (!preservesSpace(node) && isElementContent(node.children)) {
        lines.push(prefix + openTag(node));
        printNodes(node.children, depth + 1);
        lines.push(`${prefix}</${node.name}>`);
      } else {
        const content = xml.slice(node.contentFrom, node.contentTo);
        lines.push(`${prefix}${openTag(node)}${content}</${node.name}>`);
      }
    }
  };

  printNodes(parsed.nodes, 0);
  return formatted(lines.length ? `${lines.join('\n')}\n` : '');
}

/**
 * Removes comments and the whitespace between tags of element-only content, and normalizes the
 * spacing inside tags. Text, CDATA and `xml:space="preserve"` elements are kept as written.
 */
export function minifyXml(xml: string): FormatResult {
  const parsed = parseXml(xml);
  if (!parsed.ok) return parsed.result;

  const print = (nodes: XmlNode[], elementContent: boolean): string =>
    nodes
      .map((node) => {
        if (node.kind === 'comment') return '';
        if (node.kind === 'text') return elementContent && isBlank(node) ? '' : node.raw;
        if (node.kind !== 'element') return node.raw;
        if (node.selfClosing) return openTag(node);
        const content = preservesSpace(node)
          ? xml.slice(node.contentFrom, node.contentTo)
          : print(node.children, isElementContent(node.children));
        return `${openTag(node)}${content}</${node.name}>`;
      })
      .join('');

  return formatted(print(parsed.nodes, true).trim());
}
