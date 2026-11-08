import type { Messages } from '@/i18n/messages/en';
import type { GuideFaq } from '@/lib/data/tool-guides';

/**
 * Written explanation of a tool: what it does, common uses and FAQs. Rendered on the server and
 * shown in the info dialog (`ToolInfo`), so the text stays in the page's HTML.
 */
export function ToolGuide({
  t,
  guide,
  uses,
}: {
  t: Messages;
  guide: { about: string; uses?: string[]; faq: GuideFaq[] };
  /** Used when the guide has none of its own (preset pages borrow their tool's). */
  uses?: string[];
}) {
  const { guide: labels } = t.tools;
  const useList = guide.uses ?? uses;
  return (
    <>
      <p className="text-sm leading-relaxed text-fg-muted">{guide.about}</p>
      {useList && useList.length > 0 && (
        <>
          <h3 className="mt-6 text-sm font-semibold text-fg">{labels.uses}</h3>
          <ul className="mt-3 list-disc space-y-1.5 ps-5 text-sm text-fg-muted">
            {useList.map((use) => (
              <li key={use}>{use}</li>
            ))}
          </ul>
        </>
      )}
      <h3 className="mt-6 text-sm font-semibold text-fg">{labels.faq}</h3>
      <dl className="mt-3 space-y-5">
        {guide.faq.map(({ q, a }) => (
          <div key={q}>
            <dt className="text-sm font-medium text-fg">{q}</dt>
            <dd className="mt-1 text-sm leading-relaxed text-fg-muted">{a}</dd>
          </div>
        ))}
      </dl>
    </>
  );
}
