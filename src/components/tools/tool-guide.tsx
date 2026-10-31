import { Container } from '@/components/ui/section';
import type { Messages } from '@/i18n/messages/en';
import type { GuideFaq } from '@/lib/data/tool-guides';

/** Written explanation under a tool workbench: what it does, common uses and FAQs. */
export function ToolGuide({
  t,
  title,
  guide,
  uses,
}: {
  t: Messages;
  title: string;
  guide: { about: string; uses?: string[]; faq: GuideFaq[] };
  /** Used when the guide has none of its own (preset pages borrow their tool's). */
  uses?: string[];
}) {
  const { guide: labels } = t.tools;
  const useList = guide.uses ?? uses;
  return (
    <section aria-labelledby="tool-guide" className="border-t border-line py-12 sm:py-16">
      <Container className="max-w-3xl">
        <h2 id="tool-guide" className="font-heading text-lg font-semibold text-fg">
          {labels.about}: {title}
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-fg-muted">{guide.about}</p>
        {useList && useList.length > 0 && (
          <>
            <h3 className="mt-8 text-sm font-semibold text-fg">{labels.uses}</h3>
            <ul className="mt-3 list-disc space-y-1.5 ps-5 text-sm text-fg-muted">
              {useList.map((use) => (
                <li key={use}>{use}</li>
              ))}
            </ul>
          </>
        )}
        <h3 className="mt-8 text-sm font-semibold text-fg">{labels.faq}</h3>
        <dl className="mt-3 space-y-5">
          {guide.faq.map(({ q, a }) => (
            <div key={q}>
              <dt className="text-sm font-medium text-fg">{q}</dt>
              <dd className="mt-1 text-sm leading-relaxed text-fg-muted">{a}</dd>
            </div>
          ))}
        </dl>
      </Container>
    </section>
  );
}
