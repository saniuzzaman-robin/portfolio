'use client';

import { useId } from 'react';
import { useLocale } from '@/i18n/use-locale';

/** Locale-aware number for status text: `useFormatNumber()(1296)` → "1,296" / "১,২৯৬". */
export function useFormatNumber(): (value: number) => string {
  const locale = useLocale();
  const format = new Intl.NumberFormat(locale, { maximumFractionDigits: 0 });
  return (value) => format.format(value);
}

/** Labeled slider with its current value, for lengths and word counts. */
export function RangeField({
  label,
  value,
  onChange,
  min,
  max,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
}) {
  const id = useId();
  return (
    <div className="flex items-center gap-2">
      <label htmlFor={id} className="w-24 shrink-0 text-fg-subtle">
        {label}
      </label>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={1}
        value={value}
        onChange={(event) => onChange(event.target.valueAsNumber)}
        className="min-w-0 flex-1 cursor-pointer accent-primary"
      />
      <output htmlFor={id} className="w-8 text-end font-mono text-fg">
        {value}
      </output>
    </div>
  );
}
