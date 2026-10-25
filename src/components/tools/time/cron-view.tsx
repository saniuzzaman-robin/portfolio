'use client';

import { useId, useMemo } from 'react';
import {
  FIELD_ORDERS,
  parseCron,
  switchSyntax,
  type CronField,
  type DayRule,
  type ParsedField,
} from '@/lib/tools/time/cron';
import { describeCron } from '@/lib/tools/time/describe';
import { nextRuns } from '@/lib/tools/time/schedule';
import { formatIso } from '@/lib/tools/time/instant';
import { zoneOffset } from '@/lib/tools/time/zone';
import { ToolHeader } from '@/components/tools/workbench/toolbar';
import { Toggle } from '@/components/tools/workbench/options-popover';
import { SplitPane } from '@/components/tools/workbench/split-pane';
import { StatusBar, StatusItem, ValidityStatus } from '@/components/tools/workbench/status-bar';
import { useDebouncedValue } from '@/components/tools/workbench/use-live-input';
import { useAsyncResult } from '@/components/tools/workbench/use-async-result';
import { useNow } from '@/components/tools/workbench/use-now';
import { TextField } from '@/components/tools/crypto/parts';
import { PartHeading, StateBadge } from '@/components/tools/jwt/parts';
import { useToolMessages } from '@/i18n/tools/provider';
import type { ToolMessages } from '@/i18n/tools/en';
import { useLocale } from '@/i18n/use-locale';
import { fmt } from '@/i18n/dictionary';
import { Note, SelectRow, ZoneSelect, resolveZone, useTimeFormats } from './parts';
import { RUN_COUNTS, useCronInput, useQuartz, useRunCount, useZone } from './state';

type TimeMessages = ToolMessages['time'];

const TYPING_DELAY_MS = 150;
/** Values listed per field before "+N more". */
const MAX_VALUES = 12;

const PRESETS = {
  everyMinute: ['* * * * *', '0 * * * * ?'],
  every5: ['*/5 * * * *', '0 */5 * * * ?'],
  hourly: ['0 * * * *', '0 0 * * * ?'],
  daily: ['0 0 * * *', '0 0 0 * * ?'],
  weekdays: ['0 9 * * MON-FRI', '0 0 9 ? * MON-FRI'],
  weekly: ['0 0 * * SUN', '0 0 0 ? * SUN'],
  monthly: ['0 0 1 * *', '0 0 0 1 * ?'],
  lastWeekday: [null, '0 0 18 LW * ?'],
  yearly: ['0 0 1 1 *', '0 0 0 1 1 ?'],
} as const satisfies Record<string, readonly [string | null, string]>;
type Preset = keyof typeof PRESETS;

