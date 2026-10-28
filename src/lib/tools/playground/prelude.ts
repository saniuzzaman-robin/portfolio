import type { LogLevel, PreludeMessage, SourceError } from './types';

export type PreludeOptions = {
  /** Name of the user's file in stack traces ("main.js"). */
  fileName: string;
  /** For compiled code: the original line of each generated line (index 0 is line 1). */
  lineMap: number[] | null;
  /** Console entries after this many are dropped (a log in a tight loop would flood the page). */
  maxEntries: number;
};

type PreludeConfig = PreludeOptions & {
  /** Lines the prelude takes before the user's code starts. */
  lineOffset: number;
  /** Global the code calls after its last statement, to say evaluation finished. */
  hook: string;
};

/** The parts of the worker's global scope the prelude replaces or uses (tests pass a fake). */
export type PreludeScope = {
  console: Console;
  location: { href: string };
  performance: { now(): number };
  postMessage(message: PreludeMessage): void;
  addEventListener(type: string, listener: (event: Event) => void): void;
  setTimeout: typeof setTimeout;
  clearTimeout: typeof clearTimeout;
  setInterval: typeof setInterval;
  clearInterval: typeof clearInterval;
  fetch?: typeof fetch;
};

const HOOK = '__playgroundEvaluated__';

/**
 * Runs first in each run's worker. It is serialized with `toString()` into the worker's source,
 * so it must stay self-contained: no imports or module-level values may be used inside it.
 *
 * Replaces `console` with one that formats values like Node's inspector and posts each line,
 * counts pending timers and fetches so the page can tell when the code has finished, and reports
 * uncaught errors with stack lines pointing into the user's code.
 */
