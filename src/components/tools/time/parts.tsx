'use client';

import { useId, useMemo } from 'react';
import { relativeTime } from '@/lib/tools/jwt/claims';
import { systemTimeZone, timeZones } from '@/lib/tools/time/zone';
import { CopyButton } from '@/components/tools/workbench/toolbar';
import { useToolMessages } from '@/i18n/tools/provider';
import { useLocale } from '@/i18n/use-locale';
import { fmt } from '@/i18n/dictionary';
import { cn } from '@/lib/cn';

const CONTROL_CLASSES =
  'h-7 w-full min-w-0 flex-1 basis-48 rounded-md border border-line bg-surface-2 px-2 font-mono text-xs text-fg outline-none placeholder:text-fg-subtle focus-visible:ring-2 focus-visible:ring-ring aria-invalid:border-danger';

/** Labeled native select laid out like `TextField` (label column, control filling the rest). */
export function SelectRow<T extends string>({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: T;
  onChange: (value: T) => void;
  options: { value: T; label: string }[];
}) {
  const id = useId();
  return (
    <div className="flex flex-wrap items-center gap-2">
      <label htmlFor={id} className="w-24 shrink-0 text-fg-subtle">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value as T)}
        className={cn(CONTROL_CLASSES, 'cursor-pointer font-sans')}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

let zoneList: string[] | undefined;

/** The persisted zone (`''` = the viewer's own), resolved; null until hydrated. */
export function resolveZone(zone: string, hydrated: boolean): string | null {
  if (zone) return zone;
  return hydrated ? systemTimeZone() : null;
}

/** Time zone picker: "Local (…)" first, then every IANA zone the browser knows. */
export function ZoneSelect({
  value,
  onChange,
  hydrated,
}: {
  value: string;
  onChange: (zone: string) => void;
  hydrated: boolean;
}) {
  const t = useToolMessages<'time'>();
  // The zone list and the viewer's zone are browser facts: only after hydration.
  const zones = hydrated ? (zoneList ??= timeZones()) : [];
  const local = hydrated ? fmt(t.localZone, { zone: systemTimeZone() }) : t.local;
  return (
    <SelectRow
      label={t.timeZone}
      value={value}
      onChange={onChange}
      options={[
        { value: '', label: local },
        ...zones.map((zone) => ({ value: zone, label: zone })),
      ]}
    />
  );
}

/** A technical value with a copy button, for `DetailList` rows. */
export function CopyValue({ text, children }: { text: string; children?: React.ReactNode }) {
  return (
    <span className="flex items-start gap-1">
      <span className="min-w-0 flex-1 py-1 break-all">{children ?? text}</span>
      <CopyButton getText={() => text} />
    </span>
  );
}

/** Translated text inside a left-to-right value column keeps its own direction. */
export const translated = (text: string) => <span dir="auto">{text}</span>;

/** Locale formatters for one zone: full date and time, and relative time. */
export function useTimeFormats(timeZone: string | null) {
  const locale = useLocale();
  return useMemo(() => {
    if (!timeZone) return null;
    const full = new Intl.DateTimeFormat(locale, {
      dateStyle: 'full',
      timeStyle: 'long',
      timeZone,
    });
    const relative = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
    return {
      full: (ms: number) => full.format(new Date(ms)),
      relative: (ms: number, now: number) => {
        const { value, unit } = relativeTime(Math.floor(ms / 1000), Math.floor(now / 1000));
        return relative.format(value, unit);
      },
    };
  }, [locale, timeZone]);
}

/** Small explanatory text under a form or list. */
export function Note({
  tone = 'muted',
  children,
}: {
  tone?: 'muted' | 'warning' | 'danger';
  children: React.ReactNode;
}) {
  return (
    <p
      className={cn(
        'text-[11px]',
        tone === 'muted' && 'text-fg-subtle',
        tone === 'warning' && 'text-warning',
        tone === 'danger' && 'text-danger'
      )}
    >
      {children}
    </p>
  );
}
