'use client';

import { LayoutGrid, PanelLeftClose, PanelLeftOpen, type LucideIcon } from 'lucide-react';
import { LocaleLink } from '@/components/ui/locale-link';
import { TOOLS, TOOLS_PATH, toolPath, toolText, type ToolSlug } from '@/lib/data/tools';
import { useDictionary } from '@/i18n/provider';
import { useToolCommon } from '@/i18n/tools/provider';
import { cn } from '@/lib/cn';
import { usePersistentState } from './use-persistent-state';

function RailLink({
  href,
  icon: Icon,
  label,
  active,
  expanded,
}: {
  href: string;
  icon: LucideIcon;
  label: string;
  active?: boolean;
  expanded: boolean;
}) {
  return (
    <LocaleLink
      href={href}
      title={label}
      aria-label={label}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'relative flex h-9 w-full shrink-0 items-center overflow-hidden rounded-md ps-2.25 transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
        active
          ? 'bg-primary/10 text-primary-text before:absolute before:inset-y-2 before:start-0 before:w-0.5 before:rounded-full before:bg-primary'
          : 'text-fg-subtle hover:bg-surface-2 hover:text-fg'
      )}
    >
      <Icon className="size-4.5 shrink-0" aria-hidden />
      <span
        className={cn(
          'max-w-0 truncate text-xs font-medium whitespace-nowrap opacity-0 transition-[max-width,margin,opacity] duration-300 ease-out-expo motion-reduce:transition-none 2xl:text-sm',
          expanded && 'lg:ms-2.5 lg:max-w-36 lg:opacity-100'
        )}
      >
        {label}
      </span>
    </LocaleLink>
  );
}

/**
 * Tool switcher for large screens (smaller ones use the header select): icons and names, with a
 * toggle that collapses it to icons only.
 */
export function ToolRail({ current }: { current: ToolSlug }) {
  const { t } = useDictionary();
  const common = useToolCommon();
  const [collapsed, setCollapsed] = usePersistentState('rail-collapsed', false);
  const expanded = !collapsed;
  const toggleLabel = expanded ? common.collapseRail : common.expandRail;
  const ToggleIcon = expanded ? PanelLeftClose : PanelLeftOpen;
  return (
    <nav
      aria-label={common.switchTool}
      className={cn(
        'no-scrollbar hidden shrink-0 flex-col gap-0.5 overflow-x-hidden overflow-y-auto border-e border-line bg-surface px-1.5 py-1.5 transition-[width] duration-300 ease-out-expo motion-reduce:transition-none lg:flex',
        expanded ? 'w-52' : 'w-12'
      )}
    >
      <RailLink href={TOOLS_PATH} icon={LayoutGrid} label={common.allTools} expanded={expanded} />
      <span aria-hidden className="mx-1.5 my-1 h-px shrink-0 bg-line" />
      {TOOLS.map((tool) => (
        <RailLink
          key={tool.slug}
          href={toolPath(tool.slug)}
          icon={tool.icon}
          label={toolText(t, tool.slug).label}
          active={tool.slug === current}
          expanded={expanded}
        />
      ))}
      <button
        type="button"
        onClick={() => setCollapsed(!collapsed)}
        title={toggleLabel}
        aria-label={toggleLabel}
        aria-expanded={expanded}
        className="mt-auto hidden size-9 shrink-0 items-center justify-center self-end rounded-md text-fg-subtle transition-colors hover:bg-surface-2 hover:text-fg focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none lg:flex"
      >
        <ToggleIcon className="size-4.5 rtl:-scale-x-100" aria-hidden />
      </button>
    </nav>
  );
}
