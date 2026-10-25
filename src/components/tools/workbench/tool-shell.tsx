import type { ToolSlug } from '@/lib/data/tools';
import { ToolI18nProvider, type ToolPayload } from '@/i18n/tools/provider';
import { ToolRail } from './tool-rail';
import { ToolView } from './tool-view';

/**
 * Full-viewport frame for a tool page: the rail plus the tool itself, filling exactly the
 * space under the docked navbar so only the panes inside scroll.
 */
export function ToolShell({ slug, messages }: { slug: ToolSlug; messages: ToolPayload }) {
  return (
    <ToolI18nProvider messages={messages}>
      <div className="flex h-[calc(100dvh-var(--nav-h))] min-h-0">
        <ToolRail current={slug} />
        <div className="flex min-w-0 flex-1 flex-col bg-bg">
          <ToolView slug={slug} />
        </div>
      </div>
    </ToolI18nProvider>
  );
}
