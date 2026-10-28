import { describe, it, expect, vi, afterEach } from 'vitest';
import { prelude, workerSource, type PreludeScope } from '@/lib/tools/playground/prelude';
import type { PreludeMessage } from '@/lib/tools/playground/types';

const BLOB = 'blob:https://example.test/0d1c';
const LINE_OFFSET = 10;
const HOOK = '__testHook__';

/** The prelude as the worker gets it: rebuilt from its source, so outside references would fail. */
const serialized = new Function(`return (${prelude.toString()})`)() as typeof prelude;

function setup({ maxEntries = 100, lineMap = null as number[] | null } = {}) {
  const messages: PreludeMessage[] = [];
  const listeners: Record<string, (event: Event) => void> = {};
  const scope: PreludeScope = {
    console: {} as Console,
    location: { href: BLOB },
    performance: { now: () => 0 },
    postMessage: (message) => messages.push(message),
    addEventListener: (type, listener) => {
      listeners[type] = listener;
    },
    setTimeout: ((...args: Parameters<typeof setTimeout>) =>
      setTimeout(...args)) as typeof setTimeout,
    clearTimeout: ((id) => clearTimeout(id)) as typeof clearTimeout,
    setInterval: ((...args: Parameters<typeof setInterval>) =>
      setInterval(...args)) as typeof setInterval,
    clearInterval: ((id) => clearInterval(id)) as typeof clearInterval,
  };
  serialized(
    { fileName: 'main.js', lineMap, maxEntries, lineOffset: LINE_OFFSET, hook: HOOK },
    scope
  );
  const texts = () =>
    messages.flatMap((message) => (message.type === 'entry' ? [message.entry.text] : []));
  const evaluated = () => (scope as unknown as Record<string, () => void>)[HOOK]();
  const done = () => messages.some((message) => message.type === 'done');
  return { scope, messages, listeners, texts, evaluated, done };
}

afterEach(() => {
  vi.useRealTimers();
});

describe('prelude console', () => {
  it('announces itself', () => {
    expect(setup().messages).toEqual([{ type: 'ready' }]);
  });

  it('prints strings raw at the top level and inspects everything else', () => {
    const { scope, texts } = setup();
    scope.console.log('hi', 'there', 42, -0, BigInt(10), null, undefined, true);
    scope.console.log({ name: 'Ada', tags: ['a', 'b'], 'odd-key': "it's" });
    scope.console.log(new Map([['a', 1]]), new Set([1, 2]), new Uint8Array([1, 2]));
    scope.console.log(
      function named() {},
      () => {},
      class Point {}
    );
    scope.console.log(Object.create(null), new (class Box {})(), new Date(0), /x/g);
    expect(texts()).toEqual([
      'hi there 42 -0 10n null undefined true',
      "{ name: 'Ada', tags: [ 'a', 'b' ], 'odd-key': 'it\\'s' }",
      "Map(1) { 'a' => 1 } Set(2) { 1, 2 } Uint8Array(2) [ 1, 2 ]",
      '[Function: named] [Function (anonymous)] [class Point]',
      '[Object: null prototype] {} Box {} 1970-01-01T00:00:00.000Z /x/g',
    ]);
  });

  it('marks circular references, limits depth and breaks long values over lines', () => {
    const { scope, texts } = setup();
    const node: Record<string, unknown> = { name: 'root' };
    node.self = node;
    scope.console.log(node);
    scope.console.log({ a: { b: { c: { d: { e: { f: 1 } } } } } });
    scope.console.log({ first: 'a'.repeat(40), second: 'b'.repeat(40) });
    expect(texts()).toEqual([
      "{ name: 'root', self: [Circular] }",
      '{ a: { b: { c: { d: { e: [Object] } } } } }',
      `{\n  first: '${'a'.repeat(40)}',\n  second: '${'b'.repeat(40)}'\n}`,
    ]);
  });

  it('applies printf-style substitutions', () => {
    const { scope, texts } = setup();
    scope.console.log('%s is %d years, %c%o', 'Ada', 36.6, 'color: red', { x: 1 }, 'extra');
    scope.console.log('100%% sure', 1);
    expect(texts()).toEqual(['Ada is 36.6 years, { x: 1 } extra', '100% sure 1']);
  });

  it('renders tables, groups, counters and assertions', () => {
    const { scope, messages, texts } = setup();
    scope.console.table([{ a: 1 }, { a: 2, b: 'x' }]);
    scope.console.group('outer');
    scope.console.count();
    scope.console.count();
    scope.console.groupEnd();
    scope.console.assert(1 === 1, 'never shown');
    scope.console.assert(false, 'nope');
    expect(texts()).toEqual([
      [
        '┌─────────┬───┬─────┐',
        '│ (index) │ a │ b   │',
        '├─────────┼───┼─────┤',
        '│ 0       │ 1 │     │',
        "│ 1       │ 2 │ 'x' │",
        '└─────────┴───┴─────┘',
      ].join('\n'),
      'outer',
      'default: 1',
      'default: 2',
      'Assertion failed: nope',
    ]);
    const indents = messages.flatMap((message) =>
      message.type === 'entry' ? [message.entry.indent] : []
    );
    expect(indents).toEqual([0, 0, 1, 1, 0]);
  });

  it('drops entries past the limit and says so once', () => {
    const { scope, messages } = setup({ maxEntries: 2 });
    for (let index = 0; index < 5; index++) scope.console.log(index);
    expect(messages.map((message) => message.type)).toEqual([
      'ready',
      'entry',
      'entry',
      'truncated',
    ]);
  });
});