/** Explains cron expressions: a field-by-field builder, a sentence and the next runs. */
export function CronView({ picker }: { picker: React.ReactNode }) {
  const t = useToolMessages<'time'>();
  const locale = useLocale();
  const now = useNow();
  const hydrated = now !== null;
  const [expression, setExpression] = useCronInput();
  const [quartz, setQuartz] = useQuartz();
  const [count, setCount] = useRunCount();
  const [zone, setZone] = useZone();
  const typed = useDebouncedValue(expression, TYPING_DELAY_MS);
  const timeZone = resolveZone(zone, hydrated);
  const formats = useTimeFormats(timeZone);
  const parsed = useMemo(() => parseCron(typed, { quartz }), [typed, quartz]);
  const cron = parsed.ok ? parsed.cron : null;

  const describeTask = useMemo(
    () => (cron ? () => describeCron(cron.expanded, { locale, quartz }) : null),
    [cron, locale, quartz]
  );
  const { value: description, error: describeError } = useAsyncResult(describeTask);

  // Recomputed once a second with the clock; the search itself is a few hundred steps.
  const second = now === null ? null : Math.floor(now / 1000);
  const schedule = useMemo(
    () =>
      cron && timeZone && second !== null
        ? nextRuns(cron, second * 1000, Number(count), timeZone)
        : null,
    [cron, timeZone, second, count]
  );

  // Builder rows come from the typed fields, so a field with an error can still be edited.
  const tokens = cron
    ? cron.expanded.split(' ')
    : typed.trim().startsWith('@')
      ? []
      : typed.trim().split(/\s+/);
  const order = FIELD_ORDERS[`${quartz ? 'quartz' : 'unix'}${tokens.length}`];
  const editField = (index: number, value: string) => {
    const next = [...tokens];
    // A field can't be empty or hold spaces without changing the field count.
    next[index] = value.replace(/\s/g, '') || '*';
    setExpression(next.join(' '));
  };

  const toggleQuartz = (next: boolean) => {
    if (cron && !cron.macro) {
      const converted = switchSyntax(cron, next);
      if (converted) setExpression(converted);
    }
    setQuartz(next);
  };

  const presetOptions = (Object.keys(PRESETS) as Preset[])
    .filter((preset) => PRESETS[preset][quartz ? 1 : 0] !== null)
    .map((preset) => ({ value: preset, label: t.presets[preset] }));

  const inputPane = (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      <PartHeading>{t.expression}</PartHeading>
      <div className="min-h-0 flex-1 space-y-3 overflow-auto p-3 text-xs">
        <TextField
          label={t.expression}
          value={expression}
          onChange={setExpression}
          placeholder={quartz ? '0 */15 9-17 ? * MON-FRI' : '*/15 9-17 * * MON-FRI'}
          invalid={!parsed.ok}
        />
        {!parsed.ok && <Note tone="danger">{parsed.error.message}</Note>}
        <SelectRow<Preset | ''>
          label={t.preset}
          value=""
          onChange={(preset) =>
            preset && setExpression(PRESETS[preset][quartz ? 1 : 0] ?? expression)
          }
          options={[{ value: '', label: t.choosePreset }, ...presetOptions]}
        />
        <Toggle label={t.quartz} hint={t.quartzHint} checked={quartz} onChange={toggleQuartz} />
        {order && (
          <FieldTable
            order={order}
            tokens={tokens}
            fields={cron?.fields}
            errorField={parsed.ok ? undefined : parsed.error.field}
            onEdit={editField}
          />
        )}
      </div>
    </div>
  );

  const runsPane = (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      <PartHeading>{t.description}</PartHeading>
      <p
        dir="auto"
        lang={description && locale === 'bn' ? 'en' : undefined}
        className="shrink-0 border-b border-line p-3 text-sm text-fg"
      >
        {cron ? (description ?? (describeError ? t.describeFailed : ' ')) : t.fixExpression}
      </p>
      <PartHeading>{t.nextRuns}</PartHeading>
      <div className="shrink-0 space-y-2 border-b border-line p-3 text-xs">
        <ZoneSelect value={zone} onChange={setZone} hydrated={hydrated} />
        <SelectRow
          label={t.show}
          value={count}
          onChange={setCount}
          options={RUN_COUNTS.map((value) => ({ value, label: fmt(t.runCount, { count: value }) }))}
        />
      </div>
      <div className="min-h-0 flex-1 overflow-auto">
        {schedule && formats && now !== null && timeZone && (
          <>
            <ol className="divide-y divide-line text-xs">
              {schedule.runs.map((run, index) => (
                <li key={run.ms} className="flex items-start gap-3 px-3 py-1.5">
                  <span className="w-5 shrink-0 pt-px text-end font-mono text-fg-subtle tabular-nums">
                    {index + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p dir="auto" className="text-fg">
                      {formats.full(run.ms)}
                    </p>
                    <p dir="ltr" className="text-start font-mono text-fg-subtle">
                      {formatIso({ ms: run.ms, nanos: 0, digits: 0 }, zoneOffset(run.ms, timeZone))}
                      {' · '}
                      <span dir="auto" className="font-sans">
                        {formats.relative(run.ms, now)}
                      </span>
                    </p>
                  </div>
                  {run.dst && (
                    <StateBadge tone="warning">
                      {run.dst === 'shifted' ? t.shifted : t.repeated}
                    </StateBadge>
                  )}
                </li>
              ))}
            </ol>
            <div className="space-y-1 p-3">
              {schedule.exhausted && (
                <Note tone="warning">{schedule.runs.length ? t.noMoreRuns : t.neverRuns}</Note>
              )}
              <Note>{t.dstNote}</Note>
            </div>
          </>
        )}
      </div>
    </div>
  );

  const nextRun = schedule?.runs[0];
  return (
    <>
      <ToolHeader slug="time">{picker}</ToolHeader>
      <SplitPane id="time-cron" first={inputPane} second={runsPane} />
      <StatusBar>
        <ValidityStatus
          error={
            parsed.ok
              ? null
              : { message: parsed.error.message, line: 1, col: parsed.error.from + 1 }
          }
        />
        {nextRun && formats && now !== null && (
          <StatusItem className="shrink-0">
            {fmt(t.nextRunAt, { time: formats.relative(nextRun.ms, now) })}
          </StatusItem>
        )}
      </StatusBar>
    </>
  );
}

function FieldTable({
  order,
  tokens,
  fields,
  errorField,
  onEdit,
}: {
  order: CronField[];
  tokens: string[];
  fields?: Record<CronField, ParsedField | undefined>;
  errorField?: CronField;
  onEdit: (index: number, value: string) => void;
}) {
  const t = useToolMessages<'time'>();
  const locale = useLocale();
  const names = useMemo(() => valueNames(locale), [locale]);
  const id = useId();
  return (
    <table className="w-full text-xs">
      <caption className="sr-only">{t.fields}</caption>
      <thead>
        <tr className="text-start text-fg-subtle">
          <th scope="col" className="w-24 pb-1 text-start font-normal">
            {t.field}
          </th>
          <th scope="col" className="w-28 pb-1 text-start font-normal">
            {t.value}
          </th>
          <th scope="col" className="pb-1 text-start font-normal">
            {t.meaning}
          </th>
        </tr>
      </thead>
      <tbody>
        {order.map((field, index) => {
          const parsed = fields?.[field];
          const invalid = errorField === field;
          return (
            <tr key={field} className="border-t border-line align-top">
              <th scope="row" className="py-1.5 pe-2 text-start font-normal text-fg-subtle">
                <label htmlFor={`${id}-${field}`}>{t.fieldNames[field]}</label>
              </th>
              <td className="py-1 pe-2">
                <input
                  id={`${id}-${field}`}
                  value={tokens[index] ?? ''}
                  onChange={(event) => onEdit(index, event.target.value)}
                  onFocus={(event) => event.target.select()}
                  aria-invalid={invalid || undefined}
                  spellCheck={false}
                  autoCapitalize="off"
                  autoComplete="off"
                  dir="ltr"
                  className="h-7 w-full min-w-0 rounded-md border border-line bg-surface-2 px-2 font-mono text-fg outline-none focus-visible:ring-2 focus-visible:ring-ring aria-invalid:border-danger"
                />
              </td>
              <td dir="auto" className={invalid ? 'py-1.5 text-danger' : 'py-1.5 text-fg'}>
                {parsed ? describeField(parsed, t, names, locale) : invalid ? t.invalidField : '—'}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

type ValueNames = { months: string[]; weekdays: string[] };

/** Month and weekday names in the page's language. */
function valueNames(locale: string): ValueNames {
  const month = new Intl.DateTimeFormat(locale, { month: 'long', timeZone: 'UTC' });
  const weekday = new Intl.DateTimeFormat(locale, { weekday: 'long', timeZone: 'UTC' });
  return {
    months: Array.from({ length: 12 }, (_, index) => month.format(Date.UTC(2023, index, 1))),
    // January 1st, 2023 was a Sunday.
    weekdays: Array.from({ length: 7 }, (_, index) => weekday.format(Date.UTC(2023, 0, 1 + index))),
  };
}

function describeField(
  field: ParsedField,
  t: TimeMessages,
  names: ValueNames,
  locale: string
): string {
  if (field.unspecified) return t.unspecified;
  if (field.text === '*') return t.every;
  const label = (value: number) => {
    if (field.field === 'month') return names.months[value - 1];
    if (field.field === 'dayOfWeek') return names.weekdays[value];
    return String(value);
  };
  const items = field.values.slice(0, MAX_VALUES).map(label);
  if (field.values.length > MAX_VALUES) {
    items.push(fmt(t.moreValues, { count: field.values.length - MAX_VALUES }));
  }
  items.push(...field.rules.map((rule) => describeRule(rule, t, names)));
  return new Intl.ListFormat(locale, { type: 'conjunction' }).format(items);
}

function describeRule(rule: DayRule, t: TimeMessages, names: ValueNames): string {
  switch (rule.kind) {
    case 'last':
      return rule.offset ? fmt(t.rules.lastOffset, { count: rule.offset }) : t.rules.last;
    case 'lastWeekday':
      return t.rules.lastWeekday;
    case 'nearestWeekday':
      return fmt(t.rules.nearestWeekday, { day: rule.day });
    case 'nth':
      return fmt(t.rules.nth, {
        nth: t.ordinals[`n${rule.nth}` as keyof TimeMessages['ordinals']],
        weekday: names.weekdays[rule.weekday],
      });
    case 'lastOf':
      return fmt(t.rules.lastOf, { weekday: names.weekdays[rule.weekday] });
  }
}
