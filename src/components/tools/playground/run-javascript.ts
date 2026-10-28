'use client';

import { workerSource } from '@/lib/tools/playground/prelude';
import { findSyntaxError } from '@/lib/tools/playground/syntax';
import type {
  OutputEntry,
  PreludeMessage,
  RunOptions,
  RunOutcome,
  RunStatus,
  SourceError,
} from '@/lib/tools/playground/types';

/** A run is killed after this long (an endless loop, or an interval that is never cleared). */
export const RUN_TIMEOUT_MS = 10_000;

/** Console lines kept per run; later ones are dropped so a log in a loop can't flood the page. */
export const MAX_OUTPUT_ENTRIES = 1000;

/**
 * Runs JavaScript as a module in a new worker made from a Blob URL. The worker has no DOM and
 * no access to the page, so the code can't break it; it is terminated when the code finishes
 * (nothing pending), on timeout or when `signal` aborts. Each run starts from clean globals.
 */
export function runJavaScript(code: string, options: RunOptions): Promise<RunOutcome> {
  const { signal, onOutput, onClear } = options;
  const lineMap = options.lineMap ?? null;
  const started = performance.now();
  const errors: SourceError[] = [];
  let truncated = false;
  const outcome = (status: RunStatus): RunOutcome => ({
    status,
    durationMs: performance.now() - started,
    errors,
    truncated,
  });
  if (signal.aborted) return Promise.resolve(outcome('stopped'));

  return new Promise((resolve) => {
    const source = workerSource(code, {
      fileName: options.fileName,
      lineMap,
      maxEntries: MAX_OUTPUT_ENTRIES,
    });
    const url = URL.createObjectURL(new Blob([source], { type: 'text/javascript' }));
    const worker = new Worker(url, { type: 'module', name: 'playground' });
    let ready = false;
    let finished = false;

    // Lines arrive one message each; they reach the page at most once per frame.
    let buffer: OutputEntry[] = [];
    let frame = 0;
    const flush = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      if (buffer.length === 0) return;
      const batch = buffer;
      buffer = [];
      onOutput(batch);
    };
    const push = (entry: OutputEntry) => {
      buffer.push(entry);
      frame ||= requestAnimationFrame(flush);
    };

    const stop = () => {
      finished = true;
      clearTimeout(timer);
      signal.removeEventListener('abort', onAbort);
      worker.terminate();
      URL.revokeObjectURL(url);
      flush();
    };
    const finish = (status: RunStatus) => {
      if (finished) return;
      stop();
      resolve(outcome(status));
    };
    const onAbort = () => finish('stopped');
    const timer = setTimeout(() => finish('timeout'), RUN_TIMEOUT_MS);
    signal.addEventListener('abort', onAbort, { once: true });

    worker.addEventListener('message', (event: MessageEvent<PreludeMessage>) => {
      if (finished) return;
      const message = event.data;
      switch (message.type) {
        case 'ready':
          ready = true;
          break;
        case 'entry':
          push(message.entry);
          break;
        case 'clear':
          buffer = [];
          onClear();
          break;
        case 'truncated':
          truncated = true;
          break;
        case 'uncaught':
          errors.push(message.error);
          push({ level: 'error', text: message.text, indent: 0 });
          break;
        case 'done':
          finish('done');
          break;
      }
    });

    // Once the prelude runs it reports errors itself, so this only fires when the module failed
    // to load: a syntax error, or an import the browser refused.
    worker.addEventListener('error', (event) => {
      event.preventDefault();
      if (ready || finished) return;
      stop();
      findSyntaxError(code).then(
        (found) => {
          const error = found ?? (event.message ? { message: event.message } : null);
          if (error?.line !== undefined && lineMap) error.line = lineMap[error.line - 1];
          if (error) errors.push(error);
          resolve(outcome('invalid'));
        },
        (cause: unknown) => {
          console.error('Checking the code for syntax errors failed:', cause);
          resolve(outcome('invalid'));
        }
      );
    });
  });
}
