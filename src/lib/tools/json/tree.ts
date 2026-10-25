import type { JsonNode } from './parse';
import { formatPath, type PathSegment } from './path';

export type JsonStats = { keys: number; depth: number };

/** Object keys counted across the whole document, and how many containers deep it nests. */
export function jsonStats(root: JsonNode): JsonStats {
  let keys = 0;
  let depth = 0;
  const stack: [JsonNode, number][] = [[root, 0]];
  while (stack.length > 0) {
    const [node, level] = stack.pop()!;
    if (node.type === 'object') {
      keys += node.entries.length;
      depth = Math.max(depth, level + 1);
      for (const entry of node.entries) stack.push([entry.value, level + 1]);
    } else if (node.type === 'array') {
      depth = Math.max(depth, level + 1);
      for (const item of node.items) stack.push([item, level + 1]);
    }
  }
  return { keys, depth };
}

/** Text shown for a primitive value in the tree, also what tree search matches against. */
export function primitiveText(node: JsonNode): string {
  switch (node.type) {
    case 'string':
      return node.value;
    case 'number':
      return node.raw;
    case 'boolean':
      return String(node.value);
    case 'null':
      return 'null';
    default:
      return '';
  }
}

export type TreeSearch = {
  /** Paths (as `formatPath` strings) of nodes whose key or value contains the query. */
  matches: Set<string>;
  /** Paths of every container on the way to a match, so the tree can expand them. */
  ancestors: Set<string>;
  truncated: boolean;
};

/** Case-insensitive search over keys and primitive values, in document order. */
export function searchTree(root: JsonNode, query: string, limit = 1000): TreeSearch {
  const needle = query.toLowerCase();
  const matches = new Set<string>();
  const ancestors = new Set<string>();
  let truncated = false;
  const stack: { node: JsonNode; path: PathSegment[]; key?: string }[] = [{ node: root, path: [] }];

  while (stack.length > 0) {
    const { node, path, key } = stack.pop()!;
    const hit =
      (key !== undefined && key.toLowerCase().includes(needle)) ||
      (node.type !== 'object' &&
        node.type !== 'array' &&
        primitiveText(node).toLowerCase().includes(needle));
    if (hit) {
      if (matches.size >= limit) {
        truncated = true;
        break;
      }
      matches.add(formatPath(path));
      for (let i = 0; i < path.length; i++) ancestors.add(formatPath(path.slice(0, i)));
    }
    if (node.type === 'object') {
      for (let i = node.entries.length - 1; i >= 0; i--) {
        const entry = node.entries[i];
        stack.push({ node: entry.value, path: [...path, entry.key], key: entry.key });
      }
    } else if (node.type === 'array') {
      for (let i = node.items.length - 1; i >= 0; i--) {
        stack.push({ node: node.items[i], path: [...path, i] });
      }
    }
  }
  return { matches, ancestors, truncated };
}
