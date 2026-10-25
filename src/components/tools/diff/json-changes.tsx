'use client';

import type { JsonChange } from '@/lib/tools/diff/json';
import type { JsonNode } from '@/lib/tools/json/parse';
import { stringifyJson } from '@/lib/tools/json/format';
import { formatPath } from '@/lib/tools/json/path';
import { StateBadge, type Tone } from '@/components/tools/jwt/parts';
import { useToolMessages } from '@/i18n/tools/provider';

/** Longer values are cut in the cell; the full text is in its tooltip. */
const MAX_VALUE_CHARS = 160;
const MAX_TITLE_CHARS = 4_000;

const KIND_TONES: Record<JsonChange['kind'], Tone> = {
  added: 'success',
  removed: 'danger',
  changed: 'warning',
};

const KIND_MARKS: Record<JsonChange['kind'], string> = { added: '+', removed: '−', changed: '~' };

function Value({ node }: { node: JsonNode | undefined }) {
  if (!node) return null;
  const text = stringifyJson(node);
  return (
    <span
      dir="ltr"
      title={text.length > MAX_VALUE_CHARS ? text.slice(0, MAX_TITLE_CHARS) : undefined}
    >
      {text.length > MAX_VALUE_CHARS ? `${text.slice(0, MAX_VALUE_CHARS)}…` : text}
    </span>
  );
}

/** Path-by-path list of what changed between two JSON documents. */
export function JsonChanges({ changes }: { changes: JsonChange[] }) {
  const t = useToolMessages<'diff'>();

  if (changes.length === 0) {
    return <p className="m-auto max-w-xs p-6 text-center text-xs text-fg-subtle">{t.noChanges}</p>;
  }

  return (
    <div className="min-h-0 flex-1 overflow-auto">
      <table className="w-full border-collapse text-xs">
        <caption className="sr-only">{t.changesLabel}</caption>
        <thead className="sticky top-0 z-10 bg-surface text-[11px] font-semibold tracking-wide text-fg-muted uppercase">
          <tr className="border-b border-line">
            <th scope="col" className="w-0 px-3 py-1.5 text-start">
              {t.kind}
            </th>
            <th scope="col" className="px-3 py-1.5 text-start">
              {t.path}
            </th>
            <th scope="col" className="px-3 py-1.5 text-start">
              {t.before}
            </th>
            <th scope="col" className="px-3 py-1.5 text-start">
              {t.after}
            </th>
          </tr>
        </thead>
        <tbody className="font-mono">
          {changes.map((change, index) => (
            <tr key={index} className="border-b border-line align-top hover:bg-surface-2/60">
              <td className="px-3 py-1.5">
                <StateBadge tone={KIND_TONES[change.kind]}>
                  <span aria-hidden>{KIND_MARKS[change.kind]}</span>
                  <span className="font-sans">{t.kinds[change.kind]}</span>
                </StateBadge>
              </td>
              <td className="px-3 py-1.5 break-all text-fg">
                <span dir="ltr">{formatPath(change.path)}</span>
              </td>
              <td className="px-3 py-1.5 break-all text-danger">
                <Value node={'before' in change ? change.before : undefined} />
              </td>
              <td className="px-3 py-1.5 break-all text-success">
                <Value node={'after' in change ? change.after : undefined} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
