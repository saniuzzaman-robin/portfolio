'use client';

import type { CompileResult } from '@/lib/tools/playground/typescript';
import type { RunOptions, RunOutcome, RunStatus, SourceError } from '@/lib/tools/playground/types';
import { runJavaScript } from './run-javascript';
import type { WorkerRequest, WorkerResponse } from './typescript.worker';

/** One compiler worker is reused across runs (it keeps the parsed libs); replaced only on failure. */
let worker: Worker | null = null;
let nextId = 0;

/** Compiles in the shared worker. Resolves null when `signal` aborts first. */
function compile(
  code: string,
  fileName: string,
  signal: AbortSignal
): Promise<CompileResult | null> {
  return new Promise((resolve, reject) => {
    const current = (worker ??= new Worker(new URL('./typescript.worker.ts', import.meta.url), {
      type: 'module',
      name: 'typescript',
    }));
    const id = ++nextId;
    const cleanup = () => {
      signal.removeEventListener('abort', onAbort);
      current.removeEventListener('message', onMessage);
      current.removeEventListener('error', onError);
    };
    const onMessage = (event: MessageEvent<WorkerResponse>) => {
      if (event.data.id !== id) return;
      cleanup();
      if ('error' in event.data) reject(new Error(event.data.error));
      else resolve(event.data.result);
    };
    const onError = (event: ErrorEvent) => {
      cleanup();
      current.terminate();
      if (worker === current) worker = null;
      reject(new Error(event.message || 'The TypeScript worker failed to start.'));
    };
    // The compile itself keeps going (stopping it would lose the parsed libs); its answer is ignored.
    const onAbort = () => {
      cleanup();
      resolve(null);
    };
    signal.addEventListener('abort', onAbort, { once: true });
    current.addEventListener('message', onMessage);
    current.addEventListener('error', onError);
    current.postMessage({ id, code, fileName } satisfies WorkerRequest);
  });
}

/**
 * Type-checks and compiles TypeScript, then runs the JavaScript like `runJavaScript`. Compiler
 * errors stop it before it runs (status `rejected`), with positions in the TypeScript source.
 */
export async function runTypeScript(code: string, options: RunOptions): Promise<RunOutcome> {
  const started = performance.now();
  const outcome = (status: RunStatus, errors: SourceError[] = []): RunOutcome => ({
    status,
    durationMs: performance.now() - started,
    errors,
    truncated: false,
  });
  if (options.signal.aborted) return outcome('stopped');
  const result = await compile(code, options.fileName, options.signal);
  if (result === null) return outcome('stopped');
  if (!result.ok) return outcome('rejected', result.errors);
  return runJavaScript(result.js, { ...options, lineMap: result.lineMap });
}
