'use client';

import { useMemo, useState } from 'react';
import { Download, RefreshCw } from 'lucide-react';
import { Random } from '@/lib/tools/generate/random';
import { LOREM_LIMITS, LOREM_UNITS, generateLorem } from '@/lib/tools/text/lorem';
import { countText } from '@/lib/tools/text/count';
import { CodeEditor } from '@/components/tools/workbench/code-editor';
import {
  CopyButton,
  IconAction,
  Segmented,
  ToolHeader,
  ToolbarDivider,
} from '@/components/tools/workbench/toolbar';
import { Toggle } from '@/components/tools/workbench/options-popover';
import { SplitPane } from '@/components/tools/workbench/split-pane';
import { StatusBar, StatusItem } from '@/components/tools/workbench/status-bar';
import { downloadFile } from '@/components/tools/workbench/file';
import { useAsyncResult } from '@/components/tools/workbench/use-async-result';
import { NumberField } from '@/components/tools/crypto/parts';
import { useFormatNumber } from '@/components/tools/generate/parts';
import { useToolCommon, useToolMessages } from '@/i18n/tools/provider';
import { fmt } from '@/i18n/dictionary';
import { useLoremOptions, useWrap } from './state';

let random: Random | null = null;
const getRandom = () => (random ??= new Random());

/** Placeholder text by paragraphs, sentences or words. */
export function LoremView({ picker }: { picker: React.ReactNode }) {
  const common = useToolCommon();
  const t = useToolMessages<'text'>();
  const formatNumber = useFormatNumber();
  const [options, setOptions] = useLoremOptions();
  const [wrap] = useWrap();
  const [run, setRun] = useState(0);

  const request = useMemo(() => ({ options, run }), [options, run]);
  // Random text is generated after hydration, so server and client markup agree.
  const task = useMemo(() => async () => generateLorem(getRandom(), request.options), [request]);
  const job = useAsyncResult(task);
  const result = job.value ?? job.latest;
  const text = result?.ok ? result.text : '';
  const max = LOREM_LIMITS[options.unit];
  const error = result && !result.ok ? fmt(t.badCount, { max: formatNumber(result.max) }) : null;
  const words = useMemo(() => (text ? countText(text, 'en').words : 0), [text]);

  const settingsPane = (
    <div className="min-h-0 min-w-0 flex-1 space-y-4 overflow-auto p-3 text-xs">
      <NumberField
        label={t.amount}
        value={options.count}
        onChange={(count) => setOptions({ ...options, count })}
        min={1}
        max={max}
        hint={fmt(t.amountHint, { max: formatNumber(max) })}
      />
      <Toggle
        label={t.classic}
        checked={options.classic}
        onChange={(classic) => setOptions({ ...options, classic })}
      />
      <Toggle
        label={t.html}
        checked={options.html}
        onChange={(html) => setOptions({ ...options, html })}
      />
    </div>
  );

  const outputPane = (
    <CodeEditor
      value={text}
      label={common.output}
      language={options.html ? 'html' : 'plain'}
      readOnly
      wrap={wrap}
      placeholder={error ?? ''}
    />
  );

  return (
    <>
      <ToolHeader
        slug="text"
        actions={
          <>
            <IconAction icon={RefreshCw} label={t.regenerate} onClick={() => setRun(run + 1)} />
            <CopyButton getText={() => text} disabled={!text} />
            <IconAction
              icon={Download}
              label={common.download}
              disabled={!text}
              onClick={() => downloadFile(text, options.html ? 'lorem.html' : 'lorem.txt')}
            />
          </>
        }
      >
        {picker}
        <ToolbarDivider />
        <Segmented
          label={t.unit}
          value={options.unit}
          onChange={(unit) =>
            setOptions({ ...options, unit, count: Math.min(options.count, LOREM_LIMITS[unit]) })
          }
          options={LOREM_UNITS.map((value) => ({ value, label: t.units[value] }))}
        />
      </ToolHeader>
      <SplitPane id="text-lorem" first={settingsPane} second={outputPane} defaultRatio={0.3} />
      <StatusBar>
        {error && <StatusItem tone="danger">{error}</StatusItem>}
        {text && (
          <StatusItem className="shrink-0">
            {fmt(t.wordCount, { count: formatNumber(words) })}
          </StatusItem>
        )}
      </StatusBar>
    </>
  );
}
