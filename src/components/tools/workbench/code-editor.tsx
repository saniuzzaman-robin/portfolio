'use client';

import { useEffect, useImperativeHandle, useRef, useState } from 'react';
import type { CursorInfo, EditorController, EditorMark } from './editor-setup';
import { loadLanguage, type EditorLanguage } from './editor-languages';
import { cn } from '@/lib/cn';

export type { CursorInfo, EditorMark };

export type EditorDiagnostic = {
  from: number;
  to: number;
  message: string;
  severity: 'error' | 'warning' | 'info';
};

export type CodeEditorHandle = {
  focus(): void;
  /** Selects `from..to` and scrolls it into view (e.g. "jump to error"). */
  reveal(from: number, to?: number): void;
  /** Scrolls the 0-based, fractional source `line` to the top (for synced scrolling). */
  scrollToLine(line: number): void;
};

type CodeEditorProps = {
  value: string;
  onChange?: (value: string) => void;
  /** Accessible name of the editing surface. */
  label: string;
  language?: EditorLanguage;
  readOnly?: boolean;
  wrap?: boolean;
  placeholder?: string;
  diagnostics?: EditorDiagnostic[];
  /** Highlighted ranges; style them with `cm-mark-*` classes from `editor-theme.ts`. */
  marks?: EditorMark[];
  onCursor?: (cursor: CursorInfo) => void;
  /** The 0-based, fractional source line at the top of the viewport, whenever it scrolls. */
  onScrollLine?: (line: number) => void;
  autoFocus?: boolean;
  className?: string;
  ref?: React.Ref<CodeEditorHandle>;
};

const NO_DIAGNOSTICS: EditorDiagnostic[] = [];
const NO_MARKS: EditorMark[] = [];

/**
 * CodeMirror editor that fills its container. Until the editor chunk loads (or if it fails to),
 * a plain textarea with the same value stands in, so the tool is usable from first paint.
 * Code is always laid out left-to-right, including on RTL pages.
 */
export function CodeEditor({
  value,
  onChange,
  label,
  language = 'plain',
  readOnly = false,
  wrap = false,
  placeholder = '',
  diagnostics = NO_DIAGNOSTICS,
  marks = NO_MARKS,
  onCursor,
  onScrollLine,
  autoFocus = false,
  className,
  ref,
}: CodeEditorProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const fallbackRef = useRef<HTMLTextAreaElement>(null);
  const controllerRef = useRef<EditorController | null>(null);
  const [ready, setReady] = useState(false);

  // Latest props for the async editor creation and its callbacks, without re-creating it.
  const latest = useRef({
    value,
    onChange,
    onCursor,
    onScrollLine,
    readOnly,
    wrap,
    placeholder,
    label,
    autoFocus,
  });
  useEffect(() => {
    latest.current = {
      value,
      onChange,
      onCursor,
      onScrollLine,
      readOnly,
      wrap,
      placeholder,
      label,
      autoFocus,
    };
  });

  useEffect(() => {
    let cancelled = false;
    import('./editor-setup')
      .then(({ createEditor }) => {
        const host = hostRef.current;
        if (cancelled || !host) return;
        const fallback = fallbackRef.current;
        const hadFocus = fallback !== null && document.activeElement === fallback;
        const props = latest.current;
        controllerRef.current = createEditor(host, {
          value: props.value,
          readOnly: props.readOnly,
          wrap: props.wrap,
          placeholder: props.placeholder,
          label: props.label,
          selection:
            hadFocus && fallback
              ? { anchor: fallback.selectionStart, head: fallback.selectionEnd }
              : undefined,
          autoFocus: hadFocus || props.autoFocus,
          onChange: (next) => latest.current.onChange?.(next),
          onCursor: (cursor) => latest.current.onCursor?.(cursor),
          onScrollLine: (line) => latest.current.onScrollLine?.(line),
        });
        setReady(true);
      })
      .catch((error: unknown) => {
        // The textarea fallback stays in place, so the tool keeps working without highlighting.
        console.error('Code editor failed to load; using a plain text area instead.', error);
      });
    return () => {
      cancelled = true;
      controllerRef.current?.destroy();
      controllerRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (ready) controllerRef.current?.setValue(value);
  }, [ready, value]);

  useEffect(() => {
    if (ready) controllerRef.current?.setReadOnly(readOnly);
  }, [ready, readOnly]);

  useEffect(() => {
    if (ready) controllerRef.current?.setWrap(wrap);
  }, [ready, wrap]);

  useEffect(() => {
    if (ready) controllerRef.current?.setPlaceholder(placeholder);
  }, [ready, placeholder]);

  useEffect(() => {
    if (ready) controllerRef.current?.setDiagnostics(diagnostics);
  }, [ready, diagnostics]);

  useEffect(() => {
    if (ready) controllerRef.current?.setMarks(marks);
  }, [ready, marks]);

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
    () => ({
      focus: () =>
        controllerRef.current ? controllerRef.current.focus() : fallbackRef.current?.focus(),
      reveal: (from, to) => {
        if (controllerRef.current) return controllerRef.current.reveal(from, to);
        const fallback = fallbackRef.current;
        if (!fallback) return;
        fallback.focus();
        fallback.setSelectionRange(from, to ?? from);
      },
      scrollToLine: (line) => controllerRef.current?.scrollToLine(line),
    }),
    []
  );

  return (
    <div dir="ltr" className={cn('relative min-h-0 min-w-0 flex-1 overflow-hidden', className)}>
      {!ready && (
        <textarea
          ref={fallbackRef}
          value={value}
          onChange={(event) => onChange?.(event.target.value)}
          readOnly={readOnly}
          aria-label={label}
          placeholder={placeholder}
          spellCheck={false}
          autoCapitalize="off"
          autoComplete="off"
          wrap={wrap ? 'soft' : 'off'}
          className="absolute inset-0 resize-none bg-transparent py-1.5 ps-12 pe-3 font-mono text-[13px] leading-[1.6] text-fg outline-none placeholder:text-fg-subtle"
        />
      )}
      <div ref={hostRef} className={cn('h-full', !ready && 'invisible')} />
    </div>
  );
}
