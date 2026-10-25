'use client';

import { useMemo, useRef, useState } from 'react';
import { ArrowLeftToLine, CircleAlert, Eraser, TextWrap } from 'lucide-react';
import { compileRegex, isFlags, toggleFlag, type RegexFlag } from '@/lib/tools/regex/flags';
import { explainRegex } from '@/lib/tools/regex/explain';
import type { RegexMode, RegexRequest } from '@/lib/tools/regex/run';
import {
  CodeEditor,
  type CodeEditorHandle,
  type CursorInfo,
  type EditorMark,
} from '@/components/tools/workbench/code-editor';
import {
  CopyButton,
  FileOpenButton,
  IconAction,
  Segmented,
  ToolHeader,
  ToolbarDivider,
} from '@/components/tools/workbench/toolbar';
import { SplitPane } from '@/components/tools/workbench/split-pane';
import { DropZone } from '@/components/tools/workbench/drop-zone';
import { useFileLoader } from '@/components/tools/workbench/file';
import { CursorStatus, StatusBar, StatusItem } from '@/components/tools/workbench/status-bar';
import { usePersistentState } from '@/components/tools/workbench/use-persistent-state';
import { useLiveInput } from '@/components/tools/workbench/use-live-input';
import { useAsyncResult } from '@/components/tools/workbench/use-async-result';
import { useToolCommon, useToolMessages } from '@/i18n/tools/provider';
import { useLocale } from '@/i18n/use-locale';
import { fmt } from '@/i18n/dictionary';
import { REGEX_TIMEOUT_MS, runRegexInWorker } from './run-regex';
import { PatternBar } from './pattern-bar';
import { MatchesPanel } from './matches-panel';
import { ExplainPanel } from './explain-panel';
import { ReferencePanel } from './reference-panel';
import { groupMarkClass, insertAtCaret } from './parts';

const MODES = ['match', 'replace', 'split'] as const satisfies RegexMode[];
const isMode = (value: unknown): value is RegexMode => MODES.includes(value as RegexMode);

const PANELS = ['result', 'explain', 'reference'] as const;
type Panel = (typeof PANELS)[number];
const isPanel = (value: unknown): value is Panel => PANELS.includes(value as Panel);

/** Most matches collected per run (all are highlighted; the table shows fewer). */
const MATCH_LIMIT = 10_000;

const SAMPLE_PATTERN = '(?<year>\\d{4})-(?<month>\\d{2})-(?<day>\\d{2})';
const SAMPLE_TEXT = `Release 2.4 shipped on 2026-03-14, the hotfix on 2026-03-17.
Next review: 2026-04-01 (moved from 2026-3-28).`;

