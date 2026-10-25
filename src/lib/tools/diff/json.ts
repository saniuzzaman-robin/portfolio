import type { JsonEntry, JsonNode } from '../json/parse';
import { stringifyJson } from '../json/format';
import type { PathSegment } from '../json/path';
import { diffSequences, internKeys } from './sequence';

/**
 * Semantic JSON comparison: a canonical form for text diffs, and a structural change list.
 * Like `JSON.parse`, duplicate keys keep their last value. Numbers compare by their lexeme,
 * so `1.0` and `1` differ, exactly as they would in the text.
 */

export type JsonDiffOptions = {
  /** Compare arrays as multisets: the same items in any order are equal. */
  ignoreArrayOrder?: boolean;
};

export type JsonChange =
  | { kind: 'added'; path: PathSegment[]; after: JsonNode }
  | { kind: 'removed'; path: PathSegment[]; before: JsonNode }
  | { kind: 'changed'; path: PathSegment[]; before: JsonNode; after: JsonNode };

export type JsonDiff = { changes: JsonChange[]; truncated: boolean };

/** Lists stop growing here; the text view still shows everything. */
export const MAX_JSON_CHANGES = 1_000;

const byKey = (a: JsonEntry, b: JsonEntry) => (a.key < b.key ? -1 : a.key > b.key ? 1 : 0);

/** Last value of each key, sorted by key (code point order). */
function uniqueEntries(entries: JsonEntry[]): JsonEntry[] {
  const last = new Map<string, JsonEntry>();
  for (const entry of entries) {
    last.delete(entry.key);
    last.set(entry.key, entry);
  }
  return [...last.values()].sort(byKey);
}

/**
 * Canonical form: keys sorted and de-duplicated at every level, and with `ignoreArrayOrder`
 * array items sorted by their canonical text. Equal documents serialize identically.
 */
export function normalizeJson(node: JsonNode, options: JsonDiffOptions = {}): JsonNode {
  return new Canonicalizer(options).normalize(node);
}

class Canonicalizer {
  private readonly normalized = new WeakMap<JsonNode, JsonNode>();
  private readonly texts = new WeakMap<JsonNode, string>();

  constructor(private readonly options: JsonDiffOptions) {}

  normalize(node: JsonNode): JsonNode {
    const cached = this.normalized.get(node);
    if (cached) return cached;
    let result: JsonNode = node;
    if (node.type === 'object') {
      const entries = uniqueEntries(node.entries).map((entry) => ({
        ...entry,
        value: this.normalize(entry.value),
      }));
      result = { ...node, entries };
    } else if (node.type === 'array') {
      let items = node.items.map((item) => this.normalize(item));
      if (this.options.ignoreArrayOrder) {
        items = items
          .map((item) => ({ item, text: this.text(item) }))
          .sort((x, y) => (x.text < y.text ? -1 : x.text > y.text ? 1 : 0))
          .map(({ item }) => item);
      }
      result = { ...node, items };
    }
    this.normalized.set(node, result);
    return result;
  }

  /** Minified canonical text: the identity used to compare values. */
  text(node: JsonNode): string {
    let text = this.texts.get(node);
    if (text === undefined) {
      text = stringifyJson(this.normalize(node));
      this.texts.set(node, text);
    }
    return text;
  }
}

/**
 * What changed from `a` to `b`, in document order. Removed array items are addressed by their
 * index in `a`; added, changed and nested ones by their index in `b`.
 */
export function diffJson(a: JsonNode, b: JsonNode, options: JsonDiffOptions = {}): JsonDiff {
  const canon = new Canonicalizer(options);
  const changes: JsonChange[] = [];
  let truncated = false;

  const push = (change: JsonChange) => {
    if (changes.length < MAX_JSON_CHANGES) changes.push(change);
    else truncated = true;
  };

  const walk = (before: JsonNode, after: JsonNode, path: PathSegment[]) => {
    if (truncated || canon.text(before) === canon.text(after)) return;
    if (before.type === 'object' && after.type === 'object') {
      walkObject(before.entries, after.entries, path);
    } else if (before.type === 'array' && after.type === 'array') {
      if (options.ignoreArrayOrder) walkMultiset(before.items, after.items, path);
      else walkArray(before.items, after.items, path);
    } else {
      push({ kind: 'changed', path, before, after });
    }
  };

  const walkObject = (entriesA: JsonEntry[], entriesB: JsonEntry[], path: PathSegment[]) => {
    const left = uniqueEntries(entriesA);
    const right = uniqueEntries(entriesB);
    let i = 0;
    let j = 0;
    while (i < left.length || j < right.length) {
      const order = i === left.length ? 1 : j === right.length ? -1 : byKey(left[i], right[j]);
      if (order < 0) {
        push({ kind: 'removed', path: [...path, left[i].key], before: left[i].value });
        i++;
      } else if (order > 0) {
        push({ kind: 'added', path: [...path, right[j].key], after: right[j].value });
        j++;
      } else {
        walk(left[i].value, right[j].value, [...path, left[i].key]);
        i++;
        j++;
      }
    }
  };

  const walkArray = (itemsA: JsonNode[], itemsB: JsonNode[], path: PathSegment[]) => {
    const [idsA, idsB] = internKeys(
      itemsA.map((item) => canon.text(item)),
      itemsB.map((item) => canon.text(item))
    );
    for (const hunk of diffSequences(idsA, idsB).hunks) {
      // Replaced items are compared pairwise, so an edited object shows its inner changes.
      const paired = Math.min(hunk.toA - hunk.fromA, hunk.toB - hunk.fromB);
      for (let k = 0; k < paired; k++) {
        walk(itemsA[hunk.fromA + k], itemsB[hunk.fromB + k], [...path, hunk.fromB + k]);
      }
      for (let index = hunk.fromA + paired; index < hunk.toA; index++) {
        push({ kind: 'removed', path: [...path, index], before: itemsA[index] });
      }
      for (let index = hunk.fromB + paired; index < hunk.toB; index++) {
        push({ kind: 'added', path: [...path, index], after: itemsB[index] });
      }
    }
  };

  const walkMultiset = (itemsA: JsonNode[], itemsB: JsonNode[], path: PathSegment[]) => {
    const unmatched = new Map<string, number[]>();
    itemsA.forEach((item, index) => {
      const text = canon.text(item);
      const indexes = unmatched.get(text);
      if (indexes) indexes.push(index);
      else unmatched.set(text, [index]);
    });
    const added: number[] = [];
    itemsB.forEach((item, index) => {
      const indexes = unmatched.get(canon.text(item));
      if (indexes && indexes.length > 0) indexes.shift();
      else added.push(index);
    });
    const removed = [...unmatched.values()].flat().sort((x, y) => x - y);
    for (const index of removed) {
      push({ kind: 'removed', path: [...path, index], before: itemsA[index] });
    }
    for (const index of added) {
      push({ kind: 'added', path: [...path, index], after: itemsB[index] });
    }
  };

  walk(a, b, []);
  return { changes, truncated };
}
