'use client';

import { createContext, useId } from 'react';
import { useToolMessages } from '@/i18n/tools/provider';
import { cn } from '@/lib/cn';

/** Strip under an editor holding keys or passphrases, with the "never saved" note. */
export function SecretPanel({ children }: { children?: React.ReactNode }) {
  const t = useToolMessages<'crypto'>();
  return (
    <section className="shrink-0 space-y-2 border-t border-line bg-surface p-2 text-xs">
      {children}
      <p className="text-[11px] text-fg-subtle">{t.secretsNotSaved}</p>
    </section>
  );
}

const INPUT_CLASSES =
  'h-7 w-full min-w-0 flex-1 basis-48 rounded-md border border-line bg-surface-2 px-2 font-mono text-xs text-fg outline-none placeholder:text-fg-subtle focus-visible:ring-2 focus-visible:ring-ring aria-invalid:border-danger';

/** Labeled single-line text input for keys, IVs and passwords; always laid out left-to-right. */
export function TextField({
  label,
  value,
  onChange,
  placeholder,
  invalid,
  children,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  invalid?: boolean;
  /** Extra controls after the input (e.g. a "generate" button). */
  children?: React.ReactNode;
}) {
  const id = useId();
  return (
    <div className="flex flex-wrap items-center gap-2">
      <label htmlFor={id} className="w-24 shrink-0 text-fg-subtle">
        {label}
      </label>
      <input
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-invalid={invalid || undefined}
        spellCheck={false}
        autoCapitalize="off"
        autoComplete="off"
        dir="ltr"
        className={INPUT_CLASSES}
      />
      {children}
    </div>
  );
}

/** Labeled whole-number input for option panels. */
export function NumberField({
  label,
  value,
  onChange,
  min,
  max,
  hint,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  hint?: string;
}) {
  const id = useId();
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between gap-3">
        <label htmlFor={id} className="font-medium text-fg">
          {label}
        </label>
        <input
          id={id}
          type="number"
          inputMode="numeric"
          min={min}
          max={max}
          step={1}
          value={Number.isFinite(value) ? value : ''}
          onChange={(event) => onChange(event.target.valueAsNumber)}
          dir="ltr"
          className="h-7 w-28 rounded-md border border-line bg-surface-2 px-2 font-mono text-xs text-fg outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>
      {hint && <p className="text-fg-subtle">{hint}</p>}
    </div>
  );
}

/** The label of the `DetailList` row being rendered, so controls in it can name themselves. */
export const DetailRowLabel = createContext<string | null>(null);

/** Label/value grid; values are technical strings shown left-to-right. */
export function DetailList({
  rows,
  className,
}: {
  rows: [label: string, value: React.ReactNode][];
  className?: string;
}) {
  return (
    <dl className={cn('grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-xs', className)}>
      {rows.map(([label, value]) => (
        <div key={label} className="contents">
          <dt className="text-fg-subtle">{label}</dt>
          <dd dir="ltr" className="min-w-0 text-start font-mono break-all text-fg">
            <DetailRowLabel value={label}>{value}</DetailRowLabel>
          </dd>
        </div>
      ))}
    </dl>
  );
}
