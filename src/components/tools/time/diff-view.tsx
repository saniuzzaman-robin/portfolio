'use client';

import { useMemo } from 'react';
import { CircleAlert, Clock } from 'lucide-react';
import { formatIso, parseTimeInput, type TimeInput } from '@/lib/tools/time/instant';
import {
  addDuration,
  calendarDifference,
  durationMs,
  formatIsoDuration,
  parseDuration,
  partsToDuration,
  type CalendarParts,
} from '@/lib/tools/time/duration';
import { DAY, HOUR, MINUTE, SECOND, localMs, wallTime, zoneOffset } from '@/lib/tools/time/zone';
import { IconAction, ToolHeader } from '@/components/tools/workbench/toolbar';
import { SplitPane } from '@/components/tools/workbench/split-pane';
import { StatusBar, StatusItem } from '@/components/tools/workbench/status-bar';
import { useDebouncedValue } from '@/components/tools/workbench/use-live-input';
import { useNow } from '@/components/tools/workbench/use-now';
import { DetailList, TextField } from '@/components/tools/crypto/parts';
import { PartHeading } from '@/components/tools/jwt/parts';
import { useToolMessages } from '@/i18n/tools/provider';
import { useLocale } from '@/i18n/use-locale';
import { fmt } from '@/i18n/dictionary';
import { CopyValue, Note, ZoneSelect, resolveZone, translated, useTimeFormats } from './parts';
import { useDiffInputs, useZone } from './state';

const TYPING_DELAY_MS = 150;

type Row = [label: string, value: React.ReactNode];

/** `Intl` unit for each calendar part, largest first. */
const PART_UNITS: [keyof CalendarParts, Intl.NumberFormatOptions['unit']][] = [
  ['years', 'year'],
  ['months', 'month'],
  ['days', 'day'],
  ['hours', 'hour'],
  ['minutes', 'minute'],
  ['seconds', 'second'],
  ['milliseconds', 'millisecond'],
];

const TOTALS = [
  ['weeks', 'week', 7 * DAY],
  ['days', 'day', DAY],
  ['hours', 'hour', HOUR],
  ['minutes', 'minute', MINUTE],
  ['seconds', 'second', SECOND],
  ['milliseconds', 'millisecond', 1],
] as const;

/** "1 year, 2 months, 3 days" in the page's language; zero is "0 seconds". */
function formatParts(parts: CalendarParts, locale: string): string {
  const words = PART_UNITS.filter(([key]) => parts[key]).map(([key, unit]) =>
    new Intl.NumberFormat(locale, { style: 'unit', unit, unitDisplay: 'long' }).format(parts[key])
  );
  if (words.length === 0) {
    return new Intl.NumberFormat(locale, {
      style: 'unit',
      unit: 'second',
      unitDisplay: 'long',
    }).format(0);
  }
  return new Intl.ListFormat(locale, { type: 'unit', style: 'long' }).format(words);
}

