'use client';

import { useMemo, useState } from 'react';
import { Download } from 'lucide-react';
import {
  BYTE_FORMATS,
  ID_KINDS,
  IdGenerator,
  MAX_BYTE_LENGTH,
  MAX_COUNT,
  isFixedKind,
  isNameBasedKind,
  isUuidKind,
  type AlphabetChoice,
  type IdKind,
  type IdOptions,
  type NamespaceChoice,
} from '@/lib/tools/generate/ids';
import { NANOID_ALPHABETS, NANOID_MAX_SIZE } from '@/lib/tools/generate/nanoid';
import { UUID_NAMESPACES } from '@/lib/tools/generate/uuid';
import { CodeEditor } from '@/components/tools/workbench/code-editor';
import {
  CopyButton,
  IconAction,
  RunButton,
  ToolHeader,
  ToolbarDivider,
  ToolbarSelect,
} from '@/components/tools/workbench/toolbar';
import { SelectField, Toggle } from '@/components/tools/workbench/options-popover';
import { SplitPane } from '@/components/tools/workbench/split-pane';
import { downloadFile } from '@/components/tools/workbench/file';
import { StaleStatus, StatusBar, StatusItem } from '@/components/tools/workbench/status-bar';
import { useAsyncResult } from '@/components/tools/workbench/use-async-result';
import { RUN_SHORTCUT, STALE_OUTPUT_CLASS, useApplied } from '@/components/tools/workbench/use-run';
import { cn } from '@/lib/cn';
import { NumberField, TextField } from '@/components/tools/crypto/parts';
import { useToolCommon, useToolMessages } from '@/i18n/tools/provider';
import { fmt } from '@/i18n/dictionary';
import { useFormatNumber } from './parts';
import { useIdOptions } from './state';

/** Kinds whose IDs sort in creation order. */
const SORTABLE: IdKind[] = ['uuid-v7', 'uuid-v6', 'ulid', 'objectid'];
const NAMESPACES = [...(Object.keys(UUID_NAMESPACES) as NamespaceChoice[]), 'custom'] as const;
const ALPHABETS = [...(Object.keys(NANOID_ALPHABETS) as AlphabetChoice[]), 'custom'] as const;

/*
 * One generator for the page's lifetime keeps time-based IDs monotonic across regenerations.
 * Created on first use: generation only runs in the browser.
 */
let generator: IdGenerator | null = null;
const getGenerator = () => (generator ??= new IdGenerator());

