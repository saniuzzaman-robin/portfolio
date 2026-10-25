'use client';

import { useEffect, useEffectEvent, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Copy, FolderOpen, Play, X, type LucideIcon } from 'lucide-react';
import { useCopyToClipboard } from '@/lib/use-copy-to-clipboard';
import { TOOLS, TOOLS_PATH, toolPath, toolText, type ToolSlug } from '@/lib/data/tools';
import type { Messages } from '@/i18n/messages/en';
import { localePath } from '@/i18n/config';
import { useLocale } from '@/i18n/use-locale';
import { useDictionary } from '@/i18n/provider';
import { useToolCommon } from '@/i18n/tools/provider';
import { cn } from '@/lib/cn';
import { Select } from './select';
import { RUN_SHORTCUT } from './use-run';

/**
 * The workbench's top bar: the page's <h1>, then tool-specific controls (`children`, which
 * scroll horizontally) and actions pinned to the end (`actions`). Below `sm` the controls move
 * to a second row so the actions don't crush them.
 */
export function ToolHeader({
  slug,
  children,
  actions,
}: {
  slug: ToolSlug;
  children?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  const { t } = useDictionary();
  return (
    <div className="flex shrink-0 flex-wrap items-center gap-x-2 border-b border-line bg-surface px-2 max-sm:gap-y-1 max-sm:py-1.5 sm:h-10">
      <ToolSwitcher current={slug} className="min-w-0 flex-1 sm:flex-none lg:hidden" />
      <h1 className="sr-only shrink-0 px-1 font-sans text-sm font-semibold text-fg lg:not-sr-only">
        {toolText(t, slug).title}
      </h1>
      <div className="no-scrollbar flex min-w-0 items-center gap-1 overflow-x-auto max-sm:order-last max-sm:w-full sm:flex-1">
        {children}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-0.5">{actions}</div>}
    </div>
  );
}

/** Compact tool picker for screens where the rail is hidden. */
function ToolSwitcher({ current, className }: { current: ToolSlug; className?: string }) {
  const router = useRouter();
  const locale = useLocale();
  const { t } = useDictionary();
  const common = useToolCommon();
  const categories = Object.keys(t.tools.categories) as (keyof Messages['tools']['categories'])[];

  return (
    <Select
      label={common.switchTool}
      value={current}
      onChange={(slug) => {
        const tool = TOOLS.find((entry) => entry.slug === slug);
        router.push(localePath(locale, tool ? toolPath(tool.slug) : TOOLS_PATH));
      }}
      options={[
        { value: '', label: common.allTools },
        ...categories.flatMap((category) => {
          const tools = TOOLS.filter((tool) => tool.category === category);
          if (tools.length === 0) return [];
          return {
            label: t.tools.categories[category],
            options: tools.map((tool) => ({
              value: tool.slug,
              label: toolText(t, tool.slug).label,
            })),
          };
        }),
      ]}
      className={cn(
        'h-7 max-w-40 shrink-0 rounded-md border border-line bg-surface-2 ps-2 pe-1.5 text-xs font-semibold text-fg outline-none focus-visible:ring-2 focus-visible:ring-ring',
        className
      )}
    />
  );
}

const ACTION_CLASSES =
  'inline-flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-fg-muted transition-colors hover:bg-surface-2 hover:text-fg focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none disabled:pointer-events-none disabled:opacity-40';

/** Icon-only button; `label` is both its accessible name and its tooltip. */
export function IconAction({
  icon: Icon,
  label,
  onClick,
  disabled,
  pressed,
  expanded,
  controls,
  shortcut,
  className,
}: {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  /** Set for toggles (e.g. line wrap): exposes `aria-pressed` and an active style. */
  pressed?: boolean;
  /** Set for disclosure buttons (popovers): exposes `aria-expanded` and an active style. */
  expanded?: boolean;
  /** Id of the element this button shows or hides. */
  controls?: string;
  /** Shown in the tooltip, e.g. "⌘⏎". */
  shortcut?: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      aria-pressed={pressed}
      aria-expanded={expanded}
      aria-controls={controls}
      aria-keyshortcuts={shortcut}
      title={shortcut ? `${label} (${shortcut})` : label}
      className={cn(
        ACTION_CLASSES,
        (pressed || expanded) && 'bg-primary/10 text-primary-text',
        className
      )}
    >
      <Icon className="size-3.75" aria-hidden />
    </button>
  );
}

/**
 * The tool's primary action (Format, Convert…), which runs the input through it. Ctrl/⌘+Enter
 * triggers it from anywhere on the page; it is caught before the editors see it, so it never
 * inserts a line.
 */
export function RunButton({ label, onRun }: { label: string; onRun: () => void }) {
  const onShortcut = useEffectEvent(onRun);
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Enter' || !(event.metaKey || event.ctrlKey) || event.isComposing) return;
      event.preventDefault();
      event.stopPropagation();
      onShortcut();
    };
    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, []);

  return (
    <button
      type="button"
      onClick={() => onRun()}
      aria-keyshortcuts="Control+Enter Meta+Enter"
      title={`${label} (${RUN_SHORTCUT})`}
      className="ms-1 inline-flex h-7 shrink-0 cursor-pointer items-center gap-1.5 rounded-md bg-primary-strong px-2.5 text-xs font-semibold text-primary-fg transition-[filter] hover:brightness-110 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-surface focus-visible:outline-none max-sm:px-2"
    >
      <Play className="size-3.5 fill-current" aria-hidden />
      <span className="max-sm:sr-only">{label}</span>
    </button>
  );
}

