'use client';

import { useSyncExternalStore } from 'react';

const TICK_MS = 1000;

/* One shared clock for every subscriber, running only while something is subscribed. */
let now = 0;
let timer: ReturnType<typeof setInterval> | undefined;
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (!timer) {
    now = Date.now();
    timer = setInterval(() => {
      now = Date.now();
      listeners.forEach((notify) => notify());
    }, TICK_MS);
  }
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) {
      clearInterval(timer);
      timer = undefined;
    }
  };
}

function getSnapshot() {
  if (!timer) now = Date.now();
  return now;
}

/**
 * The current time in ms, updated every second. Null on the server and during hydration, so
 * anything time- or timezone-dependent renders only on the client.
 */
export function useNow(): number | null {
  return useSyncExternalStore(subscribe, getSnapshot, () => null);
}
