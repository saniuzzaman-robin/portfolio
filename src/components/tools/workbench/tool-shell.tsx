import type { ToolSlug } from '@/lib/data/tools';
import { ToolI18nProvider, type ToolPayload } from '@/i18n/tools/provider';
import { TooltipLayer } from '@/components/ui/tooltip-layer';
import { PresetTitleProvider, ToolDeepLink } from './deep-link';
import { ToolRail } from './tool-rail';
import { ToolView } from './tool-view';

/**
 * Full-viewport frame for a tool page: the rail plus the tool itself, filling exactly the
 * space under the docked navbar so only the panes inside scroll. A `preset` opens the tool in
 * that view and titles the page after it.
 */
export function ToolShell({
  slug,
  messages,
  preset,
}: {
  slug: ToolSlug;
  messages: ToolPayload;
  preset?: { title: string; params: Record<string, string> };
}) {
  return (
    <ToolI18nProvider messages={messages}>
      <PresetTitleProvider title={preset?.title ?? null}>
        <ToolDeepLink slug={slug} preset={preset} />
        <div className="flex h-[calc(100dvh-var(--nav-h))] min-h-0">
          <ToolRail current={slug} />
          <div className="flex min-w-0 flex-1 flex-col bg-bg">
            <ToolView slug={slug} />
          </div>
        </div>
        <TooltipLayer />
      </PresetTitleProvider>
    </ToolI18nProvider>
  );
}