/** Copies `getText()` (read at click time, so it is never stale). */
export function CopyButton({
  getText,
  disabled,
  label,
}: {
  getText: () => string;
  disabled?: boolean;
  label?: string;
}) {
  const common = useToolCommon();
  const { status, copy } = useCopyToClipboard();
  const icon = status === 'copied' ? Check : status === 'error' ? X : Copy;
  const text =
    status === 'copied'
      ? common.copied
      : status === 'error'
        ? common.copyFailed
        : (label ?? common.copy);
  return (
    <IconAction
      icon={icon}
      label={text}
      disabled={disabled}
      onClick={() => void copy(getText())}
      className={cn(status === 'copied' && 'text-success', status === 'error' && 'text-danger')}
    />
  );
}

/** Opens the system file picker; the same file can be picked again after editing. */
export function FileOpenButton({
  onFile,
  accept,
  label,
}: {
  onFile: (file: File) => void;
  accept?: string;
  label?: string;
}) {
  const common = useToolCommon();
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <>
      <IconAction
        icon={FolderOpen}
        label={label ?? common.openFile}
        onClick={() => inputRef.current?.click()}
      />
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        hidden
        tabIndex={-1}
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = '';
          if (file) onFile(file);
        }}
      />
    </>
  );
}

export type SegmentOption<T extends string> = { value: T; label: string; icon?: LucideIcon };

/** Single-choice mode switch (radio group with arrow-key navigation). */
export function Segmented<T extends string>({
  value,
  onChange,
  options,
  label,
  className,
}: {
  value: T;
  onChange: (value: T) => void;
  options: SegmentOption<T>[];
  /** Accessible name of the group. */
  label: string;
  className?: string;
}) {
  const groupRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const keys = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'];
    if (!keys.includes(event.key)) return;
    event.preventDefault();
    const index = options.findIndex((option) => option.value === value);
    const rtl = getComputedStyle(event.currentTarget).direction === 'rtl';
    let next = index;
    if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = options.length - 1;
    else {
      const forward = event.key === 'ArrowDown' || event.key === (rtl ? 'ArrowLeft' : 'ArrowRight');
      next = (index + (forward ? 1 : -1) + options.length) % options.length;
    }
    onChange(options[next].value);
    groupRef.current?.querySelectorAll<HTMLButtonElement>('[role="radio"]')[next]?.focus();
  };

  return (
    <div
      ref={groupRef}
      role="radiogroup"
      aria-label={label}
      onKeyDown={handleKeyDown}
      className={cn('flex shrink-0 items-center gap-0.5', className)}
    >
      {options.map((option) => {
        const checked = option.value === value;
        const Icon = option.icon;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={checked}
            tabIndex={checked ? 0 : -1}
            onClick={() => onChange(option.value)}
            className={cn(
              'inline-flex h-7 shrink-0 cursor-pointer items-center gap-1.5 rounded-md px-2.5 text-xs font-medium whitespace-nowrap transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
              checked
                ? 'bg-surface-2 text-fg shadow-[inset_0_0_0_1px_var(--line-strong)]'
                : 'text-fg-muted hover:text-fg'
            )}
          >
            {Icon && <Icon className="size-3.5" aria-hidden />}
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

/** Thin vertical rule between groups of toolbar controls. */
export function ToolbarDivider() {
  return <span aria-hidden className="mx-1 h-4 w-px shrink-0 bg-line" />;
}

/** Compact select for the toolbar (e.g. picking a codec or language). */
export function ToolbarSelect<T extends string>({
  label,
  value,
  onChange,
  options,
  className,
}: {
  /** Accessible name; also the tooltip. */
  label: string;
  value: T;
  onChange: (value: T) => void;
  options: { value: T; label: string }[];
  className?: string;
}) {
  return (
    <Select
      label={label}
      title={label}
      value={value}
      onChange={onChange}
      options={options}
      className={cn(
        'h-7 max-w-44 shrink-0 rounded-md border border-line bg-surface-2 ps-2 pe-1.5 text-xs font-medium text-fg outline-none focus-visible:ring-2 focus-visible:ring-ring',
        className
      )}
    />
  );
}
