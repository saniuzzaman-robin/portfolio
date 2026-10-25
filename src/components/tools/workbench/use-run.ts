'use client';

import { useState } from 'react';

/** Shown in hints and tooltips; `RunButton` listens for both modifiers. */
export const RUN_SHORTCUT = 'Ctrl/⌘+Enter';

/** Dims an output that no longer matches the input. */
export const STALE_OUTPUT_CLASS = 'opacity-50 transition-opacity';

type Snapshot = { texts: readonly string[]; scope: string };

/**
 * `useRunInput` for tools whose inputs run together (a JWT's header and payload, both sides of a
 * diff): `values` and `run(next)` follow the order of `texts`.
 */
export function useRunInputs(
  texts: readonly string[],
  scope = ''
): {
  values: readonly string[];
  run: (next?: readonly string[], nextScope?: string) => void;
  ran: boolean;
  stale: boolean;
} {
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const current = snapshot?.scope === scope ? snapshot : null;
  return {
    values: current?.texts ?? texts.map(() => ''),
    run: (next = texts, nextScope = scope) => setSnapshot({ texts: next, scope: nextScope }),
    ran: current !== null,
    stale: current !== null && current.texts.some((text, index) => text !== texts[index]),
  };
}

/**
 * Editor text for tools that convert on demand: `value` is the input as of the last `run()`, so
 * options apply to it right away while edits wait for the next run. Nothing runs on its own,
 * including restored input. `scope` names the input being edited (e.g. the source format, when
 * each has its own input); switching it shows nothing until that input is run.
 */
export function useRunInput(
  text: string,
  scope = ''
): {
  value: string;
  /** Snapshots `next` (default: the current text) for `nextScope` (default: the current one). */
  run: (next?: string, nextScope?: string) => void;
  /** True once the current scope has been run. */
  ran: boolean;
  /** True when the input was edited since the last run. */
  stale: boolean;
} {
  const { values, run, ran, stale } = useRunInputs([text], scope);
  return {
    value: values[0],
    run: (next = text, nextScope = scope) => run([next], nextScope),
    ran,
    stale,
  };
}
