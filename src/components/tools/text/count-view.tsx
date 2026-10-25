'use client';

import { useMemo, useState } from 'react';
import { READING_WPM, SPEAKING_WPM, countText, type TextCounts } from '@/lib/tools/text/count';
import { ToolHeader } from '@/components/tools/workbench/toolbar';
import { SplitPane } from '@/components/tools/workbench/split-pane';
import { CursorStatus, StatusBar, StatusItem } from '@/components/tools/workbench/status-bar';
import type { CursorInfo } from '@/components/tools/workbench/code-editor';
import { useLiveInput } from '@/components/tools/workbench/use-live-input';
import { PartHeading } from '@/components/tools/jwt/parts';
import { useFormatNumber } from '@/components/tools/generate/parts';
import { useToolMessages } from '@/i18n/tools/provider';
import { useLocale } from '@/i18n/use-locale';
import { fmt } from '@/i18n/dictionary';
import { InputActions, InputPane, useInput } from './parts';

const COUNTERS = [
  'words',
  'characters',
  'graphemes',
  'lines',
  'sentences',
  'paragraphs',
  'bytes',
  'utf16',
  'whitespace',
] as const satisfies (keyof TextCounts)[];

/** Characters, words, lines, bytes and reading time for the input. */
export function CountView({ picker }: { picker: React.ReactNode }) {
  const t = useToolMessages<'text'>();
  const locale = useLocale();
  const formatNumber = useFormatNumber();
  const input = useInput();
  const [cursor, setCursor] = useState<CursorInfo | null>(null);
  const { value: live } = useLiveInput(input.input);
  const counts = useMemo(() => countText(live, locale), [live, locale]);

  const duration = (seconds: number) =>
    seconds < 60
      ? fmt(t.seconds, { seconds: formatNumber(seconds) })
      : fmt(t.minutesSeconds, {
          minutes: formatNumber(Math.floor(seconds / 60)),
          seconds: formatNumber(seconds % 60),
        });

  const statsPane = (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      <PartHeading>{t.statistics}</PartHeading>
      <div className="min-h-0 flex-1 overflow-auto p-3">
        <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-md border border-line bg-line sm:grid-cols-3">
          {COUNTERS.map((key) => (
            <div key={key} className="bg-surface px-3 py-2" title={t.counterHints[key]}>
              <dt className="truncate text-[11px] text-fg-subtle">{t.counters[key]}</dt>
              <dd className="font-mono text-lg font-semibold text-fg tabular-nums">
                {formatNumber(counts[key])}
              </dd>
            </div>
          ))}
        </dl>
        <dl className="mt-3 grid grid-cols-2 gap-px overflow-hidden rounded-md border border-line bg-line">
          <div className="bg-surface px-3 py-2">
            <dt className="text-[11px] text-fg-subtle">{t.readingTime}</dt>
            <dd className="text-sm font-semibold text-fg">{duration(counts.readingSeconds)}</dd>
          </div>
          <div className="bg-surface px-3 py-2">
            <dt className="text-[11px] text-fg-subtle">{t.speakingTime}</dt>
            <dd className="text-sm font-semibold text-fg">{duration(counts.speakingSeconds)}</dd>
          </div>
        </dl>
        <p className="mt-3 text-[11px] text-fg-subtle">
          {fmt(t.timeHint, {
            reading: formatNumber(READING_WPM),
            speaking: formatNumber(SPEAKING_WPM),
          })}
        </p>
      </div>
    </div>
  );

  return (
    <>
      <ToolHeader slug="text" actions={<InputActions input={input} />}>
        {picker}
      </ToolHeader>
      <SplitPane
        id="text-count"
        first={<InputPane input={input} onCursor={setCursor} />}
        second={statsPane}
      />
      <StatusBar>
        {input.file.error && <StatusItem tone="danger">{input.file.error}</StatusItem>}
        <StatusItem className="shrink-0">
          {fmt(t.wordCount, { count: formatNumber(counts.words) })}
        </StatusItem>
        <div className="hidden sm:contents">
          <CursorStatus cursor={cursor} />
        </div>
      </StatusBar>
    </>
  );
}