export function RegexTool() {
  const common = useToolCommon();
  const t = useToolMessages<'regex'>();
  const locale = useLocale();
  const [pattern, setPattern] = usePersistentState('regex:pattern', SAMPLE_PATTERN);
  const [flags, setFlags] = usePersistentState('regex:flags', 'g', isFlags);
  const [text, setText] = usePersistentState('regex:text', SAMPLE_TEXT);
  const [replacement, setReplacement] = usePersistentState(
    'regex:replacement',
    '$<day>.$<month>.$<year>'
  );
  const [mode, setMode] = usePersistentState<RegexMode>('regex:mode', 'match', isMode);
  const [panel, setPanel] = usePersistentState<Panel>('regex:panel', 'result', isPanel);
  const [wrap, setWrap] = usePersistentState('regex:wrap', true);
  const [cursor, setCursor] = useState<CursorInfo | null>(null);
  const textRef = useRef<CodeEditorHandle>(null);
  const patternRef = useRef<HTMLInputElement>(null);
  const replacementRef = useRef<HTMLInputElement>(null);
  const { value: live } = useLiveInput(text);
  const file = useFileLoader('text', (content) => setText(content));

  const compiled = useMemo(() => (pattern ? compileRegex(pattern, flags) : null), [pattern, flags]);
  const explanation = useMemo(() => explainRegex(pattern, flags), [pattern, flags]);

  const task = useMemo(() => {
    if (!compiled?.ok) return null;
    const request: RegexRequest = {
      pattern,
      flags,
      text: live,
      mode,
      replacement,
      limit: MATCH_LIMIT,
    };
    return (signal: AbortSignal) => runRegexInWorker(request, signal);
  }, [compiled, pattern, flags, live, mode, replacement]);
  const { value: current, latest, pending, error: workerError } = useAsyncResult(task);
  // While a new run is in flight, keep showing the previous result instead of flickering.
  const outcome = task ? (current ?? latest) : undefined;
  const timedOut = outcome?.kind === 'timeout';
  const result = outcome?.kind === 'done' && outcome.result.ok ? outcome.result : null;
  const runError = outcome?.kind === 'done' && !outcome.result.ok ? outcome.result.error : null;

  const marks = useMemo((): EditorMark[] => {
    if (!result) return [];
    const list: EditorMark[] = [];
    result.matches.forEach((match, index) => {
      const className = index % 2 ? 'cm-mark-match-alt' : 'cm-mark-match';
      list.push({ from: match.start, to: match.end, className });
      match.groups.forEach((span, group) => {
        if (span && span[1] > span[0]) {
          list.push({ from: span[0], to: span[1], className: groupMarkClass(group + 1) });
        }
      });
    });
    return list;
  }, [result]);

  const splitText = useMemo(
    () => (result?.pieces ? JSON.stringify(result.pieces, null, 2) : ''),
    [result]
  );
  const output = mode === 'replace' ? (result?.output ?? '') : mode === 'split' ? splitText : '';

  const copyText = () =>
    mode === 'match'
      ? (result?.matches ?? []).map((match) => live.slice(match.start, match.end)).join('\n')
      : output;

  const selectInPattern = (from: number, to: number) => {
    patternRef.current?.focus();
    patternRef.current?.setSelectionRange(from, to);
  };

  const insert = (token: string, target: 'pattern' | 'replacement') => {
    if (target === 'pattern') return insertAtCaret(patternRef.current, pattern, token, setPattern);
    setMode('replace');
    insertAtCaret(replacementRef.current, replacement, token, setReplacement);
  };

  const numbers = new Intl.NumberFormat(locale);
  const milliseconds = new Intl.NumberFormat(locale, { maximumFractionDigits: 1 });
  const placeholder = !pattern
    ? t.emptyPlaceholder
    : compiled && !compiled.ok
      ? t.invalidPlaceholder
      : timedOut
        ? t.timedOutPlaceholder
        : t.outputPlaceholder;

  const textPane = (
    <DropZone onFile={(picked) => void file.load(picked)}>
      <CodeEditor
        ref={textRef}
        value={text}
        onChange={setText}
        label={t.text}
        wrap={wrap}
        placeholder={t.textPlaceholder}
        marks={marks}
        onCursor={setCursor}
      />
    </DropZone>
  );

  const resultPanel =
    mode === 'match' ? (
      result ? (
        <MatchesPanel
          text={live}
          matches={result.matches}
          groups={explanation.groups}
          onReveal={(from, to) => textRef.current?.reveal(from, to)}
        />
      ) : (
        <p className="p-3 text-xs text-fg-subtle">{placeholder}</p>
      )
    ) : (
      <CodeEditor
        value={output}
        label={common.output}
        language={mode === 'split' ? 'json' : 'plain'}
        readOnly
        wrap={wrap}
        placeholder={placeholder}
      />
    );

  const sidePane = (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      <div className="flex h-8 shrink-0 items-center border-b border-line bg-surface px-1">
        <Segmented
          label={t.panel}
          value={panel}
          onChange={setPanel}
          options={PANELS.map((value) => ({
            value,
            label:
              value === 'result'
                ? mode === 'match'
                  ? t.panels.matches
                  : t.panels.output
                : t.panels[value],
          }))}
        />
      </div>
      {panel === 'result' && resultPanel}
      {panel === 'explain' && (
        <ExplainPanel tokens={explanation.tokens} onSelect={selectInPattern} />
      )}
      {panel === 'reference' && (
        <ReferencePanel
          flags={flags}
          onToggleFlag={(flag: RegexFlag) => setFlags(toggleFlag(flags, flag))}
          onInsert={insert}
        />
      )}
    </div>
  );

  return (
    <>
      <ToolHeader
        slug="regex"
        actions={
          <>
            <FileOpenButton onFile={(picked) => void file.load(picked)} accept="text/*" />
            <IconAction
              icon={Eraser}
              label={t.clearText}
              onClick={() => setText('')}
              disabled={!text}
            />
            <ToolbarDivider />
            <IconAction
              icon={TextWrap}
              label={common.wrap}
              pressed={wrap}
              onClick={() => setWrap(!wrap)}
            />
            <ToolbarDivider />
            {mode === 'replace' && (
              <IconAction
                icon={ArrowLeftToLine}
                label={t.useOutput}
                onClick={() => setText(output)}
                disabled={!result}
                className="rtl:-scale-x-100"
              />
            )}
            <CopyButton
              getText={copyText}
              disabled={!result || (mode === 'match' && result.matches.length === 0)}
              label={mode === 'match' ? t.copyMatches : common.copy}
            />
          </>
        }
      >
        <Segmented
          label={t.mode}
          value={mode}
          onChange={setMode}
          options={MODES.map((value) => ({ value, label: t.modes[value] }))}
        />
      </ToolHeader>
      <PatternBar
        pattern={pattern}
        onPattern={setPattern}
        flags={flags}
        onFlags={setFlags}
        invalid={compiled?.ok === false}
        replacement={replacement}
        onReplacement={setReplacement}
        showReplacement={mode === 'replace'}
        patternRef={patternRef}
        replacementRef={replacementRef}
      />
      <SplitPane id="regex" first={textPane} second={sidePane} defaultRatio={0.55} />
      <StatusBar>
        {compiled && !compiled.ok && (
          <StatusItem
            tone="danger"
            title={compiled.error}
            onClick={() => patternRef.current?.focus()}
          >
            <CircleAlert className="size-3 shrink-0" aria-hidden />
            <span className="shrink-0">{t.invalid}</span>
            <span className="truncate font-sans">— {compiled.error}</span>
          </StatusItem>
        )}
        {timedOut && (
          <StatusItem tone="danger" title={t.timedOutHint}>
            <CircleAlert className="size-3 shrink-0" aria-hidden />
            {fmt(t.timedOut, { seconds: numbers.format(REGEX_TIMEOUT_MS / 1000) })}
          </StatusItem>
        )}
        {(runError ?? workerError) && (
          <StatusItem tone="danger" title={runError ?? workerError ?? undefined}>
            {runError ?? t.workerFailed}
          </StatusItem>
        )}
        {file.error && <StatusItem tone="danger">{file.error}</StatusItem>}
        {result && (
          <StatusItem tone={result.matches.length ? 'success' : 'muted'} className="shrink-0">
            {result.matches.length
              ? fmt(t.matchCount, { count: numbers.format(result.matches.length) })
              : t.noMatches}
          </StatusItem>
        )}
        {result?.truncated && (
          <StatusItem tone="warning" className="shrink-0">
            {fmt(t.matchesTruncated, { count: numbers.format(MATCH_LIMIT) })}
          </StatusItem>
        )}
        {result?.pieces && mode === 'split' && (
          <StatusItem className="shrink-0">
            {fmt(t.pieces, { count: numbers.format(result.pieces.length) })}
          </StatusItem>
        )}
        {compiled?.ok && explanation.groups.length > 0 && (
          <StatusItem className="shrink-0 max-sm:hidden">
            {fmt(t.groupCount, { count: numbers.format(explanation.groups.length) })}
          </StatusItem>
        )}
        {pending && <StatusItem className="shrink-0 max-sm:hidden">{t.working}</StatusItem>}
        {result && !pending && (
          <StatusItem className="shrink-0 max-sm:hidden">
            {fmt(t.elapsed, { ms: milliseconds.format(result.elapsedMs) })}
          </StatusItem>
        )}
        <div className="hidden sm:contents">
          <CursorStatus cursor={cursor} />
        </div>
      </StatusBar>
    </>
  );
}