/** Bulk UUIDs, ULIDs, NanoIDs, ObjectIds and random bytes. */
export function IdsView({ picker }: { picker: React.ReactNode }) {
  const t = useToolMessages<'generate'>();
  const common = useToolCommon();
  const formatNumber = useFormatNumber();
  const [options, setOptions] = useIdOptions();
  const [run, setRun] = useState(0);
  const set = (patch: Partial<IdOptions>) => setOptions((previous) => ({ ...previous, ...patch }));
  const { kind } = options;
  const fixed = isFixedKind(kind);

  // Nothing is generated until Generate; `run` makes every press a new batch.
  const { applied, apply, stale } = useApplied({ options, run });
  const generate = () => {
    setRun(run + 1);
    apply({ options, run: run + 1 });
  };
  const task = useMemo(
    () => applied && (() => getGenerator().generate(applied.options)),
    [applied]
  );
  const job = useAsyncResult(task);
  // Keep showing the previous IDs while new ones are made, instead of flashing an empty pane.
  const result = task ? (job.value ?? job.latest) : undefined;
  const ids = result?.ok ? result.ids : null;
  const output = ids ? ids.join('\n') : '';
  const failure = result && !result.ok ? result : null;
  const invalid = (field: string) => failure?.field === field;

  const settingsPane = (
    <div className="min-h-0 min-w-0 flex-1 space-y-4 overflow-auto p-3 text-xs">
      <p className="text-fg-muted">{t.kindHints[kind]}</p>
      {!fixed && (
        <NumberField
          label={t.count}
          value={options.count}
          onChange={(count) => set({ count })}
          min={1}
          max={MAX_COUNT}
          hint={fmt(t.countHint, { max: formatNumber(MAX_COUNT) })}
        />
      )}
      {isNameBasedKind(kind) && (
        <>
          <SelectField
            label={t.namespace}
            value={options.namespace}
            onChange={(namespace) => set({ namespace })}
            options={NAMESPACES.map((value) => ({ value, label: t.namespaces[value] }))}
          />
          {options.namespace === 'custom' && (
            <TextField
              label={t.customNamespace}
              value={options.customNamespace}
              onChange={(customNamespace) => set({ customNamespace })}
              placeholder={t.customNamespacePlaceholder}
              invalid={invalid('customNamespace')}
            />
          )}
          <TextField
            label={t.name}
            value={options.name}
            onChange={(name) => set({ name })}
            placeholder={t.namePlaceholder}
          />
        </>
      )}
      {kind === 'nanoid' && (
        <>
          <SelectField
            label={t.alphabet}
            value={options.alphabet}
            onChange={(alphabet) => set({ alphabet })}
            options={ALPHABETS.map((value) => ({ value, label: t.alphabets[value] }))}
          />
          {options.alphabet === 'custom' && (
            <TextField
              label={t.customAlphabet}
              value={options.customAlphabet}
              onChange={(customAlphabet) => set({ customAlphabet })}
              placeholder={t.customAlphabetPlaceholder}
              invalid={invalid('customAlphabet')}
            />
          )}
          <NumberField
            label={t.size}
            value={options.size}
            onChange={(size) => set({ size })}
            min={1}
            max={NANOID_MAX_SIZE}
          />
        </>
      )}
      {kind === 'bytes' && (
        <>
          <NumberField
            label={t.byteLength}
            value={options.byteLength}
            onChange={(byteLength) => set({ byteLength })}
            min={1}
            max={MAX_BYTE_LENGTH}
          />
          <SelectField
            label={t.byteFormat}
            value={options.byteFormat}
            onChange={(byteFormat) => set({ byteFormat })}
            options={BYTE_FORMATS.map((value) => ({ value, label: value }))}
          />
        </>
      )}
      {(isUuidKind(kind) || kind === 'objectid') && (
        <Toggle label={t.uppercase} checked={options.upper} onChange={(upper) => set({ upper })} />
      )}
      {isUuidKind(kind) && (
        <>
          <Toggle
            label={t.hyphens}
            checked={options.hyphens}
            onChange={(hyphens) => set({ hyphens })}
          />
          <Toggle
            label={t.braces}
            checked={options.braces}
            onChange={(braces) => set({ braces })}
          />
        </>
      )}
    </div>
  );

  const outputPane = (
    <CodeEditor
      value={output}
      label={common.output}
      readOnly
      placeholder={
        failure
          ? t.errorPlaceholder
          : applied
            ? ''
            : fmt(common.runHint, { action: common.generate, shortcut: RUN_SHORTCUT })
      }
      className={cn(stale && STALE_OUTPUT_CLASS)}
    />
  );

  return (
    <>
      <ToolHeader
        slug="generate"
        actions={
          <>
            <IconAction
              icon={Download}
              label={common.download}
              disabled={!output}
              onClick={() => downloadFile(`${output}\n`, `${kind}.txt`, 'text/plain')}
            />
            <CopyButton getText={() => output} disabled={!output} />
            <RunButton label={common.generate} onRun={generate} pending={stale} />
          </>
        }
      >
        {picker}
        <ToolbarDivider />
        <ToolbarSelect
          label={t.type}
          value={kind}
          onChange={(value) => set({ kind: value })}
          options={ID_KINDS.map((value) => ({ value, label: t.kinds[value] }))}
        />
      </ToolHeader>
      <SplitPane id="generate-ids" first={settingsPane} second={outputPane} defaultRatio={0.4} />
      <StatusBar>
        {stale && <StaleStatus action={common.generate} onRun={generate} />}
        {failure && (
          <StatusItem tone="danger" title={failure.error} className="font-sans">
            {failure.error}
          </StatusItem>
        )}
        {job.error && (
          <StatusItem tone="danger" title={job.error} className="font-sans">
            {job.error}
          </StatusItem>
        )}
        {ids && (
          <StatusItem className="shrink-0">
            {fmt(t.generated, { count: formatNumber(ids.length) })}
          </StatusItem>
        )}
        {result?.ok && result.bits !== null && (
          <StatusItem className="shrink-0 max-sm:hidden">
            {fmt(t.bitsEach, { bits: formatNumber(result.bits) })}
          </StatusItem>
        )}
        {SORTABLE.includes(kind) && (
          <StatusItem className="shrink-0 font-sans max-sm:hidden">{t.sortable}</StatusItem>
        )}
      </StatusBar>
    </>
  );
}
