'use client';

import { useMemo } from 'react';
import { CircleAlert, Clock, Eraser } from 'lucide-react';
import {
  dayOfYear,
  epochValues,
  formatIso,
  formatRfc2822,
  isoWeek,
  parseTimeInput,
  type Instant,
} from '@/lib/tools/time/instant';
import { formatOffset, wallTime, zoneOffset } from '@/lib/tools/time/zone';
import {
  CopyButton,
  IconAction,
  RunButton,
  ToolHeader,
} from '@/components/tools/workbench/toolbar';
import { SplitPane } from '@/components/tools/workbench/split-pane';
import { StaleStatus, StatusBar, StatusItem } from '@/components/tools/workbench/status-bar';
import { RUN_SHORTCUT, STALE_OUTPUT_CLASS, useApplied } from '@/components/tools/workbench/use-run';
import { cn } from '@/lib/cn';
import { useNow } from '@/components/tools/workbench/use-now';
import { DetailList, TextField } from '@/components/tools/crypto/parts';
import { PartHeading } from '@/components/tools/jwt/parts';
import { useToolCommon, useToolMessages } from '@/i18n/tools/provider';
import { fmt } from '@/i18n/dictionary';
import {
  CopyValue,
  Note,
  SelectRow,
  ZoneSelect,
  resolveZone,
  translated,
  useTimeFormats,
} from './parts';
import { useConvertInput, useUnit, useZone, type UnitOption } from './state';

const UNIT_OPTIONS: UnitOption[] = ['auto', 's', 'ms', 'us', 'ns'];

type Row = [label: string, value: React.ReactNode];

