'use client';

import { useMemo } from 'react';
import { inspectId, type InspectedId } from '@/lib/tools/generate/inspect';
import { relativeTime } from '@/lib/tools/jwt/claims';
import { CodeEditor } from '@/components/tools/workbench/code-editor';
import { RunButton, ToolHeader } from '@/components/tools/workbench/toolbar';
import { SplitPane } from '@/components/tools/workbench/split-pane';
import { StaleStatus, StatusBar, StatusItem } from '@/components/tools/workbench/status-bar';
import {
  RUN_SHORTCUT,
  STALE_OUTPUT_CLASS,
  useRunInput,
} from '@/components/tools/workbench/use-run';
import { cn } from '@/lib/cn';
import { useNow } from '@/components/tools/workbench/use-now';
import { DetailList } from '@/components/tools/crypto/parts';
import { PartHeading, StateBadge } from '@/components/tools/jwt/parts';
import { useToolCommon, useToolMessages } from '@/i18n/tools/provider';
import type { ToolMessages } from '@/i18n/tools/en';
import { useLocale } from '@/i18n/use-locale';
import { fmt } from '@/i18n/dictionary';
import { useFormatNumber } from './parts';
import { useInspectInput } from './state';

type GenerateMessages = ToolMessages['generate'];
type Row = [label: string, value: React.ReactNode];
type Formats = { local: Intl.DateTimeFormat; relative: Intl.RelativeTimeFormat };

/** Lines inspected at most; each one renders a block of details. */
const MAX_LINES = 100;

type Line = { text: string; id: InspectedId | null };

/** Takes apart UUIDs, ULIDs and ObjectIds, one per line: version, variant, embedded time. */
export function InspectView({ picker }: { picker: React.ReactNode }) {
  const t = useToolMessages<'generate'>();
  const common = useToolCommon();
  const formatNumber = useFormatNumber();
  const [input, setInput] = useInspectInput();
  const { value: typed, run, ran, stale } = useRunInput(input);
  const allLines = useMemo(
    () =>
      typed
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean),
    [typed]
  );
  const lines = useMemo(
    (): Line[] => allLines.slice(0, MAX_LINES).map((text) => ({ text, id: inspectId(text) })),
    [allLines]
  );
  const recognized = lines.filter((line) => line.id).length;
  const unrecognized = lines.length - recognized;

  const resultsPane = (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      <PartHeading>{t.details}</PartHeading>
      <div className={cn('min-h-0 flex-1 overflow-auto', stale && STALE_OUTPUT_CLASS)}>
        {lines.length === 0 ? (
          <p className="p-3 text-xs text-fg-subtle">
            {ran
              ? t.inspectEmpty
              : fmt(common.runHint, { action: t.inspectAction, shortcut: RUN_SHORTCUT })}
          </p>
        ) : (
          <ul className="divide-y divide-line">
            {lines.map((line, index) => (
              <li key={index} className="space-y-2 p-3">
                <p dir="ltr" className="text-start font-mono text-xs break-all text-fg">
                  {line.text}
                </p>
                {line.id ? (
                  <Details id={line.id} text={line.text} />
                ) : (
                  <p className="text-xs text-danger">{t.notAnId}</p>
                )}
              </li>
            ))}
          </ul>
        )}
        {allLines.length > MAX_LINES && (
          <p className="p-3 text-xs text-fg-subtle">
            {fmt(t.moreLines, { count: formatNumber(MAX_LINES) })}
          </p>
        )}
      </div>
    </div>
  );

  return (
    <>
      <ToolHeader
        slug="generate"
        actions={<RunButton label={t.inspectAction} onRun={() => run()} pending={stale} />}
      >
        {picker}
      </ToolHeader>
      <SplitPane
        id="generate-inspect"
        first={
          <CodeEditor
            value={input}
            onChange={setInput}
            label={common.input}
            placeholder={t.inspectPlaceholder}
          />
        }
        second={resultsPane}
      />
      <StatusBar>
        {stale && <StaleStatus action={t.inspectAction} onRun={() => run()} />}
        {ran && allLines.length === 0 && (
          <StatusItem tone="danger" className="font-sans">
            {fmt(common.enterInput, { action: t.inspectAction })}
          </StatusItem>
        )}
        {recognized > 0 && (
          <StatusItem tone="success" className="shrink-0">
            {fmt(t.recognized, { count: formatNumber(recognized) })}
          </StatusItem>
        )}
        {unrecognized > 0 && (
          <StatusItem tone="danger" className="shrink-0">
            {fmt(t.unrecognized, { count: formatNumber(unrecognized) })}
          </StatusItem>
        )}
      </StatusBar>
    </>
  );
}

