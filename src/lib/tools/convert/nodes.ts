import type { JsonEntry, JsonNode } from '@/lib/tools/json/parse';
import { MAX_DEPTH } from '@/lib/tools/json/parse';

/* Built trees have no source text, so every span is empty. */

export const stringNode = (value: string): JsonNode => ({ type: 'string', value, from: 0, to: 0 });
export const numberNode = (raw: string): JsonNode => ({ type: 'number', raw, from: 0, to: 0 });
export const booleanNode = (value: boolean): JsonNode => ({
  type: 'boolean',
  value,
  from: 0,
  to: 0,
});
export const nullNode = (): JsonNode => ({ type: 'null', from: 0, to: 0 });
export const arrayNode = (items: JsonNode[]): JsonNode => ({
  type: 'array',
  items,
  from: 0,
  to: 0,
});
export const objectNode = (entries: [string, JsonNode][]): JsonNode => ({
  type: 'object',
  entries: entries.map(([key, value]): JsonEntry => ({ key, keyFrom: 0, keyTo: 0, value })),
  from: 0,
  to: 0,
});

export const isContainer = (node: JsonNode) => node.type === 'object' || node.type === 'array';
export const isEmptyContainer = (node: JsonNode) =>
  (node.type === 'object' && node.entries.length === 0) ||
  (node.type === 'array' && node.items.length === 0);

/** A JSON number lexeme (the same grammar `parseJson` accepts). */
export const JSON_NUMBER = /^-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?$/;

/**
 * Types a text value from CSV, XML or a query string: JSON numbers (kept exactly as written),
 * `true`, `false` and `null`. Anything else, including `007` and `1,5`, stays a string.
 */
export function inferScalar(text: string): JsonNode {
  if (JSON_NUMBER.test(text)) return numberNode(text);
  if (text === 'true' || text === 'false') return booleanNode(text === 'true');
  if (text === 'null') return nullNode();
  return stringNode(text);
}

/** Text of a scalar for formats without types (CSV cells, query values, XML text). */
export function scalarText(node: JsonNode): string {
  switch (node.type) {
    case 'string':
      return node.value;
    case 'number':
      return node.raw;
    case 'boolean':
      return String(node.value);
    default:
      return '';
  }
}

/**
 * Converts a value from a parsing library (js-yaml, fast-xml-parser) to a tree. Values JSON
 * can't hold become `null` and are reported through `warn`, like integers already rounded by
 * the library. `string` builds the node for each string (e.g. `inferScalar`).
 */
export function fromPlain(
  value: unknown,
  warn: (message: string) => void,
  string: (text: string) => JsonNode = stringNode
): JsonNode {
  const ancestors = new Set<object>();

  const convert = (current: unknown, depth: number): JsonNode => {
    if (current === null || current === undefined) return nullNode();
    if (typeof current === 'string') return string(current);
    if (typeof current === 'boolean') return booleanNode(current);
    if (typeof current === 'bigint') return numberNode(current.toString());
    if (typeof current === 'number') {
      if (!Number.isFinite(current)) {
        warn(`${current} has no JSON equivalent; written as null.`);
        return nullNode();
      }
      if (Number.isInteger(current) && !Number.isSafeInteger(current)) {
        warn(`${current} is beyond 2^53 and may have lost precision while parsing.`);
      }
      return numberNode(Object.is(current, -0) ? '-0' : String(current));
    }
    if (current instanceof Date) return stringNode(current.toISOString());
    if (typeof current !== 'object') {
      warn(`A ${typeof current} value has no JSON equivalent; written as null.`);
      return nullNode();
    }
    if (ancestors.has(current) || depth >= MAX_DEPTH) {
      warn('A value refers to itself (or nests too deeply); written as null.');
      return nullNode();
    }
    ancestors.add(current);
    const node = Array.isArray(current)
      ? arrayNode(current.map((item) => convert(item, depth + 1)))
      : objectNode(
          Object.entries(current).map(([key, item]): [string, JsonNode] => [
            key,
            convert(item, depth + 1),
          ])
        );
    ancestors.delete(current);
    return node;
  };

  return convert(value, 0);
}

/**
 * A mutable tree for building nested values from flat keys (`a.b.0`, `a[b][]`). Maps keep
 * insertion order; one whose keys are exactly `0…n-1` becomes an array.
 */
export type Tree = Map<string, Tree | JsonNode>;

export const isArrayLike = (tree: Tree) => {
  let index = 0;
  for (const key of tree.keys()) if (key !== String(index++)) return false;
  return tree.size > 0;
};

export function treeToNode(tree: Tree): JsonNode {
  const convert = (value: Tree | JsonNode) => (value instanceof Map ? treeToNode(value) : value);
  if (isArrayLike(tree)) return arrayNode([...tree.values()].map(convert));
  return objectNode([...tree].map(([key, value]): [string, JsonNode] => [key, convert(value)]));
}

/**
 * Puts `value` at `path`, creating maps on the way. Returns false (and changes nothing) when the
 * path runs into an existing value: a scalar where a map is needed, or anything at the leaf.
 */
export function setPath(tree: Tree, path: string[], value: JsonNode): boolean {
  let current = tree;
  for (const segment of path.slice(0, -1)) {
    const next = current.get(segment);
    if (next === undefined) {
      const created: Tree = new Map();
      current.set(segment, created);
      current = created;
    } else if (next instanceof Map) {
      current = next;
    } else {
      return false;
    }
  }
  const leaf = path[path.length - 1];
  if (current.has(leaf)) return false;
  current.set(leaf, value);
  return true;
}

/**
 * Drops repeated keys the way `JSON.parse` does: the last value wins, in the first key's place.
 * Every target format either rejects duplicates (YAML) or would keep only one anyway.
 */
export function lastKeyWins(node: JsonNode): JsonNode {
  if (node.type === 'array') return { ...node, items: node.items.map(lastKeyWins) };
  if (node.type !== 'object') return node;
  const entries: JsonEntry[] = [];
  const indexes = new Map<string, number>();
  for (const entry of node.entries) {
    const value = { ...entry, value: lastKeyWins(entry.value) };
    const index = indexes.get(entry.key);
    if (index === undefined) indexes.set(entry.key, entries.push(value) - 1);
    else entries[index] = value;
  }
  return { ...node, entries };
}
