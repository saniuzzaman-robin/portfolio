'use client';

import { useMemo, useRef, useState } from 'react';
import { ArrowLeftToLine, Download, Eraser, TextWrap } from 'lucide-react';
import { runFormat, type FormatMode, type FormatOptions } from '@/lib/tools/format/format';
import {
  FORMAT_LANGUAGES,
  KEYWORD_CASES,
  LANGUAGES,
  SQL_DIALECTS,
  isFormatLanguage,
  isSqlDialect,
  languageForFile,
  type FormatLanguage,
  type KeywordCase,
  type SqlDialect,
} from '@/lib/tools/format/languages';
import type { JsonIndent } from '@/lib/tools/json/format';
import { positionAt } from '@/lib/tools/json/parse';
import { formatBytes, utf8Length } from '@/lib/tools/bytes';
import {
  CodeEditor,
  type CodeEditorHandle,
  type CursorInfo,
  type EditorDiagnostic,
} from '@/components/tools/workbench/code-editor';
import type { EditorLanguage } from '@/components/tools/workbench/editor-languages';
import {
  CopyButton,
  FileOpenButton,
  IconAction,
  RunButton,
  Segmented,
  ToolHeader,
  ToolbarDivider,
  ToolbarSelect,
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
import {
  usePersistentState,
  writePersistentState,
} from '@/components/tools/workbench/use-persistent-state';
import {
  RUN_SHORTCUT,
  STALE_OUTPUT_CLASS,
  useRunInput,
} from '@/components/tools/workbench/use-run';
import { useAsyncResult } from '@/components/tools/workbench/use-async-result';
import { useToolCommon, useToolMessages } from '@/i18n/tools/provider';
import { useLocale } from '@/i18n/use-locale';
import { fmt } from '@/i18n/dictionary';
import { cn } from '@/lib/cn';
import { SAMPLES } from './samples';

const MODES = ['beautify', 'minify'] as const satisfies FormatMode[];
const isMode = (value: unknown): value is FormatMode => MODES.includes(value as FormatMode);

const INDENTS = { '2': 2, '4': 4, tab: 'tab' } as const satisfies Record<string, JsonIndent>;
type IndentOption = keyof typeof INDENTS;
const PRINT_WIDTHS = ['80', '100', '120'] as const;
type PrintWidth = (typeof PRINT_WIDTHS)[number];

type Options = {
  indent: IndentOption;
  printWidth: PrintWidth;
  sqlDialect: SqlDialect;
  keywordCase: KeywordCase;
  mangle: boolean;
  minifyInline: boolean;
};
const DEFAULT_OPTIONS: Options = {
  indent: '2',
  printWidth: '80',
  sqlDialect: 'sql',
  keywordCase: 'preserve',
  mangle: true,
  minifyInline: true,
};
const isOptions = (value: unknown): value is Options => {
  const options = value as Options | null;
  return (
    typeof options === 'object' &&
    options !== null &&
    options.indent in INDENTS &&
    PRINT_WIDTHS.includes(options.printWidth) &&
    isSqlDialect(options.sqlDialect) &&
    KEYWORD_CASES.includes(options.keywordCase) &&
    typeof options.mangle === 'boolean' &&
    typeof options.minifyInline === 'boolean'
  );
};

/** Languages Prettier formats (the only ones with a line width). */
const PRETTIER = new Set<FormatLanguage>(
  FORMAT_LANGUAGES.filter((language) => !['json', 'xml', 'sql'].includes(language))
);

const EDITOR_LANGUAGES: Record<FormatLanguage, EditorLanguage> = {
  html: 'html',
  css: 'css',
  scss: 'css',
  less: 'css',
  javascript: 'javascript',
  typescript: 'typescript',
  json: 'json',
  xml: 'xml',
  sql: 'sql',
  yaml: 'yaml',
  markdown: 'markdown',
  graphql: 'plain',
};

const ACCEPT = FORMAT_LANGUAGES.flatMap((language) =>
  LANGUAGES[language].extensions.map((extension) => `.${extension}`)
)
  .concat('text/plain')
  .join(',');

const inputKey = (language: FormatLanguage) => `format:input:${language}`;

export function FormatTool() {
  const common = useToolCommon();
  const t = useToolMessages<'format'>();
  const locale = useLocale();
  const inputRef = useRef<CodeEditorHandle>(null);
  const [language, setLanguage] = usePersistentState<FormatLanguage>(
    'format:language',
    'html',
    isFormatLanguage
  );
  // Each language keeps its own input, starting from a sample.
  const [input, setInput] = usePersistentState(inputKey(language), SAMPLES[language]);
  const [mode, setMode] = usePersistentState<FormatMode>('format:mode', 'beautify', isMode);
  const [options, setOptions] = usePersistentState('format:options', DEFAULT_OPTIONS, isOptions);
  const [wrap, setWrap] = usePersistentState('format:wrap', false);
  const [cursor, setCursor] = useState<CursorInfo | null>(null);
  const { value: live, run, ran, stale } = useRunInput(input, language);
  // Opening a file or reusing the result is explicit, so the new input runs right away.
  const file = useFileLoader('text', (content, picked) => {
    const detected = languageForFile(picked.name) ?? language;
    writePersistentState(inputKey(detected), content);
    setLanguage(detected);
    run(content, detected);
  });
  const replaceInput = (next: string) => {
    setInput(next);
    run(next);
  };

  const info = LANGUAGES[language];
  const effectiveMode: FormatMode = info.minify ? mode : 'beautify';
  const hasInput = live.trim() !== '';

  const formatOptions = useMemo(
    (): FormatOptions => ({
      indent: INDENTS[options.indent],
      printWidth: Number(options.printWidth),
      sqlDialect: options.sqlDialect,
      keywordCase: options.keywordCase,
      mangle: options.mangle,
      minifyInline: options.minifyInline,
    }),
    [options]
  );

  const task = useMemo(
    () => (hasInput ? () => runFormat(live, language, effectiveMode, formatOptions) : null),
    [hasInput, live, language, effectiveMode, formatOptions]
  );
  const { value: current, latest, pending, error: loadError } = useAsyncResult(task);
  // While a new result is computing, keep showing the previous one instead of flickering.
  const result = hasInput ? (current ?? latest) : undefined;
  const output = result?.ok ? result.text : '';
  const error = result && !result.ok ? result.error : null;
  const warnings = current?.ok ? current.warnings : [];

  const diagnostics = useMemo((): EditorDiagnostic[] => {
    if (!current) return [];
    if (!current.ok) return [{ ...current.error, severity: 'error' }];
    return current.warnings.map((warning) => ({ ...warning, severity: 'warning' }));
  }, [current]);

  const reveal = (from: number, to: number) => inputRef.current?.reveal(from, to);

  const numbers = new Intl.NumberFormat(locale);
  const percent = new Intl.NumberFormat(locale, { style: 'percent', maximumFractionDigits: 1 });
  const size = (text: string) => formatBytes(utf8Length(text), locale);

  const beautifying = effectiveMode === 'beautify';
  const runLabel = t.modes[effectiveMode];
  let sizeStatus: string | null = null;
  if (hasInput && output && beautifying) {
    sizeStatus = fmt(t.sizeChange, { from: size(live), to: size(output) });
  } else if (hasInput && output) {
    const before = utf8Length(live);
    const after = utf8Length(output);
    sizeStatus = fmt(after <= before ? t.saved : t.grew, {
      from: size(live),
      to: size(output),
      percent: percent.format(before ? Math.abs(after - before) / before : 0),
    });
  } else if (hasInput) {
    sizeStatus = size(live);
  }

  const minifiesJs = !beautifying && (language === 'javascript' || language === 'html');
  const download = () =>
    downloadFile(
      output,
      `${beautifying ? 'formatted' : 'minified'}.${info.extensions[0]}`,
      `${info.mime};charset=utf-8`
    );

  const inputPane = (
    <DropZone onFile={(picked) => void file.load(picked)}>
      <CodeEditor
        ref={inputRef}
        value={input}
        onChange={setInput}
        label={common.input}
        language={EDITOR_LANGUAGES[language]}
        wrap={wrap}
        placeholder={fmt(t.inputPlaceholder, { language: info.label })}
        diagnostics={diagnostics}
        onCursor={setCursor}
        autoFocus
      />
    </DropZone>
  );

  const outputPane = (
    <CodeEditor
      value={output}
      label={common.output}
      language={EDITOR_LANGUAGES[language]}
      readOnly
      wrap={wrap}
      placeholder={
        !ran
          ? fmt(common.runHint, { action: runLabel, shortcut: RUN_SHORTCUT })
          : error
            ? t.invalidPlaceholder
            : loadError
              ? t.loadFailed
              : t.outputPlaceholder
      }
      className={cn(stale && STALE_OUTPUT_CLASS)}
    />
  );

  return (
    <>
      <ToolHeader
        slug="format"
        actions={
          <>
            <FileOpenButton onFile={(picked) => void file.load(picked)} accept={ACCEPT} />
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
            {(beautifying || minifiesJs) && (
              <OptionsPopover>
                {beautifying && (
                  <SelectField
                    label={t.indent}
                    value={options.indent}
                    onChange={(indent) => setOptions({ ...options, indent })}
                    options={[
                      { value: '2', label: fmt(t.spaces, { count: numbers.format(2) }) },
                      { value: '4', label: fmt(t.spaces, { count: numbers.format(4) }) },
                      { value: 'tab', label: t.tab },
                    ]}
                  />
                )}
                {beautifying && PRETTIER.has(language) && (
                  <SelectField
                    label={t.printWidth}
                    value={options.printWidth}
                    onChange={(printWidth) => setOptions({ ...options, printWidth })}
                    options={PRINT_WIDTHS.map((value) => ({
                      value,
                      label: fmt(t.characters, { count: numbers.format(Number(value)) }),
                    }))}
                  />
                )}
                {language === 'sql' && (
                  <>
                    <SelectField
                      label={t.dialect}
                      value={options.sqlDialect}
                      onChange={(sqlDialect) => setOptions({ ...options, sqlDialect })}
                      options={Object.entries(SQL_DIALECTS).map(([value, label]) => ({
                        value: value as SqlDialect,
                        label,
                      }))}
                    />
                    <SelectField
                      label={t.keywordCase}
                      value={options.keywordCase}
                      onChange={(keywordCase) => setOptions({ ...options, keywordCase })}
                      options={KEYWORD_CASES.map((value) => ({
                        value,
                        label: t.keywordCases[value],
                      }))}
                    />
                  </>
                )}
                {minifiesJs && (
                  <Toggle
                    label={t.mangle}
                    hint={t.mangleHint}
                    checked={options.mangle}
                    onChange={(mangle) => setOptions({ ...options, mangle })}
                  />
                )}
                {minifiesJs && language === 'html' && (
                  <Toggle
                    label={t.minifyInline}
                    hint={t.minifyInlineHint}
                    checked={options.minifyInline}
                    onChange={(minifyInline) => setOptions({ ...options, minifyInline })}
                  />
                )}
              </OptionsPopover>
            )}
            <ToolbarDivider />
            <IconAction
              icon={ArrowLeftToLine}
              label={t.useOutput}
              onClick={() => replaceInput(output)}
              disabled={!output}
              className="rtl:-scale-x-100"
            />
            <CopyButton getText={() => output} disabled={!output} />
            <IconAction
              icon={Download}
              label={common.download}
              disabled={!output}
              onClick={download}
            />
            <RunButton label={runLabel} onRun={() => run()} />
          </>
        }
      >
        <ToolbarSelect
          label={t.language}
          value={language}
          onChange={setLanguage}
          options={FORMAT_LANGUAGES.map((value) => ({ value, label: LANGUAGES[value].label }))}
        />
        {info.minify && (
          <Segmented
            label={t.mode}
            value={mode}
            onChange={setMode}
            options={MODES.map((value) => ({ value, label: t.modes[value] }))}
          />
        )}
      </ToolHeader>
      <SplitPane id="format" first={inputPane} second={outputPane} />
      <StatusBar>
        {result && (
          <ValidityStatus
            error={error && { message: error.message, ...positionAt(live, error.from) }}
            onReveal={error ? () => reveal(error.from, error.to) : undefined}
          />
        )}
        {loadError && (
          <StatusItem tone="danger" title={loadError}>
            {t.loadFailed}
          </StatusItem>
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
            {fmt(t.warnings, { count: numbers.format(warnings.length) })}
          </StatusItem>
        )}
        {pending && <StatusItem className="shrink-0 max-sm:hidden">{t.working}</StatusItem>}
        {sizeStatus && <StatusItem className="shrink-0">{sizeStatus}</StatusItem>}
        <div className="hidden sm:contents">
          <CursorStatus cursor={cursor} />
        </div>
      </StatusBar>
    </>
  );
}
