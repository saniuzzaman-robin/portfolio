'use client';

import { useMemo, useState } from 'react';
import { ArrowLeftToLine, Download, Shuffle } from 'lucide-react';
import { Random } from '@/lib/tools/generate/random';
import { LINE_ORDERS, SORT_METHODS, processLines } from '@/lib/tools/text/lines';
import { CodeEditor, type CursorInfo } from '@/components/tools/workbench/code-editor';
import {
  CopyButton,
  IconAction,
  RunButton,
  Segmented,
  ToolHeader,
  ToolbarDivider,
} from '@/components/tools/workbench/toolbar';
import {
  InputField,
  OptionsPopover,
  SelectField,
  Toggle,
} from '@/components/tools/workbench/options-popover';
import { SplitPane } from '@/components/tools/workbench/split-pane';
import {
  CursorStatus,
  StaleStatus,
  StatusBar,
  StatusItem,
} from '@/components/tools/workbench/status-bar';
import { downloadFile } from '@/components/tools/workbench/file';
import { RUN_SHORTCUT, STALE_OUTPUT_CLASS } from '@/components/tools/workbench/use-run';
import { cn } from '@/lib/cn';
import { useAsyncResult } from '@/components/tools/workbench/use-async-result';
import { useFormatNumber } from '@/components/tools/generate/parts';
import { useToolCommon, useToolMessages } from '@/i18n/tools/provider';
import { useLocale } from '@/i18n/use-locale';
import { fmt } from '@/i18n/dictionary';
import { InputActions, InputPane, useInput } from './parts';
import { useLineOptions } from './state';

let random: Random | null = null;
const getRandom = () => (random ??= new Random());

/** Trim, dedupe, sort, shuffle and decorate lines as one pipeline. */
export function LinesView({ picker }: { picker: React.ReactNode }) {
  const common = useToolCommon();
  const t = useToolMessages<'text'>();
  const locale = useLocale();
  const formatNumber = useFormatNumber();
  const [options, setOptions] = useLineOptions();
  const [shuffles, setShuffles] = useState(0);
  const input = useInput({ options, shuffles });
  const [cursor, setCursor] = useState<CursorInfo | null>(null);
  const { value: live, settings: applied, run, ran, stale } = input.runner;

  // Shuffling is random, so lines are processed after hydration, never during render. Every run
  // shuffles again (`shuffles` is part of the snapshot, so asking to reshuffle re-runs).
  const task = useMemo(
    () => (ran ? async () => processLines(live, applied.options, locale, getRandom()) : null),
    [ran, live, applied, locale]
  );
  const job = useAsyncResult(task);
  const result = task ? (job.value ?? job.latest) : undefined;
  const output = result?.text ?? '';
  const sorting = options.order === 'sort';
  const reshuffle = () => {
    setShuffles(shuffles + 1);
    run(undefined, '', { options, shuffles: shuffles + 1 });
  };

  const outputPane = (
    <CodeEditor
      value={output}
      label={common.output}
      readOnly
      wrap={input.wrap}
      placeholder={
        ran
          ? t.outputPlaceholder
          : fmt(common.runHint, { action: t.linesAction, shortcut: RUN_SHORTCUT })
      }
      className={cn(stale && STALE_OUTPUT_CLASS)}
    />
  );

  return (
    <>
      <ToolHeader
        slug="text"
        actions={
          <>
            <InputActions input={input} />
            <OptionsPopover>
              <Toggle
                label={t.trim}
                checked={options.trim}
                onChange={(trim) => setOptions({ ...options, trim })}
              />
              <Toggle
                label={t.removeBlank}
                checked={options.removeBlank}
                onChange={(removeBlank) => setOptions({ ...options, removeBlank })}
              />
              <Toggle
                label={t.dedupe}
                hint={t.dedupeHint}
                checked={options.dedupe}
                onChange={(dedupe) => setOptions({ ...options, dedupe })}
              />
              <Toggle
                label={t.ignoreCase}
                hint={t.ignoreCaseHint}
                checked={options.ignoreCase}
                onChange={(ignoreCase) => setOptions({ ...options, ignoreCase })}
              />
              {sorting && (
                <>
                  <SelectField
                    label={t.sortMethod}
                    value={options.sortMethod}
                    onChange={(sortMethod) => setOptions({ ...options, sortMethod })}
                    options={SORT_METHODS.map((value) => ({
                      value,
                      label: t.sortMethods[value],
                    }))}
                  />
                  <Toggle
                    label={t.descending}
                    checked={options.descending}
                    onChange={(descending) => setOptions({ ...options, descending })}
                  />
                </>
              )}
              <InputField
                label={t.prefix}
                value={options.prefix}
                onChange={(prefix) => setOptions({ ...options, prefix })}
              />
              <InputField
                label={t.suffix}
                value={options.suffix}
                onChange={(suffix) => setOptions({ ...options, suffix })}
              />
            </OptionsPopover>
            <ToolbarDivider />
            {options.order === 'shuffle' && (
              <IconAction icon={Shuffle} label={t.reshuffle} onClick={reshuffle} />
            )}
            <IconAction
              icon={ArrowLeftToLine}
              label={t.useOutput}
              onClick={() => input.replace(output)}
              disabled={!output}
              className="rtl:-scale-x-100"
            />
            <CopyButton getText={() => output} disabled={!output} />
            <IconAction
              icon={Download}
              label={common.download}
              disabled={!output}
              onClick={() => downloadFile(output, 'lines.txt')}
            />
            <RunButton label={t.linesAction} onRun={() => run()} pending={stale} />
          </>
        }
      >
        {picker}
        <ToolbarDivider />
        <Segmented
          label={t.order}
          value={options.order}
          onChange={(order) => setOptions({ ...options, order })}
          options={LINE_ORDERS.map((value) => ({ value, label: t.orders[value] }))}
        />
      </ToolHeader>
      <SplitPane
        id="text-lines"
        first={<InputPane input={input} onCursor={setCursor} />}
        second={outputPane}
      />
      <StatusBar>
        {stale && <StaleStatus action={t.linesAction} onRun={() => run()} />}
        {ran && live === '' && (
          <StatusItem tone="danger" className="font-sans">
            {fmt(common.enterInput, { action: t.linesAction })}
          </StatusItem>
        )}
        {input.file.error && <StatusItem tone="danger">{input.file.error}</StatusItem>}
        {result && (
          <>
            <StatusItem className="shrink-0">
              {fmt(t.lineStats, {
                from: formatNumber(result.inputLines),
                to: formatNumber(result.outputLines),
              })}
            </StatusItem>
            {result.duplicatesRemoved > 0 && (
              <StatusItem className="shrink-0 max-sm:hidden">
                {fmt(t.duplicatesRemoved, { count: formatNumber(result.duplicatesRemoved) })}
              </StatusItem>
            )}
            {result.blankRemoved > 0 && (
              <StatusItem className="shrink-0 max-sm:hidden">
                {fmt(t.blankRemoved, { count: formatNumber(result.blankRemoved) })}
              </StatusItem>
            )}
          </>
        )}
        <div className="hidden sm:contents">
          <CursorStatus cursor={cursor} />
        </div>
      </StatusBar>
    </>
  );
}