/** Two dates (empty = now): their difference, and a duration added to or taken from the start. */
export function DiffView({ picker }: { picker: React.ReactNode }) {
  const t = useToolMessages<'time'>();
  const locale = useLocale();
  const now = useNow();
  const hydrated = now !== null;
  const inputs = useDiffInputs();
  const [zone, setZone] = useZone();
  const start = useDebouncedValue(inputs.start, TYPING_DELAY_MS);
  const end = useDebouncedValue(inputs.end, TYPING_DELAY_MS);
  const durationText = useDebouncedValue(inputs.duration, TYPING_DELAY_MS);
  const timeZone = resolveZone(zone, hydrated);
  const formats = useTimeFormats(timeZone);

  const read = (text: string): TimeInput | null => {
    if (!timeZone || now === null) return null;
    if (!text.trim())
      return { ok: true, kind: 'epoch', instant: { ms: now, nanos: 0, digits: 0 }, unit: 'ms' };
    return parseTimeInput(text, { unit: 'auto', timeZone });
  };
  const startParsed = read(start);
  const endParsed = read(end);
  const duration = useMemo(() => parseDuration(durationText), [durationText]);
  const numbers = new Intl.NumberFormat(locale, { maximumFractionDigits: 3 });

  const differenceRows: Row[] = [];
  const durationRows: Row[] = [];
  if (timeZone && formats && now !== null && startParsed?.ok) {
    const from = startParsed.instant.ms;
    if (endParsed?.ok) {
      const to = endParsed.instant.ms;
      const { sign, parts } = calendarDifference(
        localMs(wallTime(from, timeZone)),
        localMs(wallTime(to, timeZone))
      );
      const signed = (text: string) => (sign < 0 ? `−${text}` : text);
      differenceRows.push(
        [t.calendar, translated(signed(formatParts(parts, locale)))],
        [
          t.isoDuration,
          <CopyValue key="iso" text={formatIsoDuration(partsToDuration(sign, parts))} />,
        ]
      );
      for (const [key, unit, size] of TOTALS) {
        const total = new Intl.NumberFormat(locale, {
          style: 'unit',
          unit,
          unitDisplay: 'long',
          maximumFractionDigits: 3,
        }).format((to - from) / size);
        differenceRows.push([t.totals[key], translated(total)]);
      }
    }

    if (duration.ok) {
      const exact = durationMs(duration.duration);
      durationRows.push([
        t.isoDuration,
        <CopyValue key="iso" text={formatIsoDuration(duration.duration)} />,
      ]);
      durationRows.push([
        t.exactLength,
        translated(exact === null ? t.dependsOnStart : `${numbers.format(exact / SECOND)} s`),
      ]);
      for (const [label, direction] of [
        [t.plusDuration, 1],
        [t.minusDuration, -1],
      ] as const) {
        const result = addDuration(from, duration.duration, direction, timeZone);
        const iso = formatIso(
          { ms: result.ms, nanos: 0, digits: 0 },
          zoneOffset(result.ms, timeZone)
        );
        durationRows.push([
          label,
          <CopyValue key={label} text={iso}>
            {iso}
            <span dir="auto" className="block font-sans text-fg-subtle">
              {formats.full(result.ms)}
            </span>
          </CopyValue>,
        ]);
      }
    }
  }

  const fieldError = (parsed: TimeInput | null) =>
    parsed?.ok === false ? <Note tone="danger">{parsed.message}</Note> : null;

  const inputsPane = (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      <PartHeading>{t.modes.diff}</PartHeading>
      <div className="min-h-0 flex-1 space-y-3 overflow-auto p-3 text-xs">
        <TextField
          label={t.start}
          value={inputs.start}
          onChange={inputs.setStart}
          placeholder={t.datePlaceholder}
          invalid={startParsed?.ok === false}
        >
          <IconAction
            icon={Clock}
            label={t.useNow}
            onClick={() => inputs.setStart(String(Date.now()))}
          />
        </TextField>
        {fieldError(startParsed)}
        <TextField
          label={t.end}
          value={inputs.end}
          onChange={inputs.setEnd}
          placeholder={t.datePlaceholder}
          invalid={endParsed?.ok === false}
        >
          <IconAction
            icon={Clock}
            label={t.useNow}
            onClick={() => inputs.setEnd(String(Date.now()))}
          />
        </TextField>
        {fieldError(endParsed)}
        <TextField
          label={t.duration}
          value={inputs.duration}
          onChange={inputs.setDuration}
          placeholder={t.durationPlaceholder}
          invalid={!duration.ok && durationText.trim() !== ''}
        />
        {!duration.ok && durationText.trim() !== '' && (
          <Note tone="danger">{duration.message}</Note>
        )}
        <ZoneSelect value={zone} onChange={setZone} hydrated={hydrated} />
        <Note>{t.diffHint}</Note>
      </div>
    </div>
  );

  const resultsPane = (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-auto">
      <PartHeading>{t.difference}</PartHeading>
      <div className="p-3">
        {differenceRows.length > 0 ? (
          <DetailList rows={differenceRows} className="items-start" />
        ) : (
          <p className="text-xs text-fg-subtle">{hydrated ? t.fixInput : ' '}</p>
        )}
      </div>
      <PartHeading>{t.duration}</PartHeading>
      <div className="p-3">
        {durationRows.length > 0 ? (
          <DetailList rows={durationRows} className="items-start" />
        ) : (
          <p className="text-xs text-fg-subtle">{hydrated ? t.durationHint : ' '}</p>
        )}
      </div>
    </div>
  );

  const errors =
    [startParsed, endParsed].filter((parsed) => parsed?.ok === false).length +
    (!duration.ok && durationText.trim() !== '' ? 1 : 0);

  return (
    <>
      <ToolHeader slug="time">{picker}</ToolHeader>
      <SplitPane id="time-diff" first={inputsPane} second={resultsPane} />
      <StatusBar>
        {errors > 0 && (
          <StatusItem tone="danger">
            <CircleAlert className="size-3 shrink-0" aria-hidden />
            {fmt(t.errors, { count: numbers.format(errors) })}
          </StatusItem>
        )}
      </StatusBar>
    </>
  );
}
