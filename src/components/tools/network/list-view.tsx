'use client';

import { useMemo, useRef, useState } from 'react';
import { CircleAlert, Eraser } from 'lucide-react';
import { parseIp } from '@/lib/tools/network/ip';
import { containsAddress, formatCidr } from '@/lib/tools/network/cidr';
import { findOverlaps, parseCidrList, type ListEntry } from '@/lib/tools/network/subnet';
import {
  CodeEditor,
  type CodeEditorHandle,
  type CursorInfo,
  type EditorDiagnostic,
} from '@/components/tools/workbench/code-editor';
import { IconAction, ToolHeader } from '@/components/tools/workbench/toolbar';
import { SplitPane } from '@/components/tools/workbench/split-pane';
import { CursorStatus, StatusBar, StatusItem } from '@/components/tools/workbench/status-bar';
import { useLiveInput } from '@/components/tools/workbench/use-live-input';
import { TextField } from '@/components/tools/crypto/parts';
import { PartHeading, StateBadge } from '@/components/tools/jwt/parts';
import { Note } from '@/components/tools/time/parts';
import { useToolCommon, useToolMessages } from '@/i18n/tools/provider';
import { fmt } from '@/i18n/dictionary';
import { useCidrList, useLookup } from './state';

/** Bounds the pair list for pathological inputs (thousands of nested blocks). */
const MAX_OVERLAPS = 500;

/** A list of blocks: which contain a given address, and which overlap each other. */
export function ListView({ picker }: { picker: React.ReactNode }) {
  const common = useToolCommon();
  const t = useToolMessages<'network'>();
  const editorRef = useRef<CodeEditorHandle>(null);
  const [list, setList] = useCidrList();
  const [lookup, setLookup] = useLookup();
  const [cursor, setCursor] = useState<CursorInfo | null>(null);
  const { value: live } = useLiveInput(list);

  const parsed = useMemo(() => parseCidrList(live), [live]);
  const { overlaps, truncated } = useMemo(
    () => findOverlaps(parsed.entries, MAX_OVERLAPS),
    [parsed]
  );
  const diagnostics = useMemo(
    (): EditorDiagnostic[] =>
      parsed.errors.map((error) => ({ ...error, severity: 'error' as const })),
    [parsed]
  );

  const address = lookup.trim() ? parseIp(lookup) : null;
  const containing = address?.ok
    ? parsed.entries.filter((entry) =>
        containsAddress(entry.cidr, address.value.version, address.value.value)
      )
    : [];

  const reveal = (entry: { from: number; to: number }) =>
    editorRef.current?.reveal(entry.from, entry.to);

  const entryButton = (entry: ListEntry) => (
    <button
      type="button"
      onClick={() => reveal(entry)}
      title={fmt(t.jumpTo, { line: entry.line })}
      className="inline-flex min-w-0 cursor-pointer items-baseline gap-1.5 rounded text-start hover:text-primary-text focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
    >
      <span className="shrink-0 text-[10px] text-fg-subtle">
        {fmt(t.line, { line: entry.line })}
      </span>
      <span dir="ltr" className="font-mono break-all">
        {formatCidr(entry.cidr)}
      </span>
    </button>
  );

  const editorPane = (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      <PartHeading>{t.listLabel}</PartHeading>
      <CodeEditor
        ref={editorRef}
        value={list}
        onChange={setList}
        label={t.listLabel}
        placeholder={t.listPlaceholder}
        diagnostics={diagnostics}
        onCursor={setCursor}
        autoFocus
      />
    </div>
  );

  const resultsPane = (
    <div className="min-h-0 min-w-0 flex-1 overflow-auto">
      <section>
        <PartHeading>{t.lookup}</PartHeading>
        <div className="space-y-2 p-3 text-xs">
          <TextField
            label={t.lookupLabel}
            value={lookup}
            onChange={setLookup}
            placeholder={t.lookupPlaceholder}
            invalid={address?.ok === false}
          >
            <IconAction
              icon={Eraser}
              label={common.clear}
              onClick={() => setLookup('')}
              disabled={!lookup}
            />
          </TextField>
          {address?.ok === false && <Note tone="danger">{address.message}</Note>}
          {address?.ok &&
            (containing.length > 0 ? (
              <>
                <Note>{fmt(t.containedIn, { count: containing.length })}</Note>
                <ul className="space-y-1 text-fg">
                  {containing.map((entry) => (
                    <li key={entry.line}>{entryButton(entry)}</li>
                  ))}
                </ul>
              </>
            ) : (
              <Note tone="warning">{t.notContained}</Note>
            ))}
        </div>
      </section>
      <section>
        <PartHeading>{fmt(t.overlapsHeading, { count: overlaps.length })}</PartHeading>
        <div className="p-3 text-xs">
          {overlaps.length === 0 ? (
            <Note>{parsed.entries.length ? t.noOverlaps : t.empty}</Note>
          ) : (
            <ul className="divide-y divide-line">
              {overlaps.map((overlap) => (
                <li
                  key={`${overlap.outer.line}-${overlap.inner.line}`}
                  className="flex flex-wrap items-center gap-x-2 gap-y-1 py-1.5 text-fg"
                >
                  {entryButton(overlap.outer)}
                  <StateBadge tone={overlap.relation === 'duplicate' ? 'danger' : 'warning'}>
                    {t.relations[overlap.relation]}
                  </StateBadge>
                  {entryButton(overlap.inner)}
                </li>
              ))}
            </ul>
          )}
          {truncated && <Note>{fmt(t.overlapsTruncated, { count: MAX_OVERLAPS })}</Note>}
        </div>
      </section>
    </div>
  );

  const firstError = parsed.errors[0];
  return (
    <>
      <ToolHeader
        slug="network"
        actions={
          <IconAction
            icon={Eraser}
            label={common.clear}
            onClick={() => setList('')}
            disabled={!list}
          />
        }
      >
        {picker}
      </ToolHeader>
      <SplitPane id="network-list" first={editorPane} second={resultsPane} />
      <StatusBar>
        {firstError && (
          <StatusItem tone="danger" onClick={() => reveal(firstError)} title={firstError.message}>
            <CircleAlert className="size-3 shrink-0" aria-hidden />
            <span className="shrink-0">{fmt(t.invalidLines, { count: parsed.errors.length })}</span>
            <span className="truncate font-sans">
              — {fmt(t.line, { line: firstError.line })}: {firstError.message}
            </span>
          </StatusItem>
        )}
        <StatusItem className="shrink-0">
          {fmt(t.blocks, { count: parsed.entries.length })}
        </StatusItem>
        {overlaps.length > 0 && (
          <StatusItem tone="warning" className="shrink-0">
            {fmt(t.overlapCount, { count: overlaps.length })}
          </StatusItem>
        )}
        <span className="hidden sm:contents">
          <CursorStatus cursor={cursor} />
        </span>
      </StatusBar>
    </>
  );
}