describe('prelude errors', () => {
  it('reports uncaught errors at the user line, without prelude frames', () => {
    const { listeners, messages } = setup();
    const error = new TypeError('boom');
    error.stack = [
      'TypeError: boom',
      `    at run (${BLOB}:${LINE_OFFSET + 3}:7)`,
      `    at wrapper (${BLOB}:4:1)`,
    ].join('\n');
    const preventDefault = vi.fn();
    listeners.error({ error, preventDefault } as unknown as Event);
    expect(preventDefault).toHaveBeenCalled();
    expect(messages.at(-1)).toEqual({
      type: 'uncaught',
      text: 'Uncaught TypeError: boom\n    at run (main.js:3:7)',
      error: { message: 'TypeError: boom', line: 3, column: 7 },
    });
  });

  it('maps lines of compiled code back to the source', () => {
    const { listeners, messages } = setup({ lineMap: [1, 1, 5] });
    const error = new Error('late');
    error.stack = `Error: late\n    at ${BLOB}:${LINE_OFFSET + 3}:2`;
    listeners.unhandledrejection({ reason: error, preventDefault: () => {} } as unknown as Event);
    expect(messages.at(-1)).toMatchObject({
      type: 'uncaught',
      text: 'Uncaught (in promise) Error: late\n    at main.js:5:2',
      error: { line: 5 },
    });
  });
});

describe('prelude completion', () => {
  it('finishes one macrotask after evaluation when nothing is pending', () => {
    vi.useFakeTimers();
    const { evaluated, done } = setup();
    evaluated();
    expect(done()).toBe(false);
    vi.advanceTimersByTime(0);
    expect(done()).toBe(true);
  });

  it('waits for timers, and for intervals until they are cleared', () => {
    vi.useFakeTimers();
    const { scope, evaluated, done } = setup();
    scope.setTimeout(() => {}, 100);
    const interval = scope.setInterval(() => {}, 10);
    evaluated();
    vi.advanceTimersByTime(200);
    expect(done()).toBe(false);
    scope.clearInterval(interval);
    vi.advanceTimersByTime(0);
    expect(done()).toBe(true);
  });

  it('treats a top-level throw as the end of evaluation', () => {
    vi.useFakeTimers();
    const { listeners, done } = setup();
    listeners.error({ error: new Error('x'), preventDefault: () => {} } as unknown as Event);
    vi.advanceTimersByTime(0);
    expect(done()).toBe(true);
  });
});

describe('workerSource', () => {
  it('starts the user code on the line after the prelude', () => {
    const source = workerSource('USER_CODE', { fileName: 'main.js', lineMap: null, maxEntries: 1 });
    const lines = source.split('\n');
    const offset = Number(/"lineOffset":(\d+)/.exec(source)?.[1]);
    expect(lines[offset]).toBe('USER_CODE');
    expect(lines[offset + 1]).toMatch(/^;globalThis\.__\w+__\(\);$/);
  });
});
