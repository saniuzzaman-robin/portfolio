'use client';

import { LayoutGrid, type LucideIcon } from 'lucide-react';
import { LocaleLink } from '@/components/ui/locale-link';
import { TOOLS, TOOLS_PATH, toolPath, toolText, type ToolSlug } from '@/lib/data/tools';
import { useDictionary } from '@/i18n/provider';
import { useToolCommon } from '@/i18n/tools/provider';
import { cn } from '@/lib/cn';

function RailLink({
  href,
  icon: Icon,
  label,
  active,
}: {
  href: string;
  icon: LucideIcon;
  label: string;
  active?: boolean;
}) {
  return (
    <LocaleLink
      href={href}
      title={label}
      aria-label={label}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'relative flex size-9 shrink-0 items-center justify-center rounded-md transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
        active
          ? 'bg-primary/10 text-primary-text before:absolute before:inset-y-2 before:-inset-s-1.5 before:w-0.5 before:rounded-full before:bg-primary'
          : 'text-fg-subtle hover:bg-surface-2 hover:text-fg'
      )}
    >
      <Icon className="size-4.5" aria-hidden />
    </LocaleLink>
  );
}

/** Icon column for jumping between tools (large screens; smaller ones use the header select). */
export function ToolRail({ current }: { current: ToolSlug }) {
  const { t } = useDictionary();
  const common = useToolCommon();
  return (
    <nav
      aria-label={common.switchTool}
      className="no-scrollbar hidden w-12 shrink-0 flex-col items-center gap-0.5 overflow-y-auto border-e border-line bg-surface py-1.5 lg:flex"
    >
      <RailLink href={TOOLS_PATH} icon={LayoutGrid} label={common.allTools} />
      <span aria-hidden className="my-1 h-px w-6 shrink-0 bg-line" />
      {TOOLS.map((tool) => (
        <RailLink
          key={tool.slug}
          href={toolPath(tool.slug)}
          icon={tool.icon}
          label={toolText(t, tool.slug).label}
          active={tool.slug === current}
        />
      ))}
    </nav>
  );
}
