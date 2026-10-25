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
import { CopyButton, IconAction, ToolHeader } from '@/components/tools/workbench/toolbar';
import { SplitPane } from '@/components/tools/workbench/split-pane';
import { StatusBar, StatusItem } from '@/components/tools/workbench/status-bar';
import { useDebouncedValue } from '@/components/tools/workbench/use-live-input';
import { useNow } from '@/components/tools/workbench/use-now';
import { DetailList, TextField } from '@/components/tools/crypto/parts';
import { PartHeading } from '@/components/tools/jwt/parts';
import { useToolMessages } from '@/i18n/tools/provider';
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

const TYPING_DELAY_MS = 150;
const UNIT_OPTIONS: UnitOption[] = ['auto', 's', 'ms', 'us', 'ns'];

type Row = [label: string, value: React.ReactNode];

/** Epoch ↔ date in one input: a number is a timestamp, anything else is read as a date. */
export function ConvertView({ picker }: { picker: React.ReactNode }) {
  const t = useToolMessages<'time'>();
  const now = useNow();
  const hydrated = now !== null;
  const [input, setInput] = useConvertInput();
  const [unit, setUnit] = useUnit();
  const [zone, setZone] = useZone();
  const typed = useDebouncedValue(input, TYPING_DELAY_MS);
  const timeZone = resolveZone(zone, hydrated);
  const formats = useTimeFormats(timeZone);
  const utc = useTimeFormats('UTC');

  const parsed = useMemo(
    () => (typed.trim() && timeZone ? parseTimeInput(typed, { unit, timeZone }) : null),
    [typed, unit, timeZone]
  );
  // An empty input follows the clock.
  let instant: Instant | null = null;
  if (parsed?.ok) instant = parsed.instant;
  else if (!parsed && now !== null && !typed.trim()) instant = { ms: now, nanos: 0, digits: 0 };

  const rows: Row[] = [];
  if (instant && timeZone && formats && utc && now !== null) {
    const epoch = epochValues(instant);
    const offset = zoneOffset(instant.ms, timeZone);
    const wall = wallTime(instant.ms, timeZone);
    const week = isoWeek(wall);
    const value = (text: string) => <CopyValue text={text} />;
    const text = (content: string) => <CopyValue text={content}>{translated(content)}</CopyValue>;
    rows.push(
      [t.rows.seconds, value(epoch.s)],
      [t.rows.milliseconds, value(epoch.ms)],
      [t.rows.microseconds, value(epoch.us)],
      [t.rows.nanoseconds, value(epoch.ns)],
      [t.rows.isoUtc, value(formatIso(instant))],
      [fmt(t.rows.isoZone, { zone: timeZone }), value(formatIso(instant, offset))],
      [t.rows.rfc2822, value(formatRfc2822(instant.ms, offset))],
      [fmt(t.rows.zoned, { zone: timeZone }), text(formats.full(instant.ms))],
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
          invalid={parsed?.ok === false}
        >
          <IconAction icon={Clock} label={t.useNow} onClick={() => setInput(String(Date.now()))} />
          <IconAction
            icon={Eraser}
            label={t.followClock}
            onClick={() => setInput('')}
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
        {parsed?.ok === false && <Note tone="danger">{parsed.message}</Note>}
        {parsed?.ok && parsed.kind === 'date' && parsed.resolution === 'gap' && timeZone && (
          <Note tone="warning">{fmt(t.gapNote, { zone: timeZone })}</Note>
        )}
        {parsed?.ok && parsed.kind === 'date' && parsed.resolution === 'overlap' && timeZone && (
          <Note tone="warning">{fmt(t.overlapNote, { zone: timeZone })}</Note>
        )}
      </div>
    </div>
  );

  const resultsPane = (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      <PartHeading>{t.results}</PartHeading>
      <div className="min-h-0 flex-1 overflow-auto p-3">
        {rows.length > 0 ? (
          <DetailList rows={rows} className="items-start" />
        ) : (
          <p className="text-xs text-fg-subtle">{parsed?.ok === false ? t.fixInput : ' '}</p>
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
  } else if (hydrated) {
    status = <StatusItem>{t.showingNow}</StatusItem>;
  }

  return (
    <>
      <ToolHeader slug="time">{picker}</ToolHeader>
      <SplitPane id="time-convert" first={nowPane} second={resultsPane} />
      <StatusBar>{status}</StatusBar>
    </>
  );
}
