import { describe, it, expect } from 'vitest';
import { diffText, type TextChange, type TextDiffOptions } from '@/lib/tools/diff/text';

/** Each change as `"removed" → "inserted"`, which reads better in failures than offsets. */
function show(a: string, b: string, options?: TextDiffOptions): string[] {
  return diffText(a, b, options).changes.map(
    (c: TextChange) =>
      `${JSON.stringify(a.slice(c.fromA, c.toA))}→${JSON.stringify(b.slice(c.fromB, c.toB))}`
  );
}

/** Replaces each change's range in `a` with its text from `b`. */
function apply(a: string, b: string, changes: TextChange[]): string {
  let out = '';
  let at = 0;
  for (const change of changes) {
    out += a.slice(at, change.fromA) + b.slice(change.fromB, change.toB);
    at = change.toA;
  }
  return out + a.slice(at);
}

describe('diffText', () => {
  it('finds no changes in equal texts', () => {
    expect(diffText('a\nb\n', 'a\nb\n')).toEqual({
      changes: [],
      stats: { added: 0, removed: 0, changed: 0 },
      minimal: true,
    });
    expect(diffText('', '').changes).toEqual([]);
  });

  it('reports whole added and removed lines with their line breaks', () => {
    expect(show('a\nc\n', 'a\nb\nc\n')).toEqual(['""→"b\\n"']);
    expect(show('a\nb\nc\n', 'a\nc\n')).toEqual(['"b\\n"→""']);
    expect(diffText('a\nc\n', 'a\nb\nb2\nc\n').stats).toEqual({ added: 2, removed: 0, changed: 0 });
  });

  it('highlights changed words inside changed lines', () => {
    expect(show('the quick fox\n', 'the slow fox\n')).toEqual(['"quick"→"slow"']);
    expect(diffText('the quick fox\n', 'the slow fox\n').stats).toEqual({
      added: 0,
      removed: 0,
      changed: 1,
    });
  });

  it('highlights changed characters in char mode', () => {
    expect(show('color\n', 'colour\n', { granularity: 'char' })).toEqual(['""→"u"']);
    expect(show('color\n', 'colour\n')).toEqual(['"color"→"colour"']);
  });

  it('treats a missing final newline as a change', () => {
    const diff = diffText('a', 'a\n');
    expect(diff.changes).toHaveLength(1);
    expect(apply('a', 'a\n', diff.changes)).toBe('a\n');
    expect(diff.stats).toEqual({ added: 0, removed: 0, changed: 1 });
  });

  it('counts paired lines as changed and the rest as added or removed', () => {
    const diff = diffText('x\na\nb\ny\n', 'x\nA\ny\n');
    expect(diff.stats).toEqual({ added: 0, removed: 1, changed: 1 });
  });

  it('highlights changed characters inside similar words in smart mode', () => {
    const smart = { granularity: 'smart' } as const;
    expect(diffText('aaba\n', 'aaaa\n', smart).changes).toEqual([
      { fromA: 2, toA: 3, fromB: 2, toB: 3 },
    ]);
    expect(show('the quick fox\n', 'the quack fox\n', smart)).toEqual(['"i"→"a"']);
    expect(show('color\n', 'colour\n', smart)).toEqual(['""→"u"']);
  });

  it('keeps dissimilar words whole in smart mode', () => {
    expect(show('the quick fox\n', 'the slow fox\n', { granularity: 'smart' })).toEqual([
      '"quick"→"slow"',
    ]);
    expect(show('let x = 1;\n', 'let y = 1;\n', { granularity: 'smart' })).toEqual(['"x"→"y"']);
  });

  it('honors ignore case and whitespace in smart mode', () => {
    const options = { granularity: 'smart', ignoreCase: true, ignoreWhitespace: true } as const;
    expect(show('Hello  World\n', 'hello world\n', options)).toEqual([]);
    expect(show('Hello Wurld\n', 'hello  WORLD\n', options)).toEqual(['"u"→"O"']);
  });

  it('produces changes that turn the first text into the second', () => {
    const a = 'const a = 1;\nlet b = [1, 2, 3];\nfunction f() {\n  return a + b;\n}\n';
    const b = 'const a = 2;\nlet b = [1, 3];\n// note\nfunction g() {\n  return a * b;\n}';
    for (const granularity of ['smart', 'word', 'char'] as const) {
      expect(apply(a, b, diffText(a, b, { granularity }).changes)).toBe(b);
    }
  });

  it('ignores whitespace differences when asked', () => {
    expect(show('a  b\n\tc\n', 'a b\nc', { ignoreWhitespace: true })).toEqual([]);
    expect(show('if (x) {\n', 'if (y)  {\n', { ignoreWhitespace: true })).toEqual(['"x"→"y"']);
    expect(show('ab\n', 'a\nb\n', { ignoreWhitespace: true, granularity: 'char' })).toEqual([]);
  });

  it('ignores case when asked', () => {
    expect(show('Hello World\n', 'hello world\n', { ignoreCase: true })).toEqual([]);
    expect(show('Hello World\n', 'hello there\n', { ignoreCase: true })).toEqual([
      '"World"→"there"',
    ]);
  });

  it('keeps surrogate pairs and combining marks together', () => {
    expect(show('a😀b\n', 'a😁b\n', { granularity: 'char' })).toEqual(['"😀"→"😁"']);
    expect(show('café ok\n', 'cafe ok\n')).toEqual(['"café"→"cafe"']);
  });
});
