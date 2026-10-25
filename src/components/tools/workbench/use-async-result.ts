'use client';

import { useEffect, useState } from 'react';

type Task<T> = (signal: AbortSignal) => Promise<T>;
type Settled<T> = { task: Task<T>; value?: T; error?: string };

/**
 * Runs an async `task` whenever it changes (memoize it) and keeps its outcome. `value` belongs
 * to the current task (undefined while it runs); `latest` is the last value of any task, for
 * showing a stale result instead of flickering. A rejection is logged and surfaced as `error`.
 * The task's `signal` aborts when it is replaced or the component unmounts.
 */
export function useAsyncResult<T>(task: Task<T> | null): {
  value: T | undefined;
  latest: T | undefined;
  pending: boolean;
  error: string | null;
} {
  const [settled, setSettled] = useState<Settled<T> | null>(null);

  useEffect(() => {
    if (!task) return;
    const controller = new AbortController();
    task(controller.signal).then(
      (value) => {
        if (!controller.signal.aborted) setSettled({ task, value });
      },
      (error: unknown) => {
        if (controller.signal.aborted) return;
        console.error('Background task failed:', error);
        setSettled({ task, error: error instanceof Error ? error.message : String(error) });
      }
    );
    return () => controller.abort();
  }, [task]);

  const current = task !== null && settled?.task === task ? settled : null;
  return {
    value: current?.value,
    latest: settled?.value,
    pending: task !== null && current === null,
    error: current?.error ?? null,
  };
}
