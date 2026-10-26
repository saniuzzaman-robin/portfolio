'use client';

import { useMemo, useRef, useState } from 'react';
import { ArrowLeftRight, Download, Eraser, TextWrap } from 'lucide-react';
import {
  CONVERSIONS,
  DATA_FORMATS,
  conversionFormats,
  formatForFile,
  isConversion,
  reverseConversion,
  runConvert,
  type Conversion,
  type ConvertOptions,
  type DataFormat,
  type SourceFormat,
} from '@/lib/tools/convert/convert';
import type { CsvDelimiter } from '@/lib/tools/convert/csv';
import { ATTRIBUTE_PREFIXES, type AttributePrefix } from '@/lib/tools/convert/xml';
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
  ToolHeader,
  ToolbarDivider,
  ToolbarSelect,
} from '@/components/tools/workbench/toolbar';
import {
  InputField,
  OptionsPopover,
  SelectField,
  Toggle,
} from '@/components/tools/workbench/options-popover';
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

const INDENTS = { '2': 2, '4': 4, tab: 'tab' } as const satisfies Record<string, JsonIndent>;
type IndentOption = keyof typeof INDENTS;

const DELIMITERS = {
  auto: 'auto',
  comma: ',',
  semicolon: ';',
  tab: '\t',
  pipe: '|',
} as const satisfies Record<string, CsvDelimiter | 'auto'>;
type DelimiterOption = keyof typeof DELIMITERS;

type Options = {
  indent: IndentOption;
  multiDocument: boolean;
  delimiter: DelimiterOption;
  header: boolean;
  flatten: boolean;
  inferTypes: boolean;
  attributePrefix: AttributePrefix;
  rootName: string;
};
const DEFAULT_OPTIONS: Options = {
  indent: '2',
  multiDocument: true,
  delimiter: 'auto',
  header: true,
  flatten: true,
  inferTypes: true,
  attributePrefix: '@_',
  rootName: 'Root',
};
const isOptions = (value: unknown): value is Options => {
  const options = value as Options | null;
  return (
    typeof options === 'object' &&
    options !== null &&
    options.indent in INDENTS &&
    typeof options.multiDocument === 'boolean' &&
    options.delimiter in DELIMITERS &&
    typeof options.header === 'boolean' &&
    typeof options.flatten === 'boolean' &&
    typeof options.inferTypes === 'boolean' &&
    ATTRIBUTE_PREFIXES.includes(options.attributePrefix) &&
    typeof options.rootName === 'string'
  );
};

const EDITOR_LANGUAGES: Record<DataFormat, EditorLanguage> = {
  json: 'json',
  yaml: 'yaml',
  csv: 'plain',
  xml: 'xml',
  query: 'plain',
  typescript: 'typescript',
  zod: 'typescript',
};

/** Where an opened file of each format lands. */
const DEFAULT_CONVERSION: Record<SourceFormat, Conversion> = {
  json: 'json-yaml',
  yaml: 'yaml-json',
  csv: 'csv-json',
  xml: 'xml-json',
  query: 'query-json',
};

const ACCEPT = '.json,.yaml,.yml,.csv,.tsv,.xml,text/plain';

const inputKey = (format: SourceFormat) => `convert:input:${format}`;

