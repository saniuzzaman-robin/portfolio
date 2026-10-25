'use client';

import { useMemo, useState } from 'react';
import { CASES, convertCase } from '@/lib/tools/text/case';
import { SLUG_SEPARATORS, slugifyLines, type SlugSeparator } from '@/lib/tools/text/slug';
import { CopyButton, ToolHeader, ToolbarDivider } from '@/components/tools/workbench/toolbar';
import { OptionsPopover, SelectField, Toggle } from '@/components/tools/workbench/options-popover';
import { SplitPane } from '@/components/tools/workbench/split-pane';
import { CursorStatus, StatusBar, StatusItem } from '@/components/tools/workbench/status-bar';
import type { CursorInfo } from '@/components/tools/workbench/code-editor';
import { useLiveInput } from '@/components/tools/workbench/use-live-input';
import { PartHeading } from '@/components/tools/jwt/parts';
import { useToolMessages } from '@/i18n/tools/provider';
import type { ToolMessages } from '@/i18n/tools/en';
import { fmt } from '@/i18n/dictionary';
import { useFormatNumber } from '@/components/tools/generate/parts';
import { splitLines } from '@/lib/tools/text/lines';
import { InputActions, InputPane, useInput } from './parts';
import { useSlugOptions } from './state';

/** Longer results are cut in the preview (copy still takes everything). */
const PREVIEW_CHARS = 10_000;

const SEPARATOR_KEYS: Record<SlugSeparator, keyof ToolMessages['text']['slugSeparators']> = {
  '-': 'hyphen',
  _: 'underscore',
  '.': 'period',
};

/** Every case style (and a slug) of the input at once, each with its own copy button. */
export function CaseView({ picker }: { picker: React.ReactNode }) {
  const t = useToolMessages<'text'>();
  const formatNumber = useFormatNumber();
  const input = useInput();
  const [slugOptions, setSlugOptions] = useSlugOptions();
  const [cursor, setCursor] = useState<CursorInfo | null>(null);
  const { value: live } = useLiveInput(input.input);

  const rows = useMemo(
    () => [
      ...CASES.map((kind) => ({ key: kind, label: t.cases[kind], value: convertCase(live, kind) })),
      { key: 'slug', label: t.slug, value: slugifyLines(live, slugOptions) },
    ],
    [live, slugOptions, t]
  );
  const lines = live === '' ? 0 : splitLines(live).lines.length;

  const outputPane = (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      <PartHeading>{t.conversions}</PartHeading>
      <div className="min-h-0 flex-1 overflow-auto">
        {live === '' ? (
          <p className="p-3 text-xs text-fg-subtle">{t.caseEmpty}</p>
        ) : (
          rows.map((row) => (
            <section key={row.key} className="border-b border-line">
              <div className="flex items-center gap-2 ps-3 pe-1 pt-1">
                <h3 className="min-w-0 flex-1 truncate text-[11px] font-semibold text-fg-muted">
                  {row.label}
                </h3>
                <CopyButton getText={() => row.value} disabled={!row.value} />
              </div>
              <pre
                dir="ltr"
                className="max-h-40 overflow-auto px-3 pb-2 text-start font-mono text-xs break-all whitespace-pre-wrap text-fg"
              >
                {row.value.length > PREVIEW_CHARS
                  ? `${row.value.slice(0, PREVIEW_CHARS)}…`
                  : row.value}
              </pre>
            </section>
          ))
        )}
      </div>
      <p className="shrink-0 border-t border-line bg-surface px-3 py-1.5 text-[11px] text-fg-subtle">
        {t.caseHint}
      </p>
    </div>
  );

  return (
    <>
      <ToolHeader
        slug="text"
        actions={
          <>
            <InputActions input={input} />
            <ToolbarDivider />
            <OptionsPopover>
              <SelectField
                label={t.slugSeparator}
                value={SEPARATOR_KEYS[slugOptions.separator]}
                onChange={(key) => {
                  const separator = SLUG_SEPARATORS.find((value) => SEPARATOR_KEYS[value] === key);
                  if (separator) setSlugOptions({ ...slugOptions, separator });
                }}
                options={SLUG_SEPARATORS.map((value) => ({
                  value: SEPARATOR_KEYS[value],
                  label: t.slugSeparators[SEPARATOR_KEYS[value]],
                }))}
              />
              <Toggle
                label={t.slugLowercase}
                checked={slugOptions.lowercase}
                onChange={(lowercase) => setSlugOptions({ ...slugOptions, lowercase })}
              />
            </OptionsPopover>
          </>
        }
      >
        {picker}
      </ToolHeader>
      <SplitPane
        id="text-case"
        first={<InputPane input={input} onCursor={setCursor} />}
        second={outputPane}
      />
      <StatusBar>
        {input.file.error && <StatusItem tone="danger">{input.file.error}</StatusItem>}
        <StatusItem className="shrink-0">
          {fmt(t.lineCount, { count: formatNumber(lines) })}
        </StatusItem>
        <div className="hidden sm:contents">
          <CursorStatus cursor={cursor} />
        </div>
      </StatusBar>
    </>
  );
}
