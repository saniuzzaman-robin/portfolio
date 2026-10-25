'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { SlidersHorizontal, type LucideIcon } from 'lucide-react';
import { IconAction } from './toolbar';
import { Select } from './select';
import { useToolCommon } from '@/i18n/tools/provider';
import { cn } from '@/lib/cn';

/** Toolbar button that opens a small panel of settings; closes on outside click or Escape. */
export function OptionsPopover({
  children,
  label,
  icon = SlidersHorizontal,
  className,
}: {
  children: React.ReactNode;
  label?: string;
  icon?: LucideIcon;
  className?: string;
}) {
  const common = useToolCommon();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const panelId = useId();

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      // A select inside the panel prevents the default when Escape only closes its own list.
      if (event.key !== 'Escape' || event.defaultPrevented) return;
      setOpen(false);
      rootRef.current?.querySelector<HTMLButtonElement>('button')?.focus();
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <IconAction
        icon={icon}
        label={label ?? common.options}
        expanded={open}
        controls={open ? panelId : undefined}
        onClick={() => setOpen((value) => !value)}
      />
      {open && (
        <div
          id={panelId}
          role="group"
          aria-label={label ?? common.options}
          className={cn(
            'absolute end-0 top-full z-40 mt-1.5 w-64 space-y-3 rounded-lg border border-line-strong bg-elevated p-3 text-xs shadow-pop',
            className
          )}
        >
          {children}
        </div>
      )}
    </div>
  );
}

/** Labeled on/off switch for option panels. */
export function Toggle({
  label,
  checked,
  onChange,
  hint,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  hint?: string;
}) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-3">
      <span className="min-w-0">
        <span className="block font-medium text-fg">{label}</span>
        {hint && <span className="mt-0.5 block text-fg-subtle">{hint}</span>}
      </span>
      <input
        type="checkbox"
        role="switch"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="peer sr-only"
      />
      <span
        aria-hidden
        className="relative mt-0.5 h-4 w-7 shrink-0 rounded-full bg-line-strong transition-colors peer-checked:bg-primary peer-focus-visible:ring-2 peer-focus-visible:ring-ring after:absolute after:inset-s-0.5 after:top-0.5 after:size-3 after:rounded-full after:bg-white after:transition-[inset-inline-start] after:content-[''] peer-checked:after:inset-s-3.5"
      />
    </label>
  );
}

/** Labeled select for option panels. */
export function SelectField<T extends string>({
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
  // Not a <label>: clicking an option inside one would re-click the button and reopen the list.
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="font-medium text-fg">{label}</span>
      <Select
        label={label}
        value={value}
        onChange={onChange}
        options={options}
        className="h-7 min-w-0 rounded-md border border-line bg-surface-2 ps-2 pe-1.5 text-xs text-fg outline-none focus-visible:ring-2 focus-visible:ring-ring"
      />
    </div>
  );
}

/** Labeled one-line text input for option panels. */
export function InputField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="flex items-center justify-between gap-3">
      <span className="font-medium text-fg">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        spellCheck={false}
        autoCapitalize="off"
        autoComplete="off"
        dir="ltr"
        className="h-7 w-32 min-w-0 rounded-md border border-line bg-surface-2 px-2 font-mono text-xs text-fg outline-none placeholder:text-fg-subtle focus-visible:ring-2 focus-visible:ring-ring"
      />
    </label>
  );
}
