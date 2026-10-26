'use client';

import { useCallback, useMemo, useRef } from 'react';
import { ArrowLeftRight, ChevronDown, ChevronUp, Eraser, TextWrap } from 'lucide-react';
import { diffText, type Granularity } from '@/lib/tools/diff/text';
import { diffJson, normalizeJson } from '@/lib/tools/diff/json';
import { parseJson, positionAt, type ParseResult } from '@/lib/tools/json/parse';
import { stringifyJson } from '@/lib/tools/json/format';
import { CodeEditor, type CodeEditorHandle } from '@/components/tools/workbench/code-editor';
import {
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
import { useFileLoader } from '@/components/tools/workbench/file';
import {
  StaleStatus,
  StatusBar,
  StatusItem,
  ValidityStatus,
} from '@/components/tools/workbench/status-bar';
import { usePersistentState } from '@/components/tools/workbench/use-persistent-state';
import { STALE_OUTPUT_CLASS, useRunInputs } from '@/components/tools/workbench/use-run';
import { PartHeading } from '@/components/tools/jwt/parts';
import { useToolCommon, useToolMessages } from '@/i18n/tools/provider';
import { useLocale } from '@/i18n/use-locale';
import { fmt } from '@/i18n/dictionary';
import { cn } from '@/lib/cn';
import { MergeEditor, type MergeEditorHandle } from './merge-editor';
import type { Side } from './merge-setup';
import { JsonChanges } from './json-changes';

const MODES = ['text', 'json'] as const;
type Mode = (typeof MODES)[number];
const isMode = (value: unknown): value is Mode => MODES.includes(value as Mode);

const VIEWS = ['inputs', 'split', 'unified', 'changes'] as const;
type View = (typeof VIEWS)[number];
const isView = (value: unknown): value is View => VIEWS.includes(value as View);
/** Text sides are edited in the diff itself; JSON is edited raw and compared normalized. */
const MODE_VIEWS: Record<Mode, readonly View[]> = {
  text: ['split', 'unified'],
  json: ['split', 'unified', 'changes'],
};

const GRANULARITIES = ['smart', 'word', 'char'] as const satisfies readonly Granularity[];

type Options = {
  ignoreWhitespace: boolean;
  ignoreCase: boolean;
  granularity: Granularity;
  collapse: boolean;
  ignoreArrayOrder: boolean;
};
const DEFAULT_OPTIONS: Options = {
  ignoreWhitespace: false,
  ignoreCase: false,
  granularity: 'smart',
  collapse: true,
  ignoreArrayOrder: false,
};
const isOptions = (value: unknown): value is Options => {
  const options = value as Options | null;
  return (
    typeof options === 'object' &&
    options !== null &&
    typeof options.ignoreWhitespace === 'boolean' &&
    typeof options.ignoreCase === 'boolean' &&
    GRANULARITIES.includes(options.granularity) &&
    typeof options.collapse === 'boolean' &&
    typeof options.ignoreArrayOrder === 'boolean'
  );
};

// Valid JSON on purpose: as text it shows reordered keys as changes, as JSON it doesn't.
const SAMPLE_A = `{
  "name": "portfolio",
  "version": "2.4.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "test": "vitest"
  },
  "tags": ["nextjs", "react", "i18n"],
  "owner": { "name": "Ada", "active": true }
}
`;
const SAMPLE_B = `{
  "version": "2.5.0",
  "name": "portfolio",
  "private": true,
  "scripts": {
    "dev": "next dev --turbo",
    "build": "next build",
    "lint": "eslint ."
  },
  "tags": ["nextjs", "react", "i18n", "rtl"],
  "owner": { "name": "Ada", "active": false, "team": "web" }
}
`;

type JsonSide = { parsed: ParseResult | null; text: string };

/** Parses one side; an empty side compares as an empty document. */
function useJsonSide(enabled: boolean, input: string, ignoreArrayOrder: boolean): JsonSide {
  const parsed = useMemo(
    () => (enabled && input.trim() ? parseJson(input) : null),
    [enabled, input]
  );
  const text = useMemo(
    () =>
      parsed?.ok
        ? `${stringifyJson(normalizeJson(parsed.value, { ignoreArrayOrder }), { indent: 2 })}\n`
        : '',
    [parsed, ignoreArrayOrder]
  );
  return { parsed, text };
}

export function DiffTool() {
  const common = useToolCommon();
  const t = useToolMessages<'diff'>();
  const locale = useLocale();
  const mergeRef = useRef<MergeEditorHandle>(null);
  // Separate statements: hooks inside an object literal can end up skipped by the React Compiler.
  const inputARef = useRef<CodeEditorHandle>(null);
  const inputBRef = useRef<CodeEditorHandle>(null);
  const inputRefs = { a: inputARef, b: inputBRef };
  const [a, setA] = usePersistentState('diff:a', SAMPLE_A);
  const [b, setB] = usePersistentState('diff:b', SAMPLE_B);
  const [mode, setMode] = usePersistentState<Mode>('diff:mode', 'text', isMode);
  const [storedView, setView] = usePersistentState<View>('diff:view', 'split', isView);
  const [options, setOptions] = usePersistentState('diff:options', DEFAULT_OPTIONS, isOptions);
  const [wrap, setWrap] = usePersistentState('diff:wrap', false);
  const json = mode === 'json';
  // The two inputs show until Compare; then the diff replaces them (read-only) until New diff.
  const compared = useRunInputs([a, b], mode, options);
  const [liveA, liveB] = compared.values;
  const stale = compared.stale;
  const applied = compared.settings;
  const comparing = compared.ran;
  // Opening a file or clearing goes back to the inputs; swapping redoes the diff reversed.
  const replaceSides = (nextA: string, nextB: string) => {
    setA(nextA);
    setB(nextB);
    compared.reset();
  };
  const swapSides = () => {
    setA(b);
    setB(a);
    if (comparing) compared.run([b, a]);
  };
  const compare = () => compared.run();
  // With a diff showing and nothing changed, the primary action starts over.
  const newDiff = () => compared.reset();
  const primaryNewDiff = comparing && !stale;
  const fileA = useFileLoader('text', (content) => replaceSides(content, b));
  const fileB = useFileLoader('text', (content) => replaceSides(a, content));

  const views = MODE_VIEWS[mode];
  const view = views.includes(storedView) ? storedView : 'split';
  const primaryLabel = primaryNewDiff ? t.newDiff : t.compareAction;
  const merged = view === 'split' || view === 'unified';
  const labels = { a: t.original, b: t.changed };
  const placeholders = useMemo(
    () => ({ a: t.originalPlaceholder, b: t.changedPlaceholder }),
    [t.originalPlaceholder, t.changedPlaceholder]
  );
  const setSide = useCallback(
    (side: Side, value: string) => (side === 'a' ? setA(value) : setB(value)),
    [setA, setB]
  );

  const jsonA = useJsonSide(json, liveA, applied.ignoreArrayOrder);
  const jsonB = useJsonSide(json, liveB, applied.ignoreArrayOrder);
  const jsonErrors = (['a', 'b'] as const).flatMap((side) => {
    const { parsed } = side === 'a' ? jsonA : jsonB;
    return parsed && !parsed.ok ? [{ side, error: parsed.error }] : [];
  });
  const comparable = !json || jsonErrors.length === 0;

  const { ignoreWhitespace, ignoreCase, granularity, collapse } = applied;
  const diff = useCallback(
    (x: string, y: string) => diffText(x, y, { ignoreWhitespace, ignoreCase, granularity }).changes,
    [ignoreWhitespace, ignoreCase, granularity]
  );

  const docA = json ? jsonA.text : liveA;
  const docB = json ? jsonB.text : liveB;
  const textDiff = useMemo(
    () =>
      compared.ran && merged && comparable
        ? diffText(docA, docB, { ignoreWhitespace, ignoreCase, granularity })
        : null,
    [compared.ran, merged, comparable, docA, docB, ignoreWhitespace, ignoreCase, granularity]
  );

  const jsonDiff = useMemo(
    () =>
      view === 'changes' && jsonA.parsed?.ok && jsonB.parsed?.ok
        ? diffJson(jsonA.parsed.value, jsonB.parsed.value, {
            ignoreArrayOrder: applied.ignoreArrayOrder,
          })
        : null,
    [view, jsonA.parsed, jsonB.parsed, applied.ignoreArrayOrder]
  );

  const numbers = new Intl.NumberFormat(locale);
  const hasInput = liveA.trim() !== '' || liveB.trim() !== '';
  const stats = textDiff?.stats;
  const identical = stats !== undefined && textDiff?.changes.length === 0;

  const openA = (file: File) => void fileA.load(file);
  const openB = (file: File) => void fileB.load(file);
  // In the side-by-side view the original is the left half (the view is always LTR).
  const dropOnMerge = (file: File, event: React.DragEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    if (view === 'split' && event.clientX < rect.left + rect.width / 2) openA(file);
    else openB(file);
  };

  const inputPane = (side: Side) => {
    const error = jsonErrors.find((entry) => entry.side === side)?.error;
    return (
      <DropZone onFile={side === 'a' ? openA : openB}>
        <PartHeading>{labels[side]}</PartHeading>
        <CodeEditor
          ref={inputRefs[side]}
          value={side === 'a' ? a : b}
          onChange={(value) => setSide(side, value)}
          label={labels[side]}
          language={json ? 'json' : 'plain'}
          wrap={wrap}
          placeholder={placeholders[side]}
          diagnostics={error ? [{ ...error, severity: 'error' }] : undefined}
        />
      </DropZone>
    );
  };

  let body: React.ReactNode;
  if (!comparing) {
    body = <SplitPane id="diff-inputs" first={inputPane('a')} second={inputPane('b')} />;
  } else if (!comparable) {
    body = (
      <p className="m-auto max-w-xs p-6 text-center text-xs text-fg-subtle">
        {t.invalidPlaceholder}
      </p>
    );
  } else if (view === 'changes') {
    const emptySide = !jsonA.parsed ? 'a' : !jsonB.parsed ? 'b' : null;
    body =
      jsonDiff || !emptySide ? (
        <JsonChanges changes={jsonDiff?.changes ?? []} />
      ) : (
        <p className="m-auto max-w-xs p-6 text-center text-xs text-fg-subtle">
          {placeholders[emptySide]}
        </p>
      );
  } else {
    body = (
      <DropZone onFile={dropOnMerge}>
        {view === 'split' && (
          <div dir="ltr" className="flex shrink-0 divide-x divide-line">
            <div className="min-w-0 flex-1">
              <PartHeading>{labels.a}</PartHeading>
            </div>
            <div className="min-w-0 flex-1">
              <PartHeading>{labels.b}</PartHeading>
            </div>
          </div>
        )}
        {json && (
          <p className="shrink-0 border-b border-line px-3 py-1 text-[11px] text-fg-subtle">
            {t.normalizedNote}
          </p>
        )}
        <MergeEditor
          key={`${mode}:${view}:${ignoreWhitespace}:${ignoreCase}:${granularity}:${collapse}`}
          ref={mergeRef}
          layout={view === 'unified' ? 'unified' : 'split'}
          collapse={collapse}
          diff={diff}
          a={json ? jsonA.text : a}
          b={json ? jsonB.text : b}
          labels={labels}
          placeholders={placeholders}
          readOnly
          language={json ? 'json' : 'plain'}
          wrap={wrap}
        />
      </DropZone>
    );
  }

  return (
    <>
      <ToolHeader
        slug="diff"
        actions={
          <>
            <FileOpenButton onFile={openA} label={t.openOriginal} />
            <FileOpenButton onFile={openB} label={t.openChanged} />
            <IconAction
              icon={ArrowLeftRight}
              label={t.swap}
              onClick={swapSides}
              disabled={a === b}
            />
            <IconAction
              icon={Eraser}
              label={t.clearBoth}
              onClick={() => replaceSides('', '')}
              disabled={!a && !b}
            />
            <ToolbarDivider />
            <IconAction
              icon={TextWrap}
              label={common.wrap}
              pressed={wrap}
              onClick={() => setWrap(!wrap)}
            />
            <OptionsPopover>
              <Toggle
                label={t.ignoreWhitespace}
                hint={t.ignoreWhitespaceHint}
                checked={options.ignoreWhitespace}
                onChange={(value) => setOptions({ ...options, ignoreWhitespace: value })}
              />
              <Toggle
                label={t.ignoreCase}
                checked={options.ignoreCase}
                onChange={(value) => setOptions({ ...options, ignoreCase: value })}
              />
              <SelectField
                label={t.highlight}
                value={options.granularity}
                onChange={(value) => setOptions({ ...options, granularity: value })}
                options={GRANULARITIES.map((value) => ({
                  value,
                  label: t.granularities[value],
                }))}
              />
              <Toggle
                label={t.collapse}
                hint={t.collapseHint}
                checked={options.collapse}
                onChange={(value) => setOptions({ ...options, collapse: value })}
              />
              {json && (
                <Toggle
                  label={t.ignoreArrayOrder}
                  hint={t.ignoreArrayOrderHint}
                  checked={options.ignoreArrayOrder}
                  onChange={(value) => setOptions({ ...options, ignoreArrayOrder: value })}
                />
              )}
            </OptionsPopover>
            <RunButton
              label={primaryLabel}
              onRun={primaryNewDiff ? newDiff : compare}
              pending={stale}
            />
          </>
        }
      >
        <Segmented
          label={t.compare}
          value={mode}
          onChange={setMode}
          options={MODES.map((value) => ({ value, label: t.modes[value] }))}
        />
        <ToolbarDivider />
        {comparing && (
          <>
            <Segmented
              label={t.view}
              value={view}
              onChange={setView}
              options={views.map((value) => ({ value, label: t.views[value] }))}
            />
            <ToolbarDivider />
          </>
        )}
        <IconAction
          icon={ChevronUp}
          label={t.previous}
          onClick={() => mergeRef.current?.goTo('previous')}
          disabled={!compared.ran || !merged || !comparable || identical}
        />
        <IconAction
          icon={ChevronDown}
          label={t.next}
          onClick={() => mergeRef.current?.goTo('next')}
          disabled={!compared.ran || !merged || !comparable || identical}
        />
      </ToolHeader>
      <div
        className={cn(
          'flex min-h-0 min-w-0 flex-1 flex-col',
          stale && comparing && STALE_OUTPUT_CLASS
        )}
      >
        {body}
      </div>
      <StatusBar>
        {jsonErrors.map(({ side, error }) => (
          <ValidityStatus
            key={side}
            error={{
              message: fmt(t.sideError, { side: labels[side], message: error.message }),
              ...positionAt(side === 'a' ? liveA : liveB, error.from),
            }}
            onReveal={newDiff}
          />
        ))}
        {stale && <StaleStatus action={t.compareAction} onRun={compare} />}
        {compared.ran && !hasInput && (
          <StatusItem tone="danger" className="font-sans">
            {fmt(common.enterInput, { action: t.compareAction })}
          </StatusItem>
        )}
        {fileA.error && <StatusItem tone="danger">{fileA.error}</StatusItem>}
        {fileB.error && <StatusItem tone="danger">{fileB.error}</StatusItem>}
        {stats && hasInput && identical && <StatusItem tone="success">{t.identical}</StatusItem>}
        {stats && !identical && (
          <StatusItem
            className="shrink-0"
            title={fmt(t.lineStats, {
              added: numbers.format(stats.added),
              removed: numbers.format(stats.removed),
              changed: numbers.format(stats.changed),
            })}
          >
            <span aria-hidden dir="ltr" className="flex gap-2">
              <span className="text-success">+{numbers.format(stats.added)}</span>
              <span className="text-danger">−{numbers.format(stats.removed)}</span>
              <span className="text-warning">~{numbers.format(stats.changed)}</span>
            </span>
            <span className="sr-only">
              {fmt(t.lineStats, {
                added: numbers.format(stats.added),
                removed: numbers.format(stats.removed),
                changed: numbers.format(stats.changed),
              })}
            </span>
          </StatusItem>
        )}
        {textDiff && !textDiff.minimal && <StatusItem tone="warning">{t.notMinimal}</StatusItem>}
        {jsonDiff && jsonDiff.changes.length > 0 && (
          <StatusItem className="shrink-0">
            {fmt(jsonDiff.truncated ? t.moreChanges : t.changeCount, {
              count: numbers.format(jsonDiff.changes.length),
            })}
          </StatusItem>
        )}
      </StatusBar>
    </>
  );
}
