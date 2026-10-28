'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Ban, CircleAlert, Eraser, LoaderCircle, Square, TextWrap } from 'lucide-react';
import type { OutputEntry, RunOutcome, SourceError } from '@/lib/tools/playground/types';
import { formatBytes, utf8Length } from '@/lib/tools/bytes';
import {
  CodeEditor,
  type CodeEditorHandle,
  type CursorInfo,
  type EditorDiagnostic,
} from '@/components/tools/workbench/code-editor';
import {
  CopyButton,
  FileOpenButton,
  IconAction,
  RunButton,
  Segmented,
  ToolHeader,
  ToolbarDivider,
} from '@/components/tools/workbench/toolbar';
import { SplitPane } from '@/components/tools/workbench/split-pane';
import { DropZone } from '@/components/tools/workbench/drop-zone';
import { useFileLoader } from '@/components/tools/workbench/file';
import {
  CursorStatus,
  StaleStatus,
  StatusBar,
  StatusItem,
} from '@/components/tools/workbench/status-bar';
import { usePersistentState } from '@/components/tools/workbench/use-persistent-state';
import { STALE_OUTPUT_CLASS, useRunInput } from '@/components/tools/workbench/use-run';
import { useToolCommon, useToolMessages } from '@/i18n/tools/provider';
import { useLocale } from '@/i18n/use-locale';
import { fmt } from '@/i18n/dictionary';
import { ConsolePanel, outputText } from './console-panel';
import { LANGUAGES, LANGUAGE_IDS, RUNTIMES, isLanguageId, type LanguageId } from './languages';
import { MAX_OUTPUT_ENTRIES, RUN_TIMEOUT_MS } from './run-javascript';

/** One run and what it has produced so far. */
type Run = {
  language: LanguageId;
  /** The code as it was run, which error positions refer to. */
  code: string;
  entries: OutputEntry[];
  /** Null while the code is running. */
  outcome: RunOutcome | null;
  /** Set when the runtime itself failed to load or start. */
  failure: boolean;
};

/** The editor range for a 1-based line and column: from the column to the end of the line. */
function lineRange(code: string, line: number, column = 1): { from: number; to: number } | null {
  const lines = code.split('\n');
  if (line < 1 || line > lines.length) return null;
  const start = lines.slice(0, line - 1).reduce((offset, text) => offset + text.length + 1, 0);
  const end = start + lines[line - 1].length;
  const from = Math.min(start + Math.max(column - 1, 0), end);
  return { from: from === end ? start : from, to: end };
}

const NO_ERRORS: SourceError[] = [];

const inputKey = (language: LanguageId) => `playground:input:${language}`;