/** Epoch ↔ date in one input: a number is a timestamp, anything else is read as a date. */
export function ConvertView({ picker }: { picker: React.ReactNode }) {
  const t = useToolMessages<'time'>();
  const common = useToolCommon();
  const now = useNow();
  const hydrated = now !== null;
  const [input, setInput] = useConvertInput();
  const [unit, setUnit] = useUnit();
  const [zone, setZone] = useZone();
  // Nothing converts until Convert (or Ctrl/⌘+Enter); the field only validates as you type.
  const { applied, apply, stale } = useApplied({ input, unit, zone });
  const timeZone = resolveZone(zone, hydrated);
  const appliedZone = resolveZone(applied?.zone ?? zone, hydrated);
  const formats = useTimeFormats(appliedZone);
  const utc = useTimeFormats('UTC');

  const draft = useMemo(
    () => (input.trim() && timeZone ? parseTimeInput(input, { unit, timeZone }) : null),
    [input, unit, timeZone]
  );
  const appliedText = applied?.input ?? '';
  const parsed = useMemo(
    () =>
      applied && appliedText.trim() && appliedZone
        ? parseTimeInput(appliedText, { unit: applied.unit, timeZone: appliedZone })
        : null,
    [applied, appliedText, appliedZone]
  );
  // An empty input follows the clock.
  let instant: Instant | null = null;
  if (parsed?.ok) instant = parsed.instant;
  else if (applied && !parsed && now !== null && !appliedText.trim()) {
    instant = { ms: now, nanos: 0, digits: 0 };
  }
  const timeZoneForRows = appliedZone;

  const rows: Row[] = [];
  if (instant && timeZoneForRows && formats && utc && now !== null) {
    const epoch = epochValues(instant);
    const offset = zoneOffset(instant.ms, timeZoneForRows);
    const wall = wallTime(instant.ms, timeZoneForRows);
    const week = isoWeek(wall);
    const value = (text: string) => <CopyValue text={text} />;
    const text = (content: string) => <CopyValue text={content}>{translated(content)}</CopyValue>;
    rows.push(
      [t.rows.seconds, value(epoch.s)],
      [t.rows.milliseconds, value(epoch.ms)],
      [t.rows.microseconds, value(epoch.us)],
      [t.rows.nanoseconds, value(epoch.ns)],
      [t.rows.isoUtc, value(formatIso(instant))],
      [fmt(t.rows.isoZone, { zone: timeZoneForRows }), value(formatIso(instant, offset))],
      [t.rows.rfc2822, value(formatRfc2822(instant.ms, offset))],
      [fmt(t.rows.zoned, { zone: timeZoneForRows }), text(formats.full(instant.ms))],
      [t.rows.utc, text(utc.full(instant.ms))],
      [t.rows.relative, text(formats.relative(instant.ms, now))],
      [t.rows.offset, value(formatOffset(offset))],
      [t.rows.dayOfYear, value(String(dayOfYear(wall)))],
      [t.rows.isoWeek, value(`${week.year}-W${String(week.week).padStart(2, '0')}`)]
    );
  }

  const nowPane = (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      <PartHeading
        actions={
          <CopyButton getText={() => String(Math.floor((now ?? 0) / 1000))} disabled={!hydrated} />
        }
      >
        {t.now}
      </PartHeading>
      <div className="shrink-0 border-b border-line px-3 py-2" dir="ltr">
        <p className="text-start font-mono text-2xl text-fg tabular-nums" aria-live="off">
          {hydrated ? Math.floor(now / 1000) : '—'}
        </p>
        <p className="text-start font-mono text-xs text-fg-subtle tabular-nums">
          {hydrated ? `${now} ms` : ' '}
        </p>
      </div>
      <PartHeading>{t.input}</PartHeading>
      <div className="min-h-0 flex-1 space-y-3 overflow-auto p-3 text-xs">
        <TextField
          label={t.value}
          value={input}
          onChange={setInput}
          placeholder={t.inputPlaceholder}
          invalid={draft?.ok === false}
        >
          <IconAction
            icon={Clock}
            label={t.useNow}
            onClick={() => {
              const next = String(Date.now());
              setInput(next);
              apply({ input: next, unit, zone });
            }}
          />
          <IconAction
            icon={Eraser}
            label={t.followClock}
            onClick={() => {
              setInput('');
              apply({ input: '', unit, zone });
            }}
            disabled={!input}
          />
        </TextField>
        <SelectRow
          label={t.unit}
          value={unit}
          onChange={setUnit}
          options={UNIT_OPTIONS.map((value) => ({ value, label: t.units[value] }))}
        />
        <ZoneSelect value={zone} onChange={setZone} hydrated={hydrated} />
        <Note>{t.inputHint}</Note>
        {draft?.ok === false && <Note tone="danger">{draft.message}</Note>}
        {draft?.ok && draft.kind === 'date' && draft.resolution === 'gap' && timeZone && (
          <Note tone="warning">{fmt(t.gapNote, { zone: timeZone })}</Note>
        )}
        {draft?.ok && draft.kind === 'date' && draft.resolution === 'overlap' && timeZone && (
          <Note tone="warning">{fmt(t.overlapNote, { zone: timeZone })}</Note>
        )}
      </div>
    </div>
  );

  const resultsPane = (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      <PartHeading>{t.results}</PartHeading>
      <div className={cn('min-h-0 flex-1 overflow-auto p-3', stale && STALE_OUTPUT_CLASS)}>
        {rows.length > 0 ? (
          <DetailList rows={rows} className="items-start" />
        ) : (
          <p className="text-xs text-fg-subtle">
            {!applied
              ? fmt(common.runHint, { action: t.convertAction, shortcut: RUN_SHORTCUT })
              : parsed?.ok === false
                ? t.fixInput
                : ' '}
          </p>
        )}
      </div>
    </div>
  );

  let status: React.ReactNode = null;
  if (parsed?.ok === false) {
    status = (
      <StatusItem tone="danger" title={parsed.message}>
        <CircleAlert className="size-3 shrink-0" aria-hidden />
        <span className="truncate font-sans">{parsed.message}</span>
      </StatusItem>
    );
  } else if (parsed?.ok) {
    status = (
      <StatusItem tone="success">
        {parsed.kind === 'epoch' ? fmt(t.readAs, { unit: t.units[parsed.unit] }) : t.readAsDate}
      </StatusItem>
    );
  } else if (applied && hydrated) {
    status = <StatusItem>{t.showingNow}</StatusItem>;
  }

  return (
    <>
      <ToolHeader
        slug="time"
        actions={<RunButton label={t.convertAction} onRun={() => apply()} pending={stale} />}
      >
        {picker}
      </ToolHeader>
      <SplitPane id="time-convert" first={nowPane} second={resultsPane} />
      <StatusBar>
        {stale && <StaleStatus action={t.convertAction} onRun={() => apply()} />}
        {status}
      </StatusBar>
    </>
  );
}
