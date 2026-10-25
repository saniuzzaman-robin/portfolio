import type { JsonNode } from '@/lib/tools/json/parse';
import { parseQuery } from '@/lib/tools/encode/url';
import { inferScalar, isArrayLike, scalarText, stringNode, treeToNode, type Tree } from './nodes';

/** `a[b][]` → `['a', 'b', '']`; a key with unbalanced brackets is one plain segment. */
function keySegments(key: string): string[] {
  const match = /^([^[\]]*)((?:\[[^[\]]*\])+)$/.exec(key);
  if (!match || match[1] === '') return [key];
  return [match[1], ...[...match[2].matchAll(/\[([^[\]]*)\]/g)].map((part) => part[1])];
}

/**
 * Query string → JSON. Accepts a bare query, `?query` or a whole URL (the fragment is ignored).
 * Bracket keys nest (`a[b]=1`, `a[0]=x`), `a[]` appends, and a repeated key becomes an array.
 * Values stay strings unless `inferTypes` is set. A key that clashes with an existing value is
 * kept flat.
 */
export function queryToJson(text: string, inferTypes: boolean): JsonNode {
  let query = text.trim();
  const hash = query.indexOf('#');
  if (hash >= 0) query = query.slice(0, hash);
  const mark = query.indexOf('?');
  if (mark >= 0) query = query.slice(mark + 1);

  const root: Tree = new Map();
  for (const { key, value } of parseQuery(query)) {
    const node = inferTypes ? inferScalar(value) : stringNode(value);
    if (!assign(root, keySegments(key), node) && !root.has(key)) root.set(key, node);
  }
  return treeToNode(root);
}

function assign(tree: Tree, path: string[], value: JsonNode): boolean {
  let current = tree;
  for (let index = 0; index < path.length; index++) {
    const segment = path[index] === '' ? String(current.size) : path[index];
    const existing = current.get(segment);
    if (index === path.length - 1) {
      if (existing === undefined) current.set(segment, value);
      else if (existing instanceof Map && isArrayLike(existing))
        existing.set(String(existing.size), value);
      else if (!(existing instanceof Map))
        current.set(
          segment,
          new Map([
            ['0', existing],
            ['1', value],
          ])
        );
      else return false;
      return true;
    }
    if (existing === undefined) {
      const created: Tree = new Map();
      current.set(segment, created);
      current = created;
    } else if (existing instanceof Map) {
      current = existing;
    } else {
      return false;
    }
  }
  return false;
}

export type JsonToQuery = { ok: true; text: string } | { ok: false; message: string };

const encode = (text: string) => encodeURIComponent(text);

/**
 * JSON object → query string. Nested objects use brackets (`a[b]=1`), arrays of scalars repeat
 * the key and arrays holding objects or arrays use indexes (`a[0][b]=1`). null is an empty
 * value; empty objects and arrays have nothing to write.
 */
export function jsonToQuery(node: JsonNode): JsonToQuery {
  if (node.type !== 'object') {
    return { ok: false, message: 'Expected a JSON object: each key becomes a query parameter.' };
  }
  const pairs: string[] = [];
  const write = (key: string, value: JsonNode) => {
    if (value.type === 'object') {
      for (const entry of value.entries) write(`${key}[${encode(entry.key)}]`, entry.value);
    } else if (value.type === 'array') {
      const scalars = value.items.every((item) => item.type !== 'object' && item.type !== 'array');
      value.items.forEach((item, index) => write(scalars ? key : `${key}[${index}]`, item));
    } else {
      pairs.push(`${key}=${encode(scalarText(value))}`);
    }
  };
  for (const entry of node.entries) write(encode(entry.key), entry.value);
  return { ok: true, text: pairs.join('&') };
}
