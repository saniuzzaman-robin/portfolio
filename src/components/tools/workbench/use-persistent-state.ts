'use client';

import { useCallback, useSyncExternalStore } from 'react';

const STORAGE_PREFIX = 'tools:';
/** localStorage holds ~5 MB per origin; bigger values are kept in memory for this session only. */
const MAX_PERSISTED_CHARS = 512 * 1024;
/** Typing into a large editor shouldn't serialize to storage on every keystroke. */
const WRITE_DELAY_MS = 400;

/* In-memory cache in front of localStorage: snapshots stay cheap and storage failures are harmless. */
const memory = new Map<string, unknown>();
const listeners = new Map<string, Set<() => void>>();
const pendingWrites = new Map<string, ReturnType<typeof setTimeout>>();

function read(key: string): unknown {
  if (memory.has(key)) return memory.get(key);
  let value: unknown;
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + key);
    if (raw !== null) value = JSON.parse(raw);
  } catch (error) {
    // Unavailable storage (privacy mode) or a corrupt entry: fall back to the default.
    console.warn(`Ignoring stored value for "${key}":`, error);
  }
  memory.set(key, value);
  return value;
}

function persist(key: string, value: unknown) {
  clearTimeout(pendingWrites.get(key));
  pendingWrites.set(
    key,
    setTimeout(() => {
      pendingWrites.delete(key);
      try {
        const raw = JSON.stringify(value);
        if (raw.length > MAX_PERSISTED_CHARS) localStorage.removeItem(STORAGE_PREFIX + key);
        else localStorage.setItem(STORAGE_PREFIX + key, raw);
      } catch (error) {
        console.warn(`Could not persist "${key}"; it is kept for this session only:`, error);
      }
    }, WRITE_DELAY_MS)
  );
}

function write(key: string, value: unknown) {
  memory.set(key, value);
  persist(key, value);
  listeners.get(key)?.forEach((listener) => listener());
}

function subscribe(key: string, listener: () => void) {
  const set = listeners.get(key) ?? new Set();
  set.add(listener);
  listeners.set(key, set);
  return () => {
    set.delete(listener);
  };
}

/** Same JSON shape as the default (guards against values saved by an older version). */
function sameShape(stored: unknown, fallback: unknown): boolean {
  return typeof stored === typeof fallback && Array.isArray(stored) === Array.isArray(fallback);
}

/** Reads a persisted value without a hook; `undefined` when nothing is stored. */
export function readPersistentState(key: string): unknown {
  return read(key);
}

/** Sets a persisted value without a hook, e.g. for a key the component is about to switch to. */
export function writePersistentState<T>(key: string, value: T) {
  write(key, value);
}

/**
 * `useState` that survives reloads (localStorage, namespaced under `tools:`). The server and the
 * first client render use `initial`, so markup never mismatches. Pass a stable `initial` (a module
 * constant for objects). Never use it for secrets.
 */
export function usePersistentState<T>(
  key: string,
  initial: T,
  isValid: (value: unknown) => value is T = (value): value is T => sameShape(value, initial)
): [T, (next: T | ((previous: T) => T)) => void] {
  const stored = useSyncExternalStore(
    useCallback((listener) => subscribe(key, listener), [key]),
    () => read(key),
    () => undefined
  );
  const value = stored !== undefined && isValid(stored) ? stored : initial;

  const setValue = useCallback(
    (next: T | ((previous: T) => T)) => {
      const current = read(key);
      const previous = current !== undefined && isValid(current) ? current : initial;
      write(key, typeof next === 'function' ? (next as (previous: T) => T)(previous) : next);
    },
    [key, initial, isValid]
  );

  return [value, setValue];
}
