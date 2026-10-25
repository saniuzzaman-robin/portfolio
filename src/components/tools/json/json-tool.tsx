'use client';

import { useId, useMemo, useRef, useState } from 'react';
import { ArrowLeftToLine, Download, Eraser, TextWrap, WandSparkles } from 'lucide-react';
import { parseJson, positionAt, type JsonIssue } from '@/lib/tools/json/parse';
import {
  escapeJsonString,
  stringifyJson,
  unescapeJsonString,
  type JsonIndent,
} from '@/lib/tools/json/format';
import { compilePath, queryPath } from '@/lib/tools/json/path';
import { jsonStats } from '@/lib/tools/json/tree';
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
import { OptionsPopover, SelectField, Toggle } from '@/components/tools/workbench/options-popover';
import { SplitPane } from '@/components/tools/workbench/split-pane';
import { DropZone } from '@/components/tools/workbench/drop-zone';
import { downloadFile, useFileLoader } from '@/components/tools/workbench/file';
import {
  CursorStatus,
  StaleStatus,
  StatusBar,
  StatusItem,
  ValidityStatus,
} from '@/components/tools/workbench/status-bar';
import { usePersistentState } from '@/components/tools/workbench/use-persistent-state';
import {
  RUN_SHORTCUT,
  STALE_OUTPUT_CLASS,
  useRunInput,
} from '@/components/tools/workbench/use-run';
import { useToolCommon, useToolMessages } from '@/i18n/tools/provider';
import { useLocale } from '@/i18n/use-locale';
import { fmt } from '@/i18n/dictionary';
import { cn } from '@/lib/cn';
import { JsonTree } from './json-tree';

const MODES = ['format', 'minify', 'tree', 'query', 'escape', 'unescape'] as const;
type Mode = (typeof MODES)[number];
const isMode = (value: unknown): value is Mode => MODES.includes(value as Mode);

const INDENTS = { '2': 2, '4': 4, tab: 'tab' } as const satisfies Record<string, JsonIndent>;
type IndentOption = keyof typeof INDENTS;

type Options = { indent: IndentOption; sortKeys: boolean; lenient: boolean };
const DEFAULT_OPTIONS: Options = { indent: '2', sortKeys: false, lenient: true };
const isOptions = (value: unknown): value is Options => {
  const options = value as Options | null;
  return (
    typeof options === 'object' &&
    options !== null &&
    options.indent in INDENTS &&
    typeof options.sortKeys === 'boolean' &&
    typeof options.lenient === 'boolean'
  );
};

const DOWNLOAD_NAMES: Record<Mode, string> = {
  format: 'formatted.json',
  minify: 'minified.json',
  tree: 'formatted.json',
  query: 'query-results.json',
  escape: 'escaped.txt',
  unescape: 'unescaped.txt',
};

// Shows off what the tool keeps that JSON.parse wouldn't: the big integer and `1.10`.
const SAMPLE = `{
  "name": "portfolio",
  "version": "2.4.0",
  "private": true,
  "id": 9007199254740993,
  "price": 1.10,
  "tags": ["nextjs", "react", "i18n"],
  "owner": { "name": "Ada", "active": true, "manager": null }
}
`;

type Output = { text: string; error: JsonIssue | null };
const EMPTY: Output = { text: '', error: null };

