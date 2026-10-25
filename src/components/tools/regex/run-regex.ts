'use client';

import type { RegexRequest, RegexResult } from '@/lib/tools/regex/run';
import type { WorkerRequest, WorkerResponse } from './regex.worker';

/** How long one run may take before the worker is killed as runaway backtracking. */
export const REGEX_TIMEOUT_MS = 2000;

export type RegexOutcome = { kind: 'done'; result: RegexResult } | { kind: 'timeout' };

/** One worker is reused across runs; it is replaced only after it is killed. */
let worker: Worker | null = null;
let nextId = 0;

/**
 * Runs one request in the shared worker. A run that is aborted (superseded by newer input) or
 * exceeds `REGEX_TIMEOUT_MS` before answering terminates the worker, which is the only way to
 * stop a synchronous regex mid-match.
 */
export function runRegexInWorker(
  request: RegexRequest,
  signal: AbortSignal
): Promise<RegexOutcome> {
  return new Promise((resolve, reject) => {
    const current = (worker ??= new Worker(new URL('./regex.worker.ts', import.meta.url), {
      type: 'module',
    }));
    const id = ++nextId;
    const kill = () => {
      current.terminate();
      if (worker === current) worker = null;
    };
    const cleanup = () => {
      clearTimeout(timer);
      signal.removeEventListener('abort', onAbort);
      current.removeEventListener('message', onMessage);
      current.removeEventListener('error', onError);
    };
    const onMessage = (event: MessageEvent<WorkerResponse>) => {
      if (event.data.id !== id) return;
      cleanup();
      resolve({ kind: 'done', result: event.data.result });
    };
    const onError = (event: ErrorEvent) => {
      cleanup();
      kill();
      reject(new Error(event.message || 'The regex worker failed to start.'));
    };
    const onAbort = () => {
      cleanup();
      kill();
      reject(signal.reason);
    };
    const timer = setTimeout(() => {
      cleanup();
      kill();
      resolve({ kind: 'timeout' });
    }, REGEX_TIMEOUT_MS);
    signal.addEventListener('abort', onAbort, { once: true });
    current.addEventListener('message', onMessage);
    current.addEventListener('error', onError);
    current.postMessage({ id, request } satisfies WorkerRequest);
  });
}