/** Runs JavaScript or TypeScript in an isolated worker and shows its console output. */
export function PlaygroundTool() {
  const common = useToolCommon();
  const t = useToolMessages<'playground'>();
  const locale = useLocale();
  const editorRef = useRef<CodeEditorHandle>(null);
  const [language, setLanguage] = usePersistentState<LanguageId>(
    'playground:language',
    'javascript',
    isLanguageId
  );
  const info = LANGUAGES[language];
  // Each language keeps its own code, starting from a sample.
  const [input, setInput] = usePersistentState(inputKey(language), info.sample);
  const [wrap, setWrap] = usePersistentState('playground:wrap', false);
  const [cursor, setCursor] = useState<CursorInfo | null>(null);
  const [result, setResult] = useState<Run | null>(null);
  const controllerRef = useRef<AbortController | null>(null);
  // Only tracks whether the code changed since the last run; running is always explicit.
  const { run: snapshot, ran, stale } = useRunInput(input, language);
  // Opening a file replaces the code but never runs it.
  const file = useFileLoader('text', setInput);

  useEffect(() => () => controllerRef.current?.abort(), []);

  const execute = async () => {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    const code = input;
    // Later updates from a run that has been replaced are dropped.
    const update = (change: (run: Run) => Run) =>
      setResult((run) => (run && controllerRef.current === controller ? change(run) : run));

    snapshot(code);
    setResult({ language, code, entries: [], outcome: null, failure: false });
    try {
      const runtime = await RUNTIMES[info.runtime]();
      const outcome = await runtime(code, {
        fileName: info.fileName,
        signal: controller.signal,
        onOutput: (entries) => update((run) => ({ ...run, entries: [...run.entries, ...entries] })),
        onClear: () => update((run) => ({ ...run, entries: [] })),
      });
      update((run) => ({ ...run, outcome }));
    } catch (error) {
      console.error('Running the code failed:', error);
      update((run) => ({ ...run, failure: true }));
    }
  };
  const stop = () => controllerRef.current?.abort();
  const switchLanguage = (next: LanguageId) => {
    stop();
    setLanguage(next);
  };

  const shown = ran && result?.language === language ? result : null;
  const outcome = shown?.outcome ?? null;
  const running = shown !== null && outcome === null && !shown.failure;
  const errors = outcome?.errors ?? NO_ERRORS;
  const firstError = errors.find((error) => error.line !== undefined);

  const diagnostics = useMemo((): EditorDiagnostic[] => {
    if (!shown) return [];
    return errors.flatMap((error) => {
      const range =
        error.line === undefined ? null : lineRange(shown.code, error.line, error.column);
      return range ? [{ ...range, message: error.message, severity: 'error' as const }] : [];
    });
  }, [shown, errors]);

  const revealError = () => {
    if (!shown || !firstError?.line) return;
    const range = lineRange(shown.code, firstError.line, firstError.column);
    if (range) editorRef.current?.reveal(range.from, range.to);
  };

  const duration = (ms: number) =>
    ms < 1000
      ? new Intl.NumberFormat(locale, {
          style: 'unit',
          unit: 'millisecond',
          maximumFractionDigits: 0,
        }).format(ms)
      : new Intl.NumberFormat(locale, {
          style: 'unit',
          unit: 'second',
          maximumFractionDigits: 1,
        }).format(ms / 1000);
  const numbers = new Intl.NumberFormat(locale);

  let footer: React.ReactNode = fmt(t.sandboxHint, { limit: duration(RUN_TIMEOUT_MS) });
  if (shown?.failure) footer = <span className="text-danger">{t.runFailed}</span>;
  else if (running) footer = t.running;
  else if (outcome?.status === 'invalid') {
    footer = <span className="text-danger">{t.invalid}</span>;
  } else if (outcome?.status === 'rejected') {
    footer = (
      <span className="text-danger">
        {fmt(t.rejected, { count: numbers.format(errors.length) })}
      </span>
    );
  } else if (outcome) {
    const lines = [
      outcome.status === 'timeout'
        ? fmt(t.timedOut, { time: duration(outcome.durationMs) })
        : outcome.status === 'stopped'
          ? fmt(t.stopped, { time: duration(outcome.durationMs) })
          : shown?.entries.length
            ? fmt(t.finished, { time: duration(outcome.durationMs) })
            : t.noOutput,
    ];
    if (outcome.truncated) {
      lines.push(fmt(t.truncated, { count: numbers.format(MAX_OUTPUT_ENTRIES) }));
    }
    footer = lines.join(' ');
  }

  // The run never started: show the load or compile error itself.
  const invalidError =
    outcome?.status === 'invalid' || outcome?.status === 'rejected' ? errors[0] : undefined;

  const editorPane = (
    <DropZone onFile={(picked) => void file.load(picked)}>
      <CodeEditor
        ref={editorRef}
        value={input}
        onChange={setInput}
        label={t.editor}
        language={info.editor}
        wrap={wrap}
        placeholder={fmt(t.inputPlaceholder, { language: t.languages[language] })}
        diagnostics={diagnostics}
        onCursor={setCursor}
        autoFocus
      />
    </DropZone>
  );

  const outputPane = (
    <ConsolePanel
      entries={shown?.entries ?? []}
      label={t.outputLabel}
      footer={footer}
      className={stale ? STALE_OUTPUT_CLASS : undefined}
    />
  );

  return (
    <>
      <ToolHeader
        slug="playground"
        actions={
          <>
            <FileOpenButton onFile={(picked) => void file.load(picked)} accept={info.accept} />
            <IconAction
              icon={Eraser}
              label={common.clear}
              onClick={() => setInput('')}
              disabled={!input}
            />
            <ToolbarDivider />
            <IconAction
              icon={TextWrap}
              label={common.wrap}
              pressed={wrap}
              onClick={() => setWrap(!wrap)}
            />
            <ToolbarDivider />
            <IconAction
              icon={Ban}
              label={t.clearOutput}
              onClick={() => setResult((run) => (run ? { ...run, entries: [] } : run))}
              disabled={!shown?.entries.length}
            />
            <CopyButton
              getText={() => outputText(shown?.entries ?? [])}
              label={t.copyOutput}
              disabled={!shown?.entries.length}
            />
            <IconAction icon={Square} label={t.stop} onClick={stop} disabled={!running} />
            <RunButton label={t.run} onRun={() => void execute()} pending={stale} />
          </>
        }
      >
        <Segmented
          label={t.language}
          value={language}
          onChange={switchLanguage}
          options={LANGUAGE_IDS.map((id) => ({ value: id, label: t.languages[id] }))}
        />
      </ToolHeader>
      <SplitPane id="playground" first={editorPane} second={outputPane} />
      <StatusBar>
        {stale && <StaleStatus action={t.run} onRun={() => void execute()} />}
        {running && (
          <StatusItem className="shrink-0 font-sans">
            <LoaderCircle className="size-3 shrink-0 animate-spin" aria-hidden />
            {t.running}
          </StatusItem>
        )}
        {invalidError && (
          <StatusItem tone="danger" onClick={revealError} title={invalidError.message}>
            <CircleAlert className="size-3 shrink-0" aria-hidden />
            <span className="shrink-0">
              {invalidError.line !== undefined
                ? fmt(common.errorAt, { line: invalidError.line, col: invalidError.column ?? 1 })
                : outcome?.status === 'rejected'
                  ? t.compileError
                  : t.syntaxError}
            </span>
            <span className="truncate font-sans">— {invalidError.message}</span>
          </StatusItem>
        )}
        {!invalidError && errors.length > 0 && (
          <StatusItem tone="danger" onClick={firstError ? revealError : undefined}>
            <CircleAlert className="size-3 shrink-0" aria-hidden />
            <span className="font-sans">
              {fmt(t.uncaught, { count: numbers.format(errors.length) })}
            </span>
          </StatusItem>
        )}
        {file.error && (
          <StatusItem tone="danger" title={file.error}>
            <span className="truncate font-sans">{file.error}</span>
          </StatusItem>
        )}
        <span className="hidden sm:contents">
          <CursorStatus cursor={cursor} />
        </span>
        <StatusItem className="shrink-0">{formatBytes(utf8Length(input), locale)}</StatusItem>
      </StatusBar>
    </>
  );
}
