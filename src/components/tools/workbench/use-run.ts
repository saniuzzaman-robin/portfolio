'use client';

import { useState } from 'react';

/** Shown in hints and tooltips; `RunButton` listens for both modifiers. */
export const RUN_SHORTCUT = 'Ctrl/⌘+Enter';

/** Grays out an output that no longer matches the input (unlike dimming, it keeps text contrast). */
export const STALE_OUTPUT_CLASS = 'grayscale transition-[filter]';

type Snapshot<S> = { texts: readonly string[]; scope: string; settings: S; key: string };

/**
 * `useRunInput` for tools whose inputs run together (a JWT's header and payload, both sides of a
 * diff): `values` and `run(next)` follow the order of `texts`. `settings` (options, toggles, the
 * selected mode: anything serializable that changes the result) is snapshotted with the texts, so
 * changing it only marks the output stale until the next run; the returned `settings` is the
 * snapshot's (the live ones before the first run).
 */
export function useRunInputs<S = null>(
  texts: readonly string[],
  scope = '',
  settings: S = null as S
): {
  values: readonly string[];
  settings: S;
  run: (next?: readonly string[], nextScope?: string, nextSettings?: S) => void;
  ran: boolean;
  stale: boolean;
} {
  const [snapshot, setSnapshot] = useState<Snapshot<S> | null>(null);
  const current = snapshot?.scope === scope ? snapshot : null;
  const key = JSON.stringify(settings);
  return {
    values: current?.texts ?? texts.map(() => ''),
    settings: current?.settings ?? settings,
    run: (next = texts, nextScope = scope, nextSettings = settings) =>
      setSnapshot({
        texts: next,
        scope: nextScope,
        settings: nextSettings,
        key: nextSettings === settings ? key : JSON.stringify(nextSettings),
      }),
    ran: current !== null,
    stale:
      current !== null &&
      (current.key !== key || current.texts.some((text, index) => text !== texts[index])),
  };
}

/**
 * Editor text for tools that convert on demand: `value` is the input as of the last `run()`, and
 * edits to it or to `settings` wait for the next run. Nothing runs on its own, including restored
 * input. `scope` names the input being edited (e.g. the source format, when each has its own
 * input); switching it shows nothing until that input is run.
 */
export function useRunInput<S = null>(
  text: string,
  scope = '',
  settings: S = null as S
): {
  value: string;
  /** The `settings` as of the last run (the live ones before the first). */
  settings: S;
  /** Snapshots `next` (default: the current text) for `nextScope` (default: the current one). */
  run: (next?: string, nextScope?: string, nextSettings?: S) => void;
  /** True once the current scope has been run. */
  ran: boolean;
  /** True when the input or settings changed since the last run. */
  stale: boolean;
} {
  const runner = useRunInputs([text], scope, settings);
  return {
    value: runner.values[0],
    settings: runner.settings,
    run: (next = text, nextScope = scope, nextSettings = settings) =>
      runner.run([next], nextScope, nextSettings),
    ran: runner.ran,
    stale: runner.stale,
  };
}

/**
 * For tools whose inputs are fields rather than one editor: `applied` is a snapshot of `draft`
 * as of the last `apply()` (null before the first), so nothing changes in the output until the
 * user runs it. Values are compared one level deep, by identity, so keep objects immutable.
 */
export function useApplied<T extends Record<string, unknown>>(
  draft: T
): {
  applied: T | null;
  apply: (next?: T) => void;
  /** Forgets the last run, as if none had happened. */
  reset: () => void;
  /** True when `draft` differs from `applied`. */
  stale: boolean;
} {
  const [applied, setApplied] = useState<T | null>(null);
  const keys = Object.keys(draft);
  const stale =
    applied !== null &&
    (keys.length !== Object.keys(applied).length ||
      keys.some((key) => !Object.is(applied[key], draft[key])));
  return {
    applied,
    apply: (next = draft) => setApplied(next),
    reset: () => setApplied(null),
    stale,
  };
}