function uuidTitle(t: GenerateMessages, id: Extract<InspectedId, { kind: 'uuid' }>): string {
  if (id.special === 'nil') return t.kinds['uuid-nil'];
  if (id.special === 'max') return t.kinds['uuid-max'];
  if (id.variant !== 'rfc') return 'UUID';
  return fmt(t.uuidVersion, { version: id.version });
}

function versionName(t: GenerateMessages, version: number): string {
  const names: Record<string, string> = t.versions;
  const key = `v${version}`;
  return Object.hasOwn(names, key) ? names[key] : t.unknownVersion;
}

/** Translated text inside the left-to-right value column keeps its own direction. */
const translated = (text: string) => <span dir="auto">{text}</span>;

function Details({ id, text }: { id: InspectedId; text: string }) {
  const t = useToolMessages<'generate'>();
  const locale = useLocale();
  // Local and relative times depend on the viewer's clock and time zone: only after hydration.
  const now = useNow();
  const formats = useMemo(
    (): Formats => ({
      local: new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'long' }),
      relative: new Intl.RelativeTimeFormat(locale, { numeric: 'auto' }),
    }),
    [locale]
  );

  const timeRows = (time: number): Row[] => {
    const date = new Date(time);
    if (Number.isNaN(date.getTime())) return [];
    const rows: Row[] = [[t.time, date.toISOString()]];
    if (now !== null) {
      const { value, unit } = relativeTime(Math.floor(time / 1000), Math.floor(now / 1000));
      rows.push([
        t.localTime,
        <span key="local" dir="auto">
          {formats.local.format(date)} · {formats.relative.format(value, unit)}
        </span>,
      ]);
    }
    return rows;
  };

  let badge: string;
  let rows: Row[];
  if (id.kind === 'uuid') {
    badge = uuidTitle(t, id);
    rows = [];
    if (id.canonical !== text.toLowerCase()) rows.push([t.canonical, id.canonical]);
    if (!id.special && id.variant === 'rfc') {
      rows.push([t.variant, t.variants.rfc], [t.type, translated(versionName(t, id.version))]);
    } else if (!id.special) {
      rows.push([t.variant, translated(t.variants[id.variant])]);
    }
    if (id.time !== null) rows.push(...timeRows(id.time));
    if (id.clockSeq !== null) rows.push([t.clockSeq, String(id.clockSeq)]);
    if (id.node !== null) {
      // Bit 0 of the first node byte is the multicast bit: set for random nodes (RFC 9562 §6.10).
      const random = parseInt(id.node.slice(0, 2), 16) & 1;
      rows.push([
        t.node,
        <span key="node">
          {id.node} · <span dir="auto">{random ? t.randomNode : t.macNode}</span>
        </span>,
      ]);
    }
  } else if (id.kind === 'ulid') {
    badge = 'ULID';
    rows = [...timeRows(id.time), [t.randomness, id.randomness], [t.asUuid, id.uuid]];
  } else {
    badge = 'ObjectId';
    rows = [...timeRows(id.time), [t.randomValue, id.random], [t.counter, String(id.counter)]];
  }

  return (
    <>
      <StateBadge tone="muted">{badge}</StateBadge>
      {rows.length > 0 && <DetailList rows={rows} />}
    </>
  );
}
