'use client';

import { useEffect, useState } from 'react';

/** Small inputs convert on every keystroke; large ones wait for a pause in typing. */
function delayFor(length: number): number {
  if (length < 20_000) return 0;
  if (length < 500_000) return 150;
  return 400;
}

/** `value`, updated only after it stops changing for `delayMs` (immediately when `delayMs` is 0). */
export function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);
  // Also tracks the value while undelayed, so growing past a threshold never surfaces a stale one.
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), Math.max(0, delayMs));
    return () => clearTimeout(timer);
  }, [value, delayMs]);
  return delayMs <= 0 ? value : debounced;
}

/**
 * Editor text to feed live conversions: debounced by size so multi-megabyte inputs don't
 * recompute on every keystroke. `pending` is true while a newer value is waiting.
 */
export function useLiveInput(text: string): { value: string; pending: boolean } {
  const value = useDebouncedValue(text, delayFor(text.length));
  return { value, pending: value !== text };
}
