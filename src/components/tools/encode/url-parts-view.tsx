'use client';

import { useId, useMemo, useRef, useState } from 'react';
import { Eraser, Plus, TextWrap, X } from 'lucide-react';
import {
  buildQuery,
  buildUrl,
  parseQuery,
  parseUrl,
  type QueryParam,
  type UrlParts,
} from '@/lib/tools/encode/url';
import { positionAt } from '@/lib/tools/json/parse';
import {
  CodeEditor,
  type CodeEditorHandle,
  type EditorDiagnostic,
} from '@/components/tools/workbench/code-editor';
import {
  CopyButton,
  IconAction,
  RunButton,
  ToolHeader,
  ToolbarDivider,
} from '@/components/tools/workbench/toolbar';
import { SplitPane } from '@/components/tools/workbench/split-pane';
import {
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
import { cn } from '@/lib/cn';
import { useToolCommon, useToolMessages } from '@/i18n/tools/provider';
import { useLocale } from '@/i18n/use-locale';
import { fmt } from '@/i18n/dictionary';
import { useWrap } from './state';

const SAMPLE =
  'https://user:secret@example.com:8080/docs/getting%20started?q=hello%20world&lang=en&tag=a&tag=b#install';

const FIELDS = [
  'protocol',
  'username',
  'password',
  'hostname',
  'port',
  'pathname',
  'hash',
] as const;
type Field = (typeof FIELDS)[number];

/** The table's model; kept while the URL text is the one it produced, so edits stay put. */
type Model = { text: string; parts: UrlParts; params: QueryParam[] };

const INPUT_CLASSES =
  'h-7 w-full min-w-0 rounded-md border border-line bg-surface-2 px-2 font-mono text-xs text-fg outline-none placeholder:text-fg-subtle focus-visible:ring-2 focus-visible:ring-ring';

/** Splits a URL into editable parts and query parameters; editing a part rewrites the URL. */
export function UrlPartsView({ picker }: { picker: React.ReactNode }) {
  const common = useToolCommon();
  const t = useToolMessages<'encode'>();
  const locale = useLocale();
  const id = useId();
  const inputRef = useRef<CodeEditorHandle>(null);
  const [input, setInput] = usePersistentState('encode:url', SAMPLE);
  const [wrap, setWrap] = useWrap();
  // The last model the table produced; it wins while the URL text is still the text it built.
  const [edited, setEdited] = useState<Model | null>(null);

  const { value: live, run, ran, stale } = useRunInput(input);

  const parsed = useMemo(() => (live.trim() ? parseUrl(live) : null), [live]);
  const error = parsed && !parsed.ok ? parsed.error : null;
  const model: Model | null =
    edited?.text === live
      ? edited
      : parsed?.ok
        ? { text: live, parts: parsed.value, params: parseQuery(parsed.value.query) }
        : null;

  const diagnostics = useMemo(
    (): EditorDiagnostic[] => (error ? [{ ...error, severity: 'error' }] : []),
    [error]
  );

  const commit = (parts: UrlParts, params: QueryParam[]) => {
    const text = buildUrl(parts);
    setEdited({ text, parts, params });
    setInput(text);
    // The table is the result, so editing it rewrites the URL and shows it right away.
    run(text);
  };

  const setField = (field: Field, value: string) => {
    if (model) commit({ ...model.parts, [field]: value }, model.params);
  };

  const setParams = (params: QueryParam[]) => {
    if (model) commit({ ...model.parts, query: buildQuery(params) }, params);
  };

  const inputPane = (
    <CodeEditor
      ref={inputRef}
      value={input}
      onChange={setInput}
      label={common.input}
      wrap={wrap}
      placeholder={t.urlPlaceholder}
      diagnostics={diagnostics}
      autoFocus
    />
  );

  const outputPane = model ? (
    <div
      role="group"
      aria-label={t.urlParts}
      className={cn('min-h-0 flex-1 overflow-auto p-3 text-xs', stale && STALE_OUTPUT_CLASS)}
    >
      <div className="grid grid-cols-[auto_1fr] items-center gap-x-3 gap-y-1.5">
        {FIELDS.map((field) => (
          <FieldRow key={field} id={`${id}-${field}`} label={t[field]}>
            <input
              id={`${id}-${field}`}
              dir="ltr"
              value={model.parts[field]}
              onChange={(event) => setField(field, event.target.value)}
              spellCheck={false}
              autoCapitalize="off"
              autoComplete="off"
              className={INPUT_CLASSES}
            />
          </FieldRow>
        ))}
      </div>
      <fieldset className="mt-4">
        <legend className="mb-2 font-medium text-fg-muted">{t.queryParams}</legend>
        {model.params.length === 0 && <p className="mb-2 text-fg-subtle">{t.noParams}</p>}
        <ul className="space-y-1.5">
          {model.params.map((param, index) => (
            <li key={index} className="flex items-center gap-1.5">
              <input
                dir="ltr"
                value={param.key}
                aria-label={`${t.key} ${index + 1}`}
                placeholder={t.key}
                onChange={(event) =>
                  setParams(
                    model.params.map((item, i) =>
                      i === index ? { ...item, key: event.target.value } : item
                    )
                  )
                }
                spellCheck={false}
                autoCapitalize="off"
                autoComplete="off"
                className={`${INPUT_CLASSES} basis-2/5`}
              />
              <input
                dir="ltr"
                value={param.value}
                aria-label={`${t.value} ${index + 1}`}
                placeholder={t.value}
                onChange={(event) =>
                  setParams(
                    model.params.map((item, i) =>
                      i === index ? { ...item, value: event.target.value } : item
                    )
                  )
                }
                spellCheck={false}
                autoCapitalize="off"
                autoComplete="off"
                className={`${INPUT_CLASSES} basis-3/5`}
              />
              <IconAction
                icon={X}
                label={fmt(t.removeParam, { name: param.key || String(index + 1) })}
                onClick={() => setParams(model.params.filter((_, i) => i !== index))}
              />
            </li>
          ))}
        </ul>
        <button
          type="button"
          onClick={() => setParams([...model.params, { key: '', value: '' }])}
          className="mt-2 inline-flex h-7 cursor-pointer items-center gap-1.5 rounded-md px-2 font-medium text-primary-text hover:bg-surface-2 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          <Plus className="size-3.5" aria-hidden />
          {t.addParam}
        </button>
      </fieldset>
    </div>
  ) : (
    <p className="m-auto max-w-xs p-6 text-center text-xs text-fg-subtle">
      {!ran
        ? fmt(common.runHint, { action: common.run, shortcut: RUN_SHORTCUT })
        : !live.trim()
          ? fmt(common.enterInput, { action: common.run })
          : error
            ? t.invalidPlaceholder
            : t.outputPlaceholder}
    </p>
  );

  return (
    <>
      <ToolHeader
        slug="encode"
        actions={
          <>
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
            <ToolbarDivider />
            <CopyButton getText={() => input} disabled={!input} />
            <RunButton label={common.run} onRun={() => run()} pending={stale} />
          </>
        }
      >
        {picker}
      </ToolHeader>
      <SplitPane id="encode-url" first={inputPane} second={outputPane} />
      <StatusBar>
        {live.trim() && (
          <ValidityStatus
            error={error && { message: error.message, ...positionAt(live, error.from) }}
            onReveal={error ? () => inputRef.current?.reveal(error.from, error.to) : undefined}
          />
        )}
        {stale && <StaleStatus action={common.run} onRun={() => run()} />}
        {ran && !live.trim() && (
          <StatusItem tone="danger" className="font-sans">
            {fmt(common.enterInput, { action: common.run })}
          </StatusItem>
        )}
        {model && (
          <StatusItem className="shrink-0">
            {fmt(t.params, { count: new Intl.NumberFormat(locale).format(model.params.length) })}
          </StatusItem>
        )}
      </StatusBar>
    </>
  );
}

function FieldRow({
  id,
  label,
  children,
}: {
  id: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <label htmlFor={id} className="text-fg-subtle">
        {label}
      </label>
      {children}
    </>
  );
}