export function prelude(
  config: PreludeConfig,
  scope: PreludeScope = globalThis as unknown as PreludeScope
): void {
  const MAX_DEPTH = 4;
  const MAX_ITEMS = 100;
  const MAX_STRING = 10_000;
  const LINE_WIDTH = 72;
  const IDENTIFIER = /^[A-Za-z_$][\w$]*$/;

  const post = scope.postMessage.bind(scope);
  const nativeSetTimeout = scope.setTimeout.bind(scope);
  const nativeClearTimeout = scope.clearTimeout.bind(scope);
  const nativeSetInterval = scope.setInterval.bind(scope);
  const nativeClearInterval = scope.clearInterval.bind(scope);

  // Source positions: the worker's code is the prelude plus the user's (possibly compiled) code.
  const userLine = (line: number): number | null => {
    const local = line - config.lineOffset;
    if (local < 1) return null;
    return config.lineMap ? (config.lineMap[local - 1] ?? null) : local;
  };
  const framePattern = () =>
    new RegExp(`${scope.location.href.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}:(\\d+):(\\d+)`, 'g');
  const cleanStack = (stack: string): string =>
    stack
      .split('\n')
      .flatMap((frame) => {
        let internal = false;
        const rewritten = frame.replace(framePattern(), (_, line: string, column: string) => {
          const mapped = userLine(Number(line));
          if (mapped === null) internal = true;
          return `${config.fileName}:${mapped}:${column}`;
        });
        return internal ? [] : [rewritten];
      })
      .join('\n');
  const locate = (stack: unknown): { line: number; column: number } | null => {
    if (typeof stack !== 'string') return null;
    for (const match of stack.matchAll(framePattern())) {
      const line = userLine(Number(match[1]));
      if (line !== null) return { line, column: Number(match[2]) };
    }
    return null;
  };

  // Formatting, close to Node's `util.inspect`.
  const truncate = (text: string) =>
    text.length > MAX_STRING
      ? `${text.slice(0, MAX_STRING)}... ${text.length - MAX_STRING} more characters`
      : text;
  const quote = (text: string) =>
    `'${JSON.stringify(truncate(text)).slice(1, -1).replace(/\\"/g, '"').replace(/'/g, "\\'")}'`;
  const formatKey = (key: string | symbol) =>
    typeof key === 'symbol' ? `[${key.toString()}]` : IDENTIFIER.test(key) ? key : quote(key);
  const className = (value: object): string | null => {
    const proto: unknown = Object.getPrototypeOf(value);
    if (proto === null) return null;
    const constructor = (proto as { constructor?: unknown }).constructor;
    return typeof constructor === 'function' ? constructor.name : '';
  };
  const wrap = (prefix: string, items: string[], open: string, close: string) => {
    if (items.length === 0) return `${prefix}${open}${close}`;
    const single = `${prefix}${open} ${items.join(', ')} ${close}`;
    if (single.length <= LINE_WIDTH && !single.includes('\n')) return single;
    const body = items.map((item) => `  ${item.replace(/\n/g, '\n  ')}`).join(',\n');
    return `${prefix}${open}\n${body}\n${close}`;
  };
  const more = (items: string[], total: number) => {
    if (total > MAX_ITEMS) items.push(`... ${total - MAX_ITEMS} more items`);
    return items;
  };
  const formatFunction = (fn: (...args: unknown[]) => unknown) => {
    let source = '';
    try {
      source = Function.prototype.toString.call(fn);
    } catch {
      // Some host functions can't be printed; their name is enough.
    }
    if (source.startsWith('class')) return `[class ${fn.name || '(anonymous)'}]`;
    const kind = (fn.constructor as { name?: string } | undefined)?.name ?? 'Function';
    return fn.name ? `[${kind}: ${fn.name}]` : `[${kind} (anonymous)]`;
  };
  const formatError = (error: Error) => {
    let head = `${error.name}: ${error.message}`;
    try {
      head = String(error);
    } catch {
      // A throwing toString(): keep name and message.
    }
    const stack = typeof error.stack === 'string' ? cleanStack(error.stack) : '';
    if (stack.startsWith(head)) return stack;
    const frames = stack
      .split('\n')
      .filter((frame) => frame.trim())
      .map((frame) => (frame.startsWith(' ') ? frame : `    ${frame}`));
    return [head, ...frames].join('\n');
  };

  const inspect = (value: unknown, depth: number, seen: object[]): string => {
    switch (typeof value) {
      case 'string':
        return quote(value);
      case 'number':
        return Object.is(value, -0) ? '-0' : String(value);
      case 'bigint':
        return `${value}n`;
      case 'symbol':
        return value.toString();
      case 'undefined':
        return 'undefined';
      case 'boolean':
        return String(value);
      case 'function':
        return formatFunction(value as (...args: unknown[]) => unknown);
    }
    if (value === null) return 'null';
    const object = value as object;
    if (seen.includes(object)) return '[Circular]';
    if (object instanceof Error) return formatError(object);
    if (object instanceof Date) {
      return Number.isNaN(object.getTime()) ? 'Invalid Date' : object.toISOString();
    }
    if (object instanceof RegExp) return String(object);
    if (object instanceof Promise) return 'Promise { <state unknown> }';
    if (object instanceof WeakMap || object instanceof WeakSet) {
      return `${className(object)} { <items unknown> }`;
    }
    const name = className(object);
    if (depth > MAX_DEPTH) return `[${Array.isArray(object) ? 'Array' : name || 'Object'}]`;
    const next = [...seen, object];
    const nested = (item: unknown) => inspect(item, depth + 1, next);

    if (Array.isArray(object)) {
      const items: string[] = [];
      for (let index = 0; index < Math.min(object.length, MAX_ITEMS); index++) {
        items.push(index in object ? nested(object[index]) : '<empty>');
      }
      const prefix = name && name !== 'Array' ? `${name}(${object.length}) ` : '';
      return wrap(prefix, more(items, object.length), '[', ']');
    }
    if (ArrayBuffer.isView(object) && !(object instanceof DataView)) {
      const typed = object as unknown as ArrayLike<number | bigint>;
      const items = Array.from({ length: Math.min(typed.length, MAX_ITEMS) }, (_, index) =>
        nested(typed[index])
      );
      return wrap(`${name}(${typed.length}) `, more(items, typed.length), '[', ']');
    }
    if (object instanceof Map) {
      const items: string[] = [];
      for (const [key, item] of object) {
        if (items.length === MAX_ITEMS) break;
        items.push(`${nested(key)} => ${nested(item)}`);
      }
      return wrap(`${name}(${object.size}) `, more(items, object.size), '{', '}');
    }
    if (object instanceof Set) {
      const items: string[] = [];
      for (const item of object) {
        if (items.length === MAX_ITEMS) break;
        items.push(nested(item));
      }
      return wrap(`${name}(${object.size}) `, more(items, object.size), '{', '}');
    }
    const keys = Reflect.ownKeys(object).filter((key) =>
      Object.prototype.propertyIsEnumerable.call(object, key)
    );
    const items = keys.slice(0, MAX_ITEMS).map((key) => {
      const descriptor = Object.getOwnPropertyDescriptor(object, key);
      const shown = descriptor?.get
        ? descriptor.set
          ? '[Getter/Setter]'
          : '[Getter]'
        : descriptor?.set
          ? '[Setter]'
          : nested(descriptor?.value);
      return `${formatKey(key)}: ${shown}`;
    });
    const prefix =
      name === null ? '[Object: null prototype] ' : name && name !== 'Object' ? `${name} ` : '';
    return wrap(prefix, more(items, keys.length), '{', '}');
  };

  const show = (value: unknown) =>
    typeof value === 'string' ? truncate(value) : inspect(value, 0, []);

  /** `console.log` arguments, with printf-style `%s %d %i %f %j %o %O %c` in the first one. */
  const formatArgs = (args: unknown[]): string => {
    const [first] = args;
    if (typeof first !== 'string' || args.length < 2 || !first.includes('%')) {
      return args.map(show).join(' ');
    }
    let index = 1;
    const head = first.replace(/%([sdifjoOc%])/g, (match, spec: string) => {
      if (spec === '%') return '%';
      if (index >= args.length) return match;
      const arg = args[index++];
      switch (spec) {
        case 's':
          return typeof arg === 'object' && arg !== null ? inspect(arg, 0, []) : show(String(arg));
        case 'd':
        case 'i':
          if (typeof arg === 'bigint') return `${arg}n`;
          return String(spec === 'i' ? Math.trunc(Number(arg)) : Number(arg));
        case 'f':
          return String(Number.parseFloat(String(arg)));
        case 'j':
          try {
            return JSON.stringify(arg) ?? 'undefined';
          } catch {
            return '[Circular]';
          }
        case 'c':
          return '';
        default:
          return inspect(arg, 0, []);
      }
    });
    return [head, ...args.slice(index).map(show)].join(' ');
  };

  const formatTable = (data: unknown, columns: unknown): string => {
    if (typeof data !== 'object' || data === null) return formatArgs([data]);
    const source = (data instanceof Map || data instanceof Set ? Array.from(data) : data) as Record<
      string,
      unknown
    >;
    const cell = (value: unknown) => inspect(value, MAX_DEPTH, []).replace(/\s*\n\s*/g, ' ');
    const keys: string[] = [];
    let hasValues = false;
    const rows = Object.keys(source)
      .slice(0, MAX_ITEMS)
      .map((rowKey) => {
        const row = source[rowKey];
        const cells: Record<string, string> = {};
        if (typeof row === 'object' && row !== null) {
          for (const key of Object.keys(row)) {
            if (!keys.includes(key)) keys.push(key);
            cells[key] = cell((row as Record<string, unknown>)[key]);
          }
        } else {
          hasValues = true;
          cells['\0values'] = cell(row);
        }
        return { rowKey, cells };
      });
    const shownKeys = Array.isArray(columns) ? columns.map(String) : keys;
    const header = ['(index)', ...shownKeys, ...(hasValues ? ['Values'] : [])];
    const body = rows.map(({ rowKey, cells }) => [
      rowKey,
      ...shownKeys.map((key) => cells[key] ?? ''),
      ...(hasValues ? [cells['\0values'] ?? ''] : []),
    ]);
    const widths = header.map((title, column) =>
      Math.max(title.length, ...body.map((row) => row[column].length))
    );
    const rule = (start: string, middle: string, end: string) =>
      `${start}${widths.map((width) => '─'.repeat(width + 2)).join(middle)}${end}`;
    const line = (cells: string[]) =>
      `│${cells.map((text, column) => ` ${text.padEnd(widths[column])} `).join('│')}│`;
    return [
      rule('┌', '┬', '┐'),
      line(header),
      rule('├', '┼', '┤'),
      ...body.map(line),
      rule('└', '┴', '┘'),
    ].join('\n');
  };

  // Output, capped at `maxEntries` per run.
  let entries = 0;
  let truncated = false;
  let indent = 0;
  const admit = () => {
    if (entries < config.maxEntries) {
      entries++;
      return true;
    }
    if (!truncated) {
      truncated = true;
      post({ type: 'truncated' });
    }
    return false;
  };
  const emit = (level: LogLevel, text: string) => {
    if (admit()) post({ type: 'entry', entry: { level, text, indent } });
  };

  const counts = new Map<string, number>();
  const timers = new Map<string, number>();
  const labelOf = (value: unknown) => (value === undefined ? 'default' : String(value));
  const elapsed = (label: string) => {
    const start = timers.get(label);
    return start === undefined
      ? null
      : `${label}: ${(scope.performance.now() - start).toFixed(3)}ms`;
  };
  const traceFrames = () =>
    cleanStack(new Error().stack ?? '')
      .split('\n')
      .filter((frame) => frame.trim() && frame.trim() !== 'Error')
      .map((frame) => (frame.startsWith(' ') ? frame : `    ${frame}`));

  Object.assign(scope.console, {
    log: (...args: unknown[]) => emit('log', formatArgs(args)),
    info: (...args: unknown[]) => emit('info', formatArgs(args)),
    warn: (...args: unknown[]) => emit('warn', formatArgs(args)),
    error: (...args: unknown[]) => emit('error', formatArgs(args)),
    debug: (...args: unknown[]) => emit('debug', formatArgs(args)),
    dir: (value: unknown) => emit('log', inspect(value, 0, [])),
    dirxml: (...args: unknown[]) => emit('log', formatArgs(args)),
    table: (data: unknown, columns?: unknown) => emit('log', formatTable(data, columns)),
    trace: (...args: unknown[]) =>
      emit(
        'log',
        [`Trace${args.length ? `: ${formatArgs(args)}` : ''}`, ...traceFrames()].join('\n')
      ),
    assert: (condition: unknown, ...args: unknown[]) => {
      if (!condition) {
        emit('error', `Assertion failed${args.length ? `: ${formatArgs(args)}` : ''}`);
      }
    },
    group: (...args: unknown[]) => {
      if (args.length) emit('log', formatArgs(args));
      indent++;
    },
    groupCollapsed: (...args: unknown[]) => {
      if (args.length) emit('log', formatArgs(args));
      indent++;
    },
    groupEnd: () => {
      indent = Math.max(0, indent - 1);
    },
    count: (value?: unknown) => {
      const label = labelOf(value);
      const count = (counts.get(label) ?? 0) + 1;
      counts.set(label, count);
      emit('log', `${label}: ${count}`);
    },
    countReset: (value?: unknown) => {
      counts.delete(labelOf(value));
    },
    time: (value?: unknown) => {
      const label = labelOf(value);
      if (timers.has(label)) emit('warn', `Timer '${label}' already exists`);
      else timers.set(label, scope.performance.now());
    },
    timeLog: (value?: unknown, ...args: unknown[]) => {
      const label = labelOf(value);
      const text = elapsed(label);
      if (text === null) emit('warn', `Timer '${label}' does not exist`);
      else emit('log', args.length ? `${text} ${formatArgs(args)}` : text);
    },
    timeEnd: (value?: unknown) => {
      const label = labelOf(value);
      const text = elapsed(label);
      if (text === null) emit('warn', `Timer '${label}' does not exist`);
      else emit('log', text);
      timers.delete(label);
    },
    clear: () => {
      indent = 0;
      post({ type: 'clear' });
    },
  } satisfies Partial<Console>);

  // Completion: the code has been evaluated and no timer or fetch is pending.
  let evaluated = false;
  let finished = false;
  let requests = 0;
  const live = new Set<unknown>();
  const settle = () => {
    if (!evaluated || finished) return;
    // One macrotask later, so promise chains the code started can schedule more work first.
    nativeSetTimeout(() => {
      if (finished || live.size > 0 || requests > 0) return;
      finished = true;
      post({ type: 'done' });
    }, 0);
  };
  const clear = (id: unknown) => {
    if (live.delete(id)) settle();
    nativeClearTimeout(id as number);
    nativeClearInterval(id as number);
  };

  scope.setTimeout = ((handler: TimerHandler, delay?: number, ...args: unknown[]) => {
    if (typeof handler !== 'function') return nativeSetTimeout(handler, delay);
    const id = nativeSetTimeout(() => {
      live.delete(id);
      try {
        handler(...args);
      } finally {
        settle();
      }
    }, delay);
    live.add(id);
    return id;
  }) as typeof setTimeout;
  scope.setInterval = ((handler: TimerHandler, delay?: number, ...args: unknown[]) => {
    if (typeof handler !== 'function') return nativeSetInterval(handler, delay);
    const id = nativeSetInterval(() => handler(...args), delay);
    live.add(id);
    return id;
  }) as typeof setInterval;
  scope.clearTimeout = clear as typeof clearTimeout;
  scope.clearInterval = clear as typeof clearInterval;

  const nativeFetch = scope.fetch?.bind(scope);
  if (nativeFetch) {
    scope.fetch = ((...args: Parameters<typeof fetch>) => {
      requests++;
      return nativeFetch(...args).finally(() => {
        requests--;
        settle();
      });
    }) as typeof fetch;
  }

  // Uncaught errors become console errors; a throw at the top level also ends evaluation.
  const report = (reason: unknown, prefix: string, event?: ErrorEvent) => {
    let where = reason instanceof Error ? locate(reason.stack) : null;
    if (!where && event?.filename === scope.location.href) {
      const line = userLine(event.lineno);
      if (line !== null) where = { line, column: event.colno };
    }
    const error: SourceError = {
      message: reason instanceof Error ? `${reason.name}: ${reason.message}` : show(reason),
      ...where,
    };
    const text = `${prefix} ${reason instanceof Error ? formatError(reason) : show(reason)}`;
    if (admit()) post({ type: 'uncaught', text, error });
    if (!evaluated) {
      evaluated = true;
      settle();
    }
  };
  scope.addEventListener('error', (event) => {
    event.preventDefault();
    const errorEvent = event as ErrorEvent;
    report(errorEvent.error ?? errorEvent.message, 'Uncaught', errorEvent);
  });
  scope.addEventListener('unhandledrejection', (event) => {
    event.preventDefault();
    report((event as PromiseRejectionEvent).reason, 'Uncaught (in promise)');
  });

  Object.defineProperty(scope, config.hook, {
    value: () => {
      evaluated = true;
      settle();
    },
  });
  post({ type: 'ready' });
}

/**
 * The source of one run's module worker: the prelude, then the user's code, then a call that
 * marks the end of evaluation (it is not reached when the code throws at the top level).
 */
export function workerSource(code: string, options: PreludeOptions): string {
  const header = (lineOffset: number) =>
    `(${prelude.toString()})(${JSON.stringify({ ...options, hook: HOOK, lineOffset })});\n`;
  const lineOffset = header(0).split('\n').length - 1;
  return `${header(lineOffset)}${code}\n;globalThis.${HOOK}();\n`;
}
