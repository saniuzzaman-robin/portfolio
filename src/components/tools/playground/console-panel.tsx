'use client';

import { useEffect, useRef } from 'react';
import { CircleAlert, Info, TriangleAlert, type LucideIcon } from 'lucide-react';
import type { LogLevel, OutputEntry } from '@/lib/tools/playground/types';
import { cn } from '@/lib/cn';

const LEVELS: Record<LogLevel, { className: string; icon?: LucideIcon }> = {
  log: { className: 'text-fg' },
  debug: { className: 'text-fg-subtle' },
  info: { className: 'text-primary-text', icon: Info },
  warn: { className: 'bg-warning/5 text-warning', icon: TriangleAlert },
  error: { className: 'bg-danger/5 text-danger', icon: CircleAlert },
};

/** How close to the bottom (px) still counts as "following" new output. */
const FOLLOW_THRESHOLD = 24;

/** Console lines, as plain text with `console.group` indentation. */
export function outputText(entries: OutputEntry[]): string {
  return entries.map((entry) => entry.text.replace(/^/gm, '  '.repeat(entry.indent))).join('\n');
}

/**
 * Browser-devtools-style console: one row per entry, colored by level. It follows new output
 * while scrolled to the bottom, and stays put once the user scrolls up to read.
 */
export function ConsolePanel({
  entries,
  label,
  footer,
  className,
}: {
  entries: OutputEntry[];
  label: string;
  /** Shown after the entries: the run's outcome, or a hint before the first run. */
  footer?: React.ReactNode;
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const follow = useRef(true);

  useEffect(() => {
    const container = containerRef.current;
    if (container && follow.current) container.scrollTop = container.scrollHeight;
  }, [entries, footer]);

  return (
    <div
      ref={containerRef}
      role="log"
      aria-label={label}
      tabIndex={0}
      onScroll={(event) => {
        const { scrollTop, scrollHeight, clientHeight } = event.currentTarget;
        follow.current = scrollHeight - scrollTop - clientHeight <= FOLLOW_THRESHOLD;
      }}
      className={cn(
        'min-h-0 flex-1 overflow-auto font-mono text-xs leading-5 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-inset',
        className
      )}
    >
      {entries.map((entry, index) => {
        const { className: tone, icon: Icon } = LEVELS[entry.level];
        return (
          <div
            key={index}
            dir="ltr"
            className={cn('flex gap-1.5 border-b border-line/60 py-0.5 pe-3', tone)}
            style={{ paddingLeft: `${0.75 + entry.indent}rem` }}
          >
            <span className="flex w-3.5 shrink-0 pt-0.75">
              {Icon && <Icon className="size-3.5" aria-hidden />}
            </span>
            <span className="min-w-0 flex-1 wrap-anywhere whitespace-pre-wrap">{entry.text}</span>
          </div>
        );
      })}
      {footer && <div className="px-3 py-1.5 font-sans text-xs text-fg-subtle">{footer}</div>}
    </div>
  );
}
