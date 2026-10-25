'use client';

import type { CaptureGroup } from '@/lib/tools/regex/explain';
import type { RegexMatch, Span } from '@/lib/tools/regex/run';
import { useToolMessages } from '@/i18n/tools/provider';
import { useLocale } from '@/i18n/use-locale';
import { fmt } from '@/i18n/dictionary';
import { GroupSwatch, visible } from './parts';

/** Matches listed in the table; the editor highlights all of them. */
const TABLE_LIMIT = 200;
/** Long values are cut in the table (the editor shows them in full). */
const PREVIEW_CHARS = 200;

function Value({ text, span }: { text: string; span: Span | null }) {
  const t = useToolMessages<'regex'>();
  if (!span) return <span className="font-sans text-fg-subtle italic">{t.notParticipating}</span>;
  const value = text.slice(span[0], span[1]);
  if (!value) return <span className="font-sans text-fg-subtle italic">{t.empty}</span>;
  const preview = value.length > PREVIEW_CHARS ? `${value.slice(0, PREVIEW_CHARS)}…` : value;
  return <span className="break-all whitespace-pre-wrap">{visible(preview)}</span>;
}

/** Each match with its offsets and capture groups; clicking a row selects it in the text. */
export function MatchesPanel({
  text,
  matches,
  groups,
  onReveal,
}: {
  text: string;
  matches: RegexMatch[];
  groups: CaptureGroup[];
  onReveal: (from: number, to: number) => void;
}) {
  const t = useToolMessages<'regex'>();
  const locale = useLocale();
  const numbers = new Intl.NumberFormat(locale);

  if (matches.length === 0) {
    return <p className="p-3 text-xs text-fg-subtle">{t.noMatches}</p>;
  }

  const range = (span: Span) => `${span[0]}–${span[1]}`;
  const shown = matches.slice(0, TABLE_LIMIT);
  return (
    <div className="min-h-0 flex-1 overflow-auto">
      <table className="w-full text-xs">
        <caption className="sr-only">{t.panels.matches}</caption>
        <thead className="sticky top-0 bg-surface">
          <tr className="text-fg-subtle">
            <th scope="col" className="w-40 px-3 py-1.5 text-start font-normal">
              {t.item}
            </th>
            <th scope="col" className="px-2 py-1.5 text-start font-normal">
              {t.value}
            </th>
            <th scope="col" className="w-24 px-3 py-1.5 text-end font-normal">
              {t.span}
            </th>
          </tr>
        </thead>
        {shown.map((match, index) => (
          <tbody key={match.start + ':' + index} className="border-t border-line">
            <tr className="align-top">
              <th scope="row" className="px-3 py-1.5 text-start font-medium text-fg">
                <button
                  type="button"
                  onClick={() => onReveal(match.start, match.end)}
                  className="cursor-pointer hover:underline focus-visible:underline focus-visible:outline-none"
                >
                  {fmt(t.match, { index: numbers.format(index + 1) })}
                </button>
              </th>
              <td
                dir="ltr"
                className="px-2 py-1.5 text-start font-mono text-fg [font-variant-ligatures:none]"
              >
                <Value text={text} span={[match.start, match.end]} />
              </td>
              <td dir="ltr" className="px-3 py-1.5 text-end font-mono text-fg-subtle">
                {range([match.start, match.end])}
              </td>
            </tr>
            {match.groups.map((span, groupIndex) => {
              const group = groups[groupIndex] as CaptureGroup | undefined;
              const number = groupIndex + 1;
              return (
                <tr key={number} className="align-top text-fg-muted">
                  <th scope="row" className="py-1 ps-5 pe-3 text-start font-normal">
                    <span className="flex items-center gap-1.5 whitespace-nowrap">
                      <GroupSwatch index={number} />
                      {span ? (
                        <button
                          type="button"
                          onClick={() => onReveal(span[0], span[1])}
                          className="cursor-pointer hover:underline focus-visible:underline focus-visible:outline-none"
                        >
                          {fmt(t.group, { index: number })}
                        </button>
                      ) : (
                        fmt(t.group, { index: number })
                      )}
                      {group?.name && (
                        <bdi dir="ltr" className="max-w-20 truncate font-mono text-fg-subtle">
                          {group.name}
                        </bdi>
                      )}
                    </span>
                  </th>
                  <td
                    dir="ltr"
                    className="px-2 py-1 text-start font-mono [font-variant-ligatures:none]"
                  >
                    <Value text={text} span={span} />
                  </td>
                  <td dir="ltr" className="px-3 py-1 text-end font-mono text-fg-subtle">
                    {span && range(span)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        ))}
      </table>
      {matches.length > TABLE_LIMIT && (
        <p className="border-t border-line p-3 text-xs text-fg-subtle">
          {fmt(t.tableTruncated, { count: numbers.format(TABLE_LIMIT) })}
        </p>
      )}
    </div>
  );
}
