'use client';

import { useMemo } from 'react';
import { CircleAlert } from 'lucide-react';
import type { IpResult } from '@/lib/tools/network/ip';
import { StatusItem } from '@/components/tools/workbench/status-bar';
import { useLocale } from '@/i18n/use-locale';
import { cn } from '@/lib/cn';

/** Counts past this many digits also show as a power of two (2^80 reads better than 25 digits). */
const POWER_DIGITS = 7;

/** Locale-formatted BigInt counts; powers of two get a "= 2^n" suffix once they are long. */
export function useFormatCount(): (value: bigint) => string {
  const locale = useLocale();
  return useMemo(() => {
    const numbers = new Intl.NumberFormat(locale);
    return (value: bigint) => {
      const text = numbers.format(value);
      const bits = value.toString(2);
      const power = value.toString().length >= POWER_DIGITS && /^10*$/.test(bits);
      return power ? `${text} (2^${bits.length - 1})` : text;
    };
  }, [locale]);
}

/** Equal-sized bit groups, the first `prefix` bits (network bits) highlighted. */
export function BitGroups({ groups, prefix }: { groups: string[]; prefix: number }) {
  return (
    <span
      dir="ltr"
      className="flex flex-wrap gap-x-1.5 gap-y-0.5 font-mono text-[11px] tracking-wide"
    >
      {groups.map((group, index) => {
        const start = index * group.length;
        const split = Math.min(Math.max(prefix - start, 0), group.length);
        return (
          <span key={index} className="whitespace-nowrap">
            <span className="text-primary-text">{group.slice(0, split)}</span>
            <span className="text-fg-subtle">{group.slice(split)}</span>
          </span>
        );
      })}
    </span>
  );
}

/** The lib's English parse error in the status bar. */
export function ErrorStatus({ result }: { result: IpResult<unknown> | null }) {
  if (!result || result.ok) return null;
  return (
    <StatusItem tone="danger" title={result.message}>
      <CircleAlert className="size-3 shrink-0" aria-hidden />
      <span className="truncate font-sans">{result.message}</span>
    </StatusItem>
  );
}

/** Small clickable example values under an input. */
export function Examples({
  label,
  values,
  onPick,
}: {
  label: string;
  values: string[];
  onPick: (value: string) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="text-fg-subtle">{label}</span>
      {values.map((value) => (
        <button
          key={value}
          type="button"
          dir="ltr"
          onClick={() => onPick(value)}
          className={cn(
            'cursor-pointer rounded border border-line bg-surface-2 px-1.5 py-px font-mono text-[11px] text-fg-muted',
            'hover:border-line-strong hover:text-fg focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none'
          )}
        >
          {value}
        </button>
      ))}
    </div>
  );
}
