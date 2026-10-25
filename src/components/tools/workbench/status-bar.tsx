'use client';

import { CircleAlert, CircleCheck, ShieldCheck } from 'lucide-react';
import { useToolCommon } from '@/i18n/tools/provider';
import { fmt } from '@/i18n/dictionary';
import type { CursorInfo } from './code-editor';
import { cn } from '@/lib/cn';

/** VS Code-style strip under the panes: live status on the start side, privacy note at the end. */
export function StatusBar({ children }: { children?: React.ReactNode }) {
  const common = useToolCommon();
  return (
    <div className="box-content flex h-6 shrink-0 items-center gap-3 border-t border-line bg-surface px-2 pb-[env(safe-area-inset-bottom)] font-mono text-[11px] text-fg-subtle">
      <div
        aria-live="polite"
        className="flex min-w-0 flex-1 items-center gap-3 overflow-hidden whitespace-nowrap"
      >
        {children}
      </div>
      <span title={common.runsLocallyHint} className="flex shrink-0 items-center gap-1">
        <ShieldCheck className="size-3 text-success" aria-hidden />
        <span className="hidden sm:inline">{common.runsLocally}</span>
        <span className="sr-only sm:hidden">{common.runsLocallyHint}</span>
      </span>
    </div>
  );
}

type Tone = 'muted' | 'success' | 'danger' | 'warning';

const TONES: Record<Tone, string> = {
  muted: '',
  success: 'text-success',
  danger: 'text-danger',
  warning: 'text-warning',
};

/**
 * One status bar entry. Muted items (sizes, counts, cursor) change on every keystroke, so they opt
 * out of the bar's live region; the colored tones (valid, errors, warnings) are announced.
 */
export function StatusItem({
  tone = 'muted',
  onClick,
  title,
  className,
  children,
}: {
  tone?: Tone;
  /** Makes the item a button (e.g. click an error to jump to it). */
  onClick?: () => void;
  title?: string;
  className?: string;
  children: React.ReactNode;
}) {
  const classes = cn('flex min-w-0 items-center gap-1 truncate', TONES[tone], className);
  const live = tone === 'muted' ? 'off' : undefined;
  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        title={title}
        aria-live={live}
        className={cn(
          classes,
          'cursor-pointer hover:underline focus-visible:underline focus-visible:outline-none'
        )}
      >
        {children}
      </button>
    );
  }
  return (
    <span title={title} aria-live={live} className={classes}>
      {children}
    </span>
  );
}

/** "✓ Valid" or "✗ Error at 3:14 — message"; the error jumps to its position when clicked. */
export function ValidityStatus({
  error,
  onReveal,
}: {
  error: { message: string; line: number; col: number } | null;
  onReveal?: () => void;
}) {
  const common = useToolCommon();
  if (!error) {
    return (
      <StatusItem tone="success">
        <CircleCheck className="size-3 shrink-0" aria-hidden />
        {common.valid}
      </StatusItem>
    );
  }
  return (
    <StatusItem tone="danger" onClick={onReveal} title={error.message}>
      <CircleAlert className="size-3 shrink-0" aria-hidden />
      <span className="shrink-0">{fmt(common.errorAt, { line: error.line, col: error.col })}</span>
      <span className="truncate font-sans">— {error.message}</span>
    </StatusItem>
  );
}

/** "Ln 3, Col 14 · 12 selected" for the focused editor. */
export function CursorStatus({ cursor }: { cursor: CursorInfo | null }) {
  const common = useToolCommon();
  if (!cursor) return null;
  return (
    <StatusItem className="shrink-0">
      {fmt(common.position, { line: cursor.line, col: cursor.col })}
      {cursor.selected > 0 && ` · ${fmt(common.selected, { count: cursor.selected })}`}
    </StatusItem>
  );
}
