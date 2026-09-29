'use client';

import { useSyncExternalStore } from 'react';

const TICK_MS = 15_000;

function subscribe(onChange: () => void) {
  const id = setInterval(onChange, TICK_MS);
  return () => clearInterval(id);
}

/** Current wall-clock time in `timeZone`; renders a placeholder on the server. */
export function LocalTime({ timeZone }: { timeZone: string }) {
  const time = useSyncExternalStore(
    subscribe,
    () =>
      new Intl.DateTimeFormat('en-GB', {
        timeZone,
        hour: '2-digit',
        minute: '2-digit',
        timeZoneName: 'short',
      }).format(new Date()),
    () => null
  );

  return <time suppressHydrationWarning>{time ?? '--:--'}</time>;
}
