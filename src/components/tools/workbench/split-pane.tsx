'use client';

import { useCallback, useRef, useSyncExternalStore } from 'react';
import { GripHorizontal, GripVertical } from 'lucide-react';
import { usePersistentState } from './use-persistent-state';
import { useToolCommon } from '@/i18n/tools/provider';
import { cn } from '@/lib/cn';

/** Matches Tailwind's `md` breakpoint, where panes switch from stacked to side by side. */
const SIDE_BY_SIDE_QUERY = '(min-width: 48rem)';
const KEY_STEP = 0.02;
const KEY_STEP_LARGE = 0.1;

function subscribeToLayout(listener: () => void) {
  const media = window.matchMedia(SIDE_BY_SIDE_QUERY);
  media.addEventListener('change', listener);
  return () => media.removeEventListener('change', listener);
}

const isRatio = (value: unknown): value is number =>
  typeof value === 'number' && value > 0 && value < 1;

/**
 * Two panes with a draggable 1px divider: side by side from `md`, stacked below. The divider
 * also works from the keyboard (arrows, Shift for larger steps, Home/End, double-click resets).
 * The split is saved per `id`.
 */
export function SplitPane({
  id,
  first,
  second,
  defaultRatio = 0.5,
  min = 0.15,
  className,
}: {
  id: string;
  first: React.ReactNode;
  second: React.ReactNode;
  defaultRatio?: number;
  /** Smallest share either pane can shrink to. */
  min?: number;
  className?: string;
}) {
  const common = useToolCommon();
  const [ratio, setRatio] = usePersistentState(`split:${id}`, defaultRatio, isRatio);
  const containerRef = useRef<HTMLDivElement>(null);
  const sideBySide = useSyncExternalStore(
    subscribeToLayout,
    () => window.matchMedia(SIDE_BY_SIDE_QUERY).matches,
    () => true
  );

  const clamp = useCallback((value: number) => Math.min(1 - min, Math.max(min, value)), [min]);

  const ratioAt = (event: React.PointerEvent) => {
    const container = containerRef.current;
    if (!container) return ratio;
    const rect = container.getBoundingClientRect();
    if (getComputedStyle(container).flexDirection === 'column') {
      return (event.clientY - rect.top) / rect.height;
    }
    const rtl = getComputedStyle(container).direction === 'rtl';
    return (rtl ? rect.right - event.clientX : event.clientX - rect.left) / rect.width;
  };

  // While dragging, write the CSS variable directly (no re-render per pointer move);
  // the final value is committed to state on release.
  const preview = (value: number) =>
    containerRef.current?.style.setProperty('--split', `${value * 100}%`);

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    event.currentTarget.dataset.dragging = '';
    document.body.style.userSelect = 'none';
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;
    preview(clamp(ratioAt(event)));
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;
    event.currentTarget.releasePointerCapture(event.pointerId);
    delete event.currentTarget.dataset.dragging;
    document.body.style.userSelect = '';
    setRatio(clamp(ratioAt(event)));
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const step = event.shiftKey ? KEY_STEP_LARGE : KEY_STEP;
    const rtl = getComputedStyle(event.currentTarget).direction === 'rtl';
    const grow = sideBySide ? (rtl ? 'ArrowLeft' : 'ArrowRight') : 'ArrowDown';
    const shrink = sideBySide ? (rtl ? 'ArrowRight' : 'ArrowLeft') : 'ArrowUp';
    let next: number | null = null;
    if (event.key === grow) next = ratio + step;
    else if (event.key === shrink) next = ratio - step;
    else if (event.key === 'Home') next = min;
    else if (event.key === 'End') next = 1 - min;
    if (next === null) return;
    event.preventDefault();
    setRatio(clamp(next));
  };

  return (
    <div
      ref={containerRef}
      style={{ '--split': `${clamp(ratio) * 100}%` } as React.CSSProperties}
      className={cn('flex min-h-0 min-w-0 flex-1 flex-col md:flex-row', className)}
    >
      <div className="flex min-h-0 min-w-0 shrink-0 basis-(--split) flex-col overflow-hidden">
        {first}
      </div>
      <div
        role="separator"
        tabIndex={0}
        aria-label={common.resize}
        aria-orientation={sideBySide ? 'vertical' : 'horizontal'}
        aria-valuemin={Math.round(min * 100)}
        aria-valuemax={Math.round((1 - min) * 100)}
        aria-valuenow={Math.round(clamp(ratio) * 100)}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onKeyDown={handleKeyDown}
        onDoubleClick={() => setRatio(defaultRatio)}
        className="group relative z-10 h-px w-full shrink-0 cursor-row-resize touch-none bg-line transition-colors outline-none after:absolute after:inset-x-0 after:-inset-y-1.5 after:content-[''] hover:bg-primary/60 focus-visible:bg-primary data-dragging:bg-primary md:h-auto md:w-px md:cursor-col-resize md:after:-inset-x-1.5 md:after:inset-y-0"
      >
        <span
          aria-hidden
          className="pointer-events-none absolute start-1/2 top-1/2 flex h-4 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-surface-2 text-fg-subtle transition-colors group-hover:border-primary/60 group-hover:text-primary group-focus-visible:border-primary group-focus-visible:text-primary group-data-dragging:border-primary group-data-dragging:text-primary md:h-9 md:w-4 ltr:-translate-x-1/2 rtl:translate-x-1/2"
        >
          {sideBySide ? (
            <GripVertical className="size-3.5" />
          ) : (
            <GripHorizontal className="size-3.5" />
          )}
        </span>
      </div>
      <div className="flex min-h-0 min-w-0 flex-1 basis-0 flex-col overflow-hidden">{second}</div>
    </div>
  );
}
