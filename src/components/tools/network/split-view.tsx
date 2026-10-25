'use client';

import { useMemo } from 'react';
import { ADDRESS_BITS, formatIp } from '@/lib/tools/network/ip';
import { blockSize, describeCidr, formatCidr, parseCidr } from '@/lib/tools/network/cidr';
import { prefixForCount, splitCidr } from '@/lib/tools/network/subnet';
import { CopyButton, Segmented, ToolHeader } from '@/components/tools/workbench/toolbar';
import { SplitPane } from '@/components/tools/workbench/split-pane';
import { StatusBar, StatusItem } from '@/components/tools/workbench/status-bar';
import { NumberField, TextField } from '@/components/tools/crypto/parts';
import { PartHeading } from '@/components/tools/jwt/parts';
import { Note, translated } from '@/components/tools/time/parts';
import { useToolMessages } from '@/i18n/tools/provider';
import { useLocale } from '@/i18n/use-locale';
import { fmt } from '@/i18n/dictionary';
import { ErrorStatus, useFormatCount } from './parts';
import { useSplitOptions, type SplitOptions } from './state';

/** Rows rendered in the table; the full count is still reported. */
const MAX_LISTED = 1024;
/** Upper bound of the "number of subnets" field. */
const MAX_COUNT = 65536;

/** Splits a block into equal subnets, by new prefix length or by how many are needed. */
export function SplitView({ picker }: { picker: React.ReactNode }) {
  const t = useToolMessages<'network'>();
  const locale = useLocale();
  const formatCount = useFormatCount();
  const [options, setOptions] = useSplitOptions();
  const update = (patch: Partial<SplitOptions>) => setOptions({ ...options, ...patch });

  const block = useMemo(
    () => (options.block.trim() ? parseCidr(options.block) : null),
    [options.block]
  );
  const cidr = block?.ok ? block.value : null;
  const bits = cidr ? ADDRESS_BITS[cidr.version] : 32;

  const target = useMemo(() => {
    if (!cidr) return null;
    if (options.by === 'count') return prefixForCount(cidr, options.count);
    return { ok: true as const, value: options.prefix };
  }, [cidr, options.by, options.count, options.prefix]);

  const split = useMemo(
    () => (cidr && target?.ok ? splitCidr(cidr, target.value, MAX_LISTED) : null),
    [cidr, target]
  );
  const result = split?.ok ? split.value : null;
  const error =
    block?.ok === false
      ? block
      : target?.ok === false
        ? target
        : split?.ok === false
          ? split
          : null;
  const v4 = cidr?.version === 4;
  const numbers = new Intl.NumberFormat(locale);

  const subnetSize = result && cidr ? blockSize({ ...cidr, prefix: result.prefix }) : null;

  const formPane = (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      <PartHeading>{t.input}</PartHeading>
      <div className="min-h-0 flex-1 space-y-3 overflow-auto p-3 text-xs">
        <TextField
          label={t.block}
          value={options.block}
          onChange={(value) => update({ block: value })}
          placeholder={t.cidrPlaceholder}
          invalid={block?.ok === false}
        />
        <div className="flex flex-wrap items-center gap-2">
          <span className="w-24 shrink-0 text-fg-subtle">{t.splitBy}</span>
          <Segmented
            label={t.splitBy}
            value={options.by}
            onChange={(by) => update({ by })}
            options={[
              { value: 'prefix', label: t.byPrefix },
              { value: 'count', label: t.byCount },
            ]}
          />
        </div>
        {options.by === 'prefix' ? (
          <NumberField
            label={t.newPrefix}
            value={options.prefix}
            onChange={(prefix) => update({ prefix })}
            min={cidr?.prefix ?? 0}
            max={bits}
            hint={fmt(t.prefixRange, { min: cidr?.prefix ?? 0, max: bits })}
          />
        ) : (
          <NumberField
            label={t.subnetCount}
            value={options.count}
            onChange={(count) => update({ count })}
            min={1}
            max={MAX_COUNT}
            hint={t.countHint}
          />
        )}
        {error && <Note tone="danger">{error.message}</Note>}
        {result && subnetSize !== null && (
          <Note>
            {fmt(t.splitSummary, {
              count: formatCount(result.count),
              prefix: result.prefix,
              size: formatCount(subnetSize),
            })}
          </Note>
        )}
      </div>
    </div>
  );

  const cell = 'px-3 py-1 text-start font-mono whitespace-nowrap';
  const tablePane = (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      <PartHeading
        actions={
          <CopyButton
            label={t.copySubnets}
            getText={() => result?.subnets.map(formatCidr).join('\n') ?? ''}
            disabled={!result}
          />
        }
      >
        {t.subnets}
      </PartHeading>
      {result ? (
        <div className="min-h-0 flex-1 overflow-auto">
          <table dir="ltr" className="w-full border-collapse text-xs">
            <thead className="sticky top-0 bg-surface text-[11px] text-fg-muted">
              <tr className="border-b border-line">
                <th className={cell}>{translated(t.columns.index)}</th>
                <th className={cell}>{translated(t.columns.subnet)}</th>
                <th className={cell}>{translated(v4 ? t.rows.firstHost : t.rows.firstAddress)}</th>
                <th className={cell}>{translated(v4 ? t.rows.lastHost : t.rows.lastAddress)}</th>
                {v4 && <th className={cell}>{translated(t.rows.broadcast)}</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-line text-fg">
              {result.subnets.map((subnet, index) => {
                const details = describeCidr(subnet);
                const ip = (value: bigint) => formatIp(subnet.version, value);
                return (
                  <tr key={index} className="hover:bg-surface-2">
                    <td className={`${cell} text-fg-subtle`}>{numbers.format(index + 1)}</td>
                    <td className={`${cell} select-all`}>{formatCidr(subnet)}</td>
                    <td className={cell}>{ip(details.firstHost)}</td>
                    <td className={cell}>{ip(details.lastHost)}</td>
                    {v4 && (
                      <td className={cell}>
                        {details.broadcast !== null ? ip(details.broadcast) : '—'}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
          {result.count > BigInt(result.subnets.length) && (
            <p className="p-3 text-[11px] text-fg-subtle">
              {fmt(t.showingFirst, {
                shown: numbers.format(result.subnets.length),
                total: formatCount(result.count),
              })}
            </p>
          )}
        </div>
      ) : (
        <p className="p-3 text-xs text-fg-subtle">{error ? t.fixInput : t.empty}</p>
      )}
    </div>
  );

  return (
    <>
      <ToolHeader slug="network">{picker}</ToolHeader>
      <SplitPane id="network-split" first={formPane} second={tablePane} defaultRatio={0.35} />
      <StatusBar>
        <ErrorStatus result={error} />
        {result && (
          <StatusItem tone="success" className="shrink-0">
            {fmt(t.subnetStatus, { count: formatCount(result.count), prefix: result.prefix })}
          </StatusItem>
        )}
      </StatusBar>
    </>
  );
}