export function JsonTool() {
  const common = useToolCommon();
  const t = useToolMessages<'json'>();
  const locale = useLocale();
  const queryHintId = useId();
  const inputRef = useRef<CodeEditorHandle>(null);
  const [input, setInput] = usePersistentState('json:input', SAMPLE);
  const [mode, setMode] = usePersistentState<Mode>('json:mode', 'format', isMode);
  const [options, setOptions] = usePersistentState('json:options', DEFAULT_OPTIONS, isOptions);
  const [wrap, setWrap] = usePersistentState('json:wrap', false);
  const [query, setQuery] = usePersistentState('json:query', '$');
  const [cursor, setCursor] = useState<CursorInfo | null>(null);
  const { value: live, run, ran, stale } = useRunInput(input);
  const file = useFileLoader('text', (content) => {
    setInput(content);
    run(content);
  });
  // Opening a file or reusing the result is explicit, so the new input runs right away.
  const replaceInput = (next: string) => {
    setInput(next);
    run(next);
  };

  const textMode = mode === 'escape' || mode === 'unescape';
  const hasInput = live.trim() !== '';
  const indent = INDENTS[options.indent];

  const parsed = useMemo(
    () => (!textMode && hasInput ? parseJson(live, { lenient: options.lenient }) : null),
    [textMode, hasInput, live, options.lenient]
  );

  // Repair is offered when strict parsing fails but the lenient parser understands the input.
  const repairable = useMemo(
    () =>
      parsed !== null && !parsed.ok && !options.lenient && parseJson(live, { lenient: true }).ok,
    [parsed, options.lenient, live]
  );

  const compiledQuery = useMemo(
    () => (mode === 'query' && query.trim() ? compilePath(query) : null),
    [mode, query]
  );

  const queryResult = useMemo(
    () =>
      parsed?.ok && compiledQuery?.ok ? queryPath(parsed.value, compiledQuery.segments) : null,
    [parsed, compiledQuery]
  );

  const output = useMemo((): Output => {
    if (mode === 'escape') return live ? { text: escapeJsonString(live), error: null } : EMPTY;
    if (mode === 'unescape') {
      if (!live) return EMPTY;
      const result = unescapeJsonString(live);
      return result.ok ? { text: result.value, error: null } : { text: '', error: result.error };
    }
    if (!parsed) return EMPTY;
    if (!parsed.ok) return { text: '', error: parsed.error };
    if (mode === 'query') {
      if (!queryResult) return EMPTY;
      const items = queryResult.matches.map((match) => match.node);
      const array = { type: 'array' as const, items, from: 0, to: 0 };
      return { text: stringifyJson(array, { indent, sortKeys: options.sortKeys }), error: null };
    }
    return {
      text: stringifyJson(parsed.value, {
        indent: mode === 'minify' ? undefined : indent,
        sortKeys: options.sortKeys,
      }),
      error: null,
    };
  }, [mode, live, parsed, queryResult, indent, options.sortKeys]);

  const stats = useMemo(() => (parsed?.ok ? jsonStats(parsed.value) : null), [parsed]);

  const warnings = parsed?.warnings ?? [];
  const diagnostics = useMemo((): EditorDiagnostic[] => {
    const list: EditorDiagnostic[] = (parsed?.warnings ?? []).map((warning) => ({
      ...warning,
      severity: 'warning',
    }));
    if (output.error) list.push({ ...output.error, severity: 'error' });
    return list;
  }, [parsed, output.error]);

  const errorStatus = output.error && {
    message: output.error.message,
    ...positionAt(live, output.error.from),
  };

  const reveal = (from: number, to: number) => inputRef.current?.reveal(from, to);

  const repair = () => {
    const result = parseJson(input, { lenient: true });
    if (result.ok) replaceInput(stringifyJson(result.value, { indent }));
  };

  const numbers = new Intl.NumberFormat(locale);
  const size = (text: string) => formatBytes(utf8Length(text), locale);
  const showValidity = hasInput && mode !== 'escape';

  const placeholder =
    mode === 'escape'
      ? t.escapePlaceholder
      : mode === 'unescape'
        ? t.unescapePlaceholder
        : t.inputPlaceholder;
  const runLabel = mode === 'tree' || mode === 'query' ? common.run : t[mode];
  const runHint = fmt(common.runHint, { action: runLabel, shortcut: RUN_SHORTCUT });
  const outputPlaceholder = !ran
    ? runHint
    : output.error
      ? t.invalidPlaceholder
      : mode === 'query'
        ? t.queryHint
        : t.outputPlaceholder;

  const inputPane = (
    <DropZone onFile={(picked) => void file.load(picked)}>
      <CodeEditor
        ref={inputRef}
        value={input}
        onChange={setInput}
        label={common.input}
        language={textMode ? 'plain' : 'json'}
        wrap={wrap}
        placeholder={placeholder}
        diagnostics={diagnostics}
        onCursor={setCursor}
        autoFocus
      />
    </DropZone>
  );

  const outputEditor = (
    <CodeEditor
      value={output.text}
      label={common.output}
      language={mode === 'unescape' ? 'plain' : 'json'}
      readOnly
      wrap={wrap}
      placeholder={outputPlaceholder}
      className={cn(stale && STALE_OUTPUT_CLASS)}
    />
  );

  let outputPane: React.ReactNode = outputEditor;
  if (mode === 'tree') {
    outputPane = parsed?.ok ? (
      <JsonTree
        className={cn(stale && STALE_OUTPUT_CLASS)}
        root={parsed.value}
        onReveal={reveal}
        onQuery={(path) => {
          setQuery(path);
          setMode('query');
        }}
      />
    ) : (
      <p className="m-auto max-w-xs p-6 text-center text-xs text-fg-subtle">
        {!ran ? runHint : output.error ? t.invalidPlaceholder : t.outputPlaceholder}
      </p>
    );
  } else if (mode === 'query') {
    const queryError = compiledQuery && !compiledQuery.ok ? compiledQuery.error : null;
    outputPane = (
      <>
        <label className="flex h-8 shrink-0 items-center gap-2 border-b border-line px-2.5">
          <span className="shrink-0 text-xs font-medium text-fg-muted">{t.query}</span>
          <input
            dir="ltr"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            aria-label={t.queryLabel}
            aria-invalid={queryError !== null}
            aria-describedby={queryHintId}
            placeholder="$.store.book[*].author"
            spellCheck={false}
            autoCapitalize="off"
            autoComplete="off"
            className="min-w-0 flex-1 bg-transparent font-mono text-xs text-fg outline-none placeholder:text-fg-subtle aria-invalid:text-danger"
          />
        </label>
        <p
          id={queryHintId}
          className={
            queryError ? 'border-b border-line px-2.5 py-1 text-xs text-danger' : 'sr-only'
          }
        >
          {queryError
            ? fmt(t.queryError, { col: queryError.offset + 1, message: queryError.message })
            : t.queryHint}
        </p>
        {outputEditor}
      </>
    );
  }

  return (
    <>
      <ToolHeader
        slug="json"
        actions={
          <>
            <FileOpenButton
              onFile={(picked) => void file.load(picked)}
              accept=".json,.jsonc,application/json,text/plain"
            />
            <IconAction
              icon={Eraser}
              label={common.clear}
              onClick={() => replaceInput('')}
              disabled={!input}
            />
            <ToolbarDivider />
            <IconAction
              icon={TextWrap}
              label={common.wrap}
              pressed={wrap}
              onClick={() => setWrap(!wrap)}
            />
            <OptionsPopover>
              <SelectField
                label={t.indent}
                value={options.indent}
                onChange={(value) => setOptions({ ...options, indent: value })}
                options={[
                  { value: '2', label: fmt(t.spaces, { count: numbers.format(2) }) },
                  { value: '4', label: fmt(t.spaces, { count: numbers.format(4) }) },
                  { value: 'tab', label: t.tab },
                ]}
              />
              <Toggle
                label={t.sortKeys}
                hint={t.sortKeysHint}
                checked={options.sortKeys}
                onChange={(sortKeys) => setOptions({ ...options, sortKeys })}
              />
              <Toggle
                label={t.lenient}
                hint={t.lenientHint}
                checked={options.lenient}
                onChange={(lenient) => setOptions({ ...options, lenient })}
              />
            </OptionsPopover>
            <ToolbarDivider />
            <IconAction
              icon={ArrowLeftToLine}
              label={t.useOutput}
              onClick={() => replaceInput(output.text)}
              disabled={!output.text}
              className="rtl:-scale-x-100"
            />
            <CopyButton getText={() => output.text} disabled={!output.text} />
            <IconAction
              icon={Download}
              label={common.download}
              disabled={!output.text}
              onClick={() =>
                downloadFile(
                  output.text,
                  DOWNLOAD_NAMES[mode],
                  textMode ? undefined : 'application/json;charset=utf-8'
                )
              }
            />
            <RunButton label={runLabel} onRun={() => run()} />
          </>
        }
      >
        <Segmented
          label={t.view}
          value={mode}
          onChange={setMode}
          options={MODES.map((value) => ({ value, label: t[value] }))}
        />
        <ToolbarDivider />
        <IconAction icon={WandSparkles} label={t.repair} onClick={repair} disabled={!repairable} />
      </ToolHeader>
      <SplitPane id="json" first={inputPane} second={outputPane} />
      <StatusBar>
        {showValidity && (
          <ValidityStatus
            error={errorStatus}
            onReveal={output.error ? () => reveal(output.error!.from, output.error!.to) : undefined}
          />
        )}
        {stale && <StaleStatus action={runLabel} onRun={() => run()} />}
        {file.error && <StatusItem tone="danger">{file.error}</StatusItem>}
        {warnings.length > 0 && (
          <StatusItem
            tone="warning"
            onClick={() => reveal(warnings[0].from, warnings[0].to)}
            title={warnings[0].message}
            className="shrink-0"
          >
            {fmt(t.duplicates, { count: numbers.format(warnings.length) })}
          </StatusItem>
        )}
        {stats && (
          <StatusItem className="shrink-0 max-sm:hidden">
            {fmt(t.stats, { keys: numbers.format(stats.keys), depth: numbers.format(stats.depth) })}
          </StatusItem>
        )}
        {mode === 'query' && queryResult && (
          <StatusItem className="shrink-0">
            {fmt(queryResult.truncated ? t.resultsTruncated : t.results, {
              count: numbers.format(queryResult.matches.length),
            })}
          </StatusItem>
        )}
        {hasInput && (
          <StatusItem className="shrink-0">
            {output.text && mode !== 'tree' && mode !== 'query'
              ? fmt(t.sizeChange, { from: size(live), to: size(output.text) })
              : size(live)}
          </StatusItem>
        )}
        <div className="hidden sm:contents">
          <CursorStatus cursor={cursor} />
        </div>
      </StatusBar>
    </>
  );
}