export function ConvertTool() {
  const common = useToolCommon();
  const t = useToolMessages<'convert'>();
  const locale = useLocale();
  const inputRef = useRef<CodeEditorHandle>(null);
  const [conversion, setConversion] = usePersistentState<Conversion>(
    'convert:conversion',
    'json-yaml',
    isConversion
  );
  const [from, to] = conversionFormats(conversion);
  // Each source format keeps its own input, starting from a sample.
  const [input, setInput] = usePersistentState(inputKey(from), SAMPLES[from]);
  const [options, setOptions] = usePersistentState('convert:options', DEFAULT_OPTIONS, isOptions);
  const [wrap, setWrap] = usePersistentState('convert:wrap', false);
  const [cursor, setCursor] = useState<CursorInfo | null>(null);
  const settings = { conversion, options };
  const { value: live, settings: applied, run, ran, stale } = useRunInput(input, from, settings);
  const [, appliedTo] = conversionFormats(applied.conversion);
  // Opening a file or converting back is explicit, so the new input runs right away.
  const file = useFileLoader('text', (content, picked) => {
    const detected = formatForFile(picked.name) ?? from;
    writePersistentState(inputKey(detected), content);
    const next = detected !== from ? DEFAULT_CONVERSION[detected] : conversion;
    if (detected !== from) setConversion(next);
    run(content, detected, { conversion: next, options });
  });

  const hasInput = live.trim() !== '';
  const reverse = reverseConversion(conversion);

  const convertOptions = useMemo(
    (): ConvertOptions => ({
      ...applied.options,
      indent: INDENTS[applied.options.indent],
      delimiter: DELIMITERS[applied.options.delimiter],
    }),
    [applied.options]
  );

  const task = useMemo(
    () => (hasInput ? () => runConvert(live, applied.conversion, convertOptions) : null),
    [hasInput, live, applied.conversion, convertOptions]
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

  const reveal = (start: number, end: number) => inputRef.current?.reveal(start, end);

  const numbers = new Intl.NumberFormat(locale);
  const size = (text: string) => formatBytes(utf8Length(text), locale);
  const label = (value: Conversion) => {
    const [source, target] = conversionFormats(value);
    return fmt(t.direction, { from: t.formats[source], to: t.formats[target] });
  };

  // Convert back: the result becomes the input of the opposite conversion.
  const swap = () => {
    if (!reverse || !output) return;
    const source = conversionFormats(reverse)[0];
    writePersistentState(inputKey(source), output);
    setConversion(reverse);
    run(output, source, { conversion: reverse, options });
  };

  const set =
    <K extends keyof Options>(key: K) =>
    (value: Options[K]) =>
      setOptions({ ...options, [key]: value });
  const spaces = (count: number) => fmt(t.spaces, { count: numbers.format(count) });
  const indentOptions: { value: IndentOption; label: string }[] = [
    { value: '2', label: spaces(2) },
    { value: '4', label: spaces(4) },
    // YAML can't indent with tabs.
    ...(to === 'yaml' ? [] : [{ value: 'tab' as const, label: t.tab }]),
  ];
  const delimiterOptions = (Object.keys(DELIMITERS) as DelimiterOption[])
    // Writing needs a real delimiter; "detect" writes commas.
    .filter((value) => from === 'csv' || value !== 'auto')
    .map((value) => ({ value, label: t.delimiters[value] }));

  const inputPane = (
    <DropZone onFile={(picked) => void file.load(picked)}>
      <CodeEditor
        ref={inputRef}
        value={input}
        onChange={setInput}
        label={common.input}
        language={EDITOR_LANGUAGES[from]}
        wrap={wrap}
        placeholder={fmt(t.inputPlaceholder, { format: t.formats[from] })}
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
      language={EDITOR_LANGUAGES[appliedTo]}
      readOnly
      wrap={wrap}
      placeholder={
        !ran
          ? fmt(common.runHint, { action: t.convert, shortcut: RUN_SHORTCUT })
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
        slug="convert"
        actions={
          <>
            <FileOpenButton onFile={(picked) => void file.load(picked)} accept={ACCEPT} />
            <IconAction
              icon={Eraser}
              label={common.clear}
              onClick={() => {
                setInput('');
                run('');
              }}
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
              {(to === 'json' || to === 'yaml' || to === 'xml') && (
                <SelectField
                  label={t.indent}
                  value={to === 'yaml' && options.indent === 'tab' ? '2' : options.indent}
                  onChange={set('indent')}
                  options={indentOptions}
                />
              )}
              {conversion === 'json-yaml' && (
                <Toggle
                  label={t.multiDocument}
                  hint={t.multiDocumentHint}
                  checked={options.multiDocument}
                  onChange={set('multiDocument')}
                />
              )}
              {(from === 'csv' || to === 'csv') && (
                <>
                  <SelectField
                    label={t.delimiter}
                    value={
                      to === 'csv' && options.delimiter === 'auto' ? 'comma' : options.delimiter
                    }
                    onChange={set('delimiter')}
                    options={delimiterOptions}
                  />
                  <Toggle
                    label={t.header}
                    hint={t.headerHint}
                    checked={options.header}
                    onChange={set('header')}
                  />
                  <Toggle
                    label={from === 'csv' ? t.nest : t.flatten}
                    hint={from === 'csv' ? t.nestHint : t.flattenHint}
                    checked={options.flatten}
                    onChange={set('flatten')}
                  />
                </>
              )}
              {(from === 'xml' || to === 'xml') && (
                <SelectField
                  label={t.attributePrefix}
                  value={options.attributePrefix}
                  onChange={set('attributePrefix')}
                  options={ATTRIBUTE_PREFIXES.map((value) => ({ value, label: value }))}
                />
              )}
              {(from === 'csv' || from === 'xml' || from === 'query') && (
                <Toggle
                  label={t.inferTypes}
                  hint={t.inferTypesHint}
                  checked={options.inferTypes}
                  onChange={set('inferTypes')}
                />
              )}
              {(to === 'typescript' || to === 'zod') && (
                <InputField
                  label={t.rootName}
                  value={options.rootName}
                  onChange={set('rootName')}
                  placeholder={DEFAULT_OPTIONS.rootName}
                />
              )}
            </OptionsPopover>
            <ToolbarDivider />
            <IconAction
              icon={ArrowLeftRight}
              label={t.swap}
              onClick={swap}
              disabled={!reverse || !output}
            />
            <CopyButton getText={() => output} disabled={!output} />
            <IconAction
              icon={Download}
              label={common.download}
              disabled={!output}
              onClick={() =>
                downloadFile(
                  output,
                  `converted.${DATA_FORMATS[appliedTo].extension}`,
                  `${DATA_FORMATS[appliedTo].mime};charset=utf-8`
                )
              }
            />
            <RunButton label={t.convert} onRun={() => run()} pending={stale} />
          </>
        }
      >
        <ToolbarSelect
          label={t.conversion}
          value={conversion}
          onChange={setConversion}
          options={CONVERSIONS.map((value) => ({ value, label: label(value) }))}
        />
      </ToolHeader>
      <SplitPane id="convert" first={inputPane} second={outputPane} />
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
        {stale && <StaleStatus action={t.convert} onRun={() => run()} />}
        {ran && !hasInput && (
          <StatusItem tone="danger" className="font-sans">
            {fmt(common.enterInput, { action: t.convert })}
          </StatusItem>
        )}
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
        {hasInput && (
          <StatusItem className="shrink-0">
            {output ? fmt(t.sizeChange, { from: size(live), to: size(output) }) : size(live)}
          </StatusItem>
        )}
        <div className="hidden sm:contents">
          <CursorStatus cursor={cursor} />
        </div>
      </StatusBar>
    </>
  );
}
