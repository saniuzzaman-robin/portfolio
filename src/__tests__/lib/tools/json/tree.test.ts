import { describe, it, expect } from 'vitest';
import { parseJson, type JsonNode } from '@/lib/tools/json/parse';
import { jsonStats, searchTree } from '@/lib/tools/json/tree';

function root(text: string): JsonNode {
  const result = parseJson(text);
  if (!result.ok) throw new Error(result.error.message);
  return result.value;
}

describe('jsonStats', () => {
  it('counts keys across the document and the nesting depth', () => {
    expect(jsonStats(root('1'))).toEqual({ keys: 0, depth: 0 });
    expect(jsonStats(root('{}'))).toEqual({ keys: 0, depth: 1 });
    expect(jsonStats(root('{"a": [{"b": 1, "c": [2]}], "d": null}'))).toEqual({
      keys: 4,
      depth: 4,
    });
  });
});

describe('searchTree', () => {
  const doc = root('{"user": {"name": "Ada", "tags": ["admin", "ops"]}, "Admin": false}');

  it('matches keys and values case-insensitively, with their ancestors', () => {
    const result = searchTree(doc, 'admin');
    expect([...result.matches]).toEqual(['$.user.tags[0]', '$.Admin']);
    expect([...result.ancestors]).toEqual(['$', '$.user', '$.user.tags']);
    expect(result.truncated).toBe(false);
  });

  it('matches number and literal text', () => {
    expect([...searchTree(root('[10, null, true]'), 'nul').matches]).toEqual(['$[1]']);
    expect([...searchTree(root('[10, null, true]'), '0').matches]).toEqual(['$[0]']);
  });

  it('stops at the limit', () => {
    const result = searchTree(root('["a", "a", "a"]'), 'a', 2);
    expect(result.matches.size).toBe(2);
    expect(result.truncated).toBe(true);
  });
});
