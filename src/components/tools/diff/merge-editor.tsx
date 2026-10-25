'use client';

import { useEffect, useImperativeHandle, useLayoutEffect, useRef, useState } from 'react';
import type { MergeController, MergeLayout, Side } from './merge-setup';
import type { TextChange } from '@/lib/tools/diff/text';
import { loadLanguage, type EditorLanguage } from '@/components/tools/workbench/editor-languages';
import { cn } from '@/lib/cn';

export type MergeEditorHandle = {
  goTo(direction: 'next' | 'previous'): void;
};

type MergeEditorProps = {
  /** `layout`, `collapse` and `diff` are read once: change the component's `key` to apply new ones. */
  layout: MergeLayout;
  collapse: boolean;
  diff: (a: string, b: string) => readonly TextChange[];
  a: string;
  b: string;
  onChange?: (side: Side, value: string) => void;
  labels: Record<Side, string>;
  placeholders: Record<Side, string>;
  readOnly?: boolean;
  language?: EditorLanguage;
  wrap?: boolean;
  className?: string;
  ref?: React.Ref<MergeEditorHandle>;
};

type Setup = typeof import('./merge-setup');
/** Kept after the first load, so remounting (new options) doesn't flash the fallback. */
let loadedSetup: Setup | null = null;

/**
 * Diff view that fills its container: two aligned editors, or one with the original's lines
 * shown inline. Until the chunk loads (or if it fails to), plain textareas stand in so the
 * inputs stay editable. Always left-to-right, including on RTL pages.
 */
export function MergeEditor({
  layout,
  collapse,
  diff,
  a,
  b,
  onChange,
  labels,
  placeholders,
  readOnly = false,
  language = 'plain',
  wrap = false,
  className,
  ref,
}: MergeEditorProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const controllerRef = useRef<MergeController | null>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  const latest = useRef({
    layout,
    collapse,
    diff,
    a,
    b,
    onChange,
    labels,
    placeholders,
    readOnly,
    wrap,
  });
  useEffect(() => {
    latest.current = {
      layout,
      collapse,
      diff,
      a,
      b,
      onChange,
      labels,
      placeholders,
      readOnly,
      wrap,
    };
  });

  // Layout effect: with the chunk already loaded, the view exists before the first paint.
  useLayoutEffect(() => {
    let cancelled = false;
    const create = (setup: Setup) => {
      const host = hostRef.current;
      if (cancelled || !host) return;
      const props = latest.current;
      controllerRef.current = setup.createMerge(host, {
        ...props,
        onChange: (side, value) => latest.current.onChange?.(side, value),
      });
      setReady(true);
    };
    if (loadedSetup) create(loadedSetup);
    else {
      import('./merge-setup')
        .then((setup) => {
          loadedSetup = setup;
          create(setup);
        })
        .catch((error: unknown) => {
          console.error('Diff view failed to load; using plain text areas instead.', error);
          setFailed(true);
        });
    }
    return () => {
      cancelled = true;
      controllerRef.current?.destroy();
      controllerRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (ready) controllerRef.current?.setDoc('a', a);
  }, [ready, a]);

  useEffect(() => {
    if (ready) controllerRef.current?.setDoc('b', b);
  }, [ready, b]);

  useEffect(() => {
    if (ready) controllerRef.current?.setReadOnly(readOnly);
  }, [ready, readOnly]);

  useEffect(() => {
    if (ready) controllerRef.current?.setWrap(wrap);
  }, [ready, wrap]);

  useEffect(() => {
    if (ready) controllerRef.current?.setPlaceholders(placeholders);
  }, [ready, placeholders]);

  useEffect(() => {
    if (!ready) return;
    let cancelled = false;
    loadLanguage(language)
      .then((extension) => {
        if (!cancelled) controllerRef.current?.setLanguage(extension);
      })
      .catch((error: unknown) => {
        console.error(`Syntax support for "${language}" failed to load.`, error);
      });
    return () => {
      cancelled = true;
    };
  }, [ready, language]);

  useImperativeHandle(
    ref,
    () => ({ goTo: (direction) => controllerRef.current?.goTo(direction) }),
    []
  );

  const fallbackSides: Side[] = layout === 'split' ? ['a', 'b'] : ['b'];
  const showFallback = !ready && (failed || !loadedSetup);

  return (
    <div
      dir="ltr"
      className={cn(
        'relative min-h-0 min-w-0 flex-1 overflow-hidden [&_.cm-mergeView]:h-full',
        className
      )}
    >
      {showFallback && (
        <div className="absolute inset-0 flex divide-x divide-line">
          {fallbackSides.map((side) => (
            <textarea
              key={side}
              value={side === 'a' ? a : b}
              onChange={(event) => onChange?.(side, event.target.value)}
              readOnly={readOnly}
              aria-label={labels[side]}
              placeholder={placeholders[side]}
              spellCheck={false}
              autoCapitalize="off"
              autoComplete="off"
              wrap={wrap ? 'soft' : 'off'}
              className="min-w-0 flex-1 resize-none bg-transparent px-3 py-1.5 font-mono text-[13px] leading-[1.6] text-fg outline-none placeholder:text-fg-subtle"
            />
          ))}
        </div>
      )}
      <div ref={hostRef} className={cn('h-full', !ready && 'invisible')} />
    </div>
  );
}
