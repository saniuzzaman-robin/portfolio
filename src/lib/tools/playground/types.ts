export type LogLevel = 'log' | 'info' | 'warn' | 'error' | 'debug';

/** One console line, already formatted in the worker. */
export type OutputEntry = {
  level: LogLevel;
  text: string;
  /** `console.group` nesting depth. */
  indent: number;
};

/** A position in the user's source (1-based), when one is known. */
export type SourceError = { message: string; line?: number; column?: number };

/** Messages the prelude posts from inside the run's worker. */
export type PreludeMessage =
  | { type: 'ready' }
  | { type: 'entry'; entry: OutputEntry }
  | { type: 'clear' }
  | { type: 'truncated' }
  | { type: 'uncaught'; text: string; error: SourceError }
  | { type: 'done' };

export type RunStatus =
  /** The code ran to the end and nothing is left pending. */
  | 'done'
  /** Killed after the time limit (an endless loop, or an interval never cleared). */
  | 'timeout'
  /** Killed by the user. */
  | 'stopped'
  /** The code could not be loaded (a syntax error, or an import that was blocked). */
  | 'invalid'
  /** The compiler reported errors, so the code was not run. */
  | 'rejected';

export type RunOptions = {
  /** Name of the user's file in stack traces ("main.js"). */
  fileName: string;
  /** For compiled code: the original line of each generated line (index 0 is line 1). */
  lineMap?: number[] | null;
  /** Aborting stops the run (its outcome is then `stopped`). */
  signal: AbortSignal;
  /** New console lines, batched per animation frame. */
  onOutput: (entries: OutputEntry[]) => void;
  /** The code called `console.clear()`. */
  onClear: () => void;
};

export type RunOutcome = {
  status: RunStatus;
  durationMs: number;
  /**
   * Uncaught errors in the order they happened; for `invalid`, the load error if one was found;
   * for `rejected`, the compiler errors.
   */
  errors: SourceError[];
  /** True when output past the entry limit was dropped. */
  truncated: boolean;
};
