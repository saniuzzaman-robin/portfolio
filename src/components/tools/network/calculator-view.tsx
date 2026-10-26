'use client';

import { useMemo } from 'react';
import { Eraser } from 'lucide-react';
import { binaryGroups, expandIpv6, formatIp, reverseDnsName } from '@/lib/tools/network/ip';
import { describeCidr, formatCidr, parseCidr, type SpecialRange } from '@/lib/tools/network/cidr';
import { IconAction, RunButton, ToolHeader } from '@/components/tools/workbench/toolbar';
import { SplitPane } from '@/components/tools/workbench/split-pane';
import { StaleStatus, StatusBar, StatusItem } from '@/components/tools/workbench/status-bar';
import {
  RUN_SHORTCUT,
  STALE_OUTPUT_CLASS,
  useRunInput,
} from '@/components/tools/workbench/use-run';
import { cn } from '@/lib/cn';
import { DetailList, TextField } from '@/components/tools/crypto/parts';
import { PartHeading } from '@/components/tools/jwt/parts';
import { CopyValue, Note, translated } from '@/components/tools/time/parts';
import { useToolCommon, useToolMessages } from '@/i18n/tools/provider';
import { fmt } from '@/i18n/dictionary';
import { BitGroups, ErrorStatus, Examples, useFormatCount } from './parts';
import { useCidrInput } from './state';

const EXAMPLES = [
  '192.168.1.10/24',
  '10.0.0.0/255.255.240.0',
  '100.64.0.1',
  '2001:db8::/48',
  'fe80::1/64',
];

type Row = [label: string, value: React.ReactNode];

/** One block in, everything about it out: masks, host range, counts, scope and bits. */
export function CalculatorView({ picker }: { picker: React.ReactNode }) {
  const common = useToolCommon();
  const t = useToolMessages<'network'>();
  const [input, setInput] = useCidrInput();
  const formatCount = useFormatCount();
  // Results wait for Calculate (or Ctrl/⌘+Enter); the field only validates as you type.
  const { value: live, run, ran, stale } = useRunInput(input);
  const draft = useMemo(() => (input.trim() ? parseCidr(input) : null), [input]);
  const parsed = useMemo(() => (live.trim() ? parseCidr(live) : null), [live]);
  const pick = (next: string) => {
    setInput(next);
    run(next);
  };
  const details = parsed?.ok ? describeCidr(parsed.value) : null;

  const scopeText = (ranges: SpecialRange[]) =>
    ranges.map((range) => `${t.scopes[range.id]} (${range.cidr}, ${range.rfc})`).join('\n');

  const rows: Row[] = [];
  if (details) {
    const { cidr } = details;
    const ip = (value: bigint) => formatIp(cidr.version, value);
    const value = (text: string) => <CopyValue text={text} />;
    // Counts show in the locale's digits but copy as plain numbers.
    const count = (n: bigint) => <CopyValue text={n.toString()}>{formatCount(n)}</CopyValue>;
    const v4 = cidr.version === 4;
    rows.push([t.rows.network, value(formatCidr(cidr))]);
    if (details.hostBitsSet) rows.push([t.rows.address, value(ip(cidr.address))]);
    rows.push([t.rows.netmask, value(ip(details.mask))], [t.rows.prefix, value(`/${cidr.prefix}`)]);
    if (v4) rows.push([t.rows.wildcard, value(ip(details.wildcard))]);
    if (details.broadcast !== null) rows.push([t.rows.broadcast, value(ip(details.broadcast))]);
    rows.push(
      [v4 ? t.rows.firstHost : t.rows.firstAddress, value(ip(details.firstHost))],
      [v4 ? t.rows.lastHost : t.rows.lastAddress, value(ip(details.lastHost))],
      [t.rows.addresses, count(details.addresses)]
    );
    if (v4) rows.push([t.rows.hosts, count(details.hosts)]);
    if (details.ipv4Class) rows.push([t.rows.ipClass, value(details.ipv4Class)]);
    const within = details.scope.within.length ? scopeText(details.scope.within) : t.public;
    rows.push([
      t.rows.scope,
      <CopyValue key="scope" text={within}>
        <span dir="auto" className="whitespace-pre-line">
          {within}
        </span>
      </CopyValue>,
    ]);
    if (details.scope.includes.length) {
      const includes = scopeText(details.scope.includes);
      rows.push([
        t.rows.includes,
        <CopyValue key="includes" text={includes}>
          <span dir="auto" className="whitespace-pre-line">
            {includes}
          </span>
        </CopyValue>,
      ]);
    }
    if (!v4) rows.push([t.rows.expanded, value(expandIpv6(cidr.address))]);
    rows.push(
      [t.rows.decimal, value(cidr.address.toString())],
      [t.rows.hex, value(`0x${cidr.address.toString(16).padStart(v4 ? 8 : 32, '0')}`)],
      [t.rows.reverse, value(reverseDnsName(cidr.version, cidr.address))]
    );
  }

  const inputPane = (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      <PartHeading>{t.input}</PartHeading>
      <div className="min-h-0 flex-1 space-y-3 overflow-auto p-3 text-xs">
        <TextField
          label={t.cidr}
          value={input}
          onChange={setInput}
          placeholder={t.cidrPlaceholder}
          invalid={draft?.ok === false || (ran && !live.trim())}
        >
          <IconAction
            icon={Eraser}
            label={common.clear}
            onClick={() => pick('')}
            disabled={!input}
          />
        </TextField>
        <Note>{t.cidrHint}</Note>
        <Examples label={t.examples} values={EXAMPLES} onPick={pick} />
        {draft?.ok === false && <Note tone="danger">{draft.message}</Note>}
        {details?.hostBitsSet && (
          <Note tone="warning">{fmt(t.hostBitsNote, { network: formatCidr(details.cidr) })}</Note>
        )}
      </div>
    </div>
  );

  const resultsPane = (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-auto">
      <PartHeading>{t.results}</PartHeading>
      <div className={cn('p-3', stale && STALE_OUTPUT_CLASS)}>
        {rows.length > 0 ? (
          <DetailList rows={rows} className="items-start" />
        ) : (
          <p className="text-xs text-fg-subtle">
            {translated(
              !ran
                ? fmt(common.runHint, { action: t.calculateAction, shortcut: RUN_SHORTCUT })
                : parsed
                  ? t.fixInput
                  : t.empty
            )}
          </p>
        )}
      </div>
      {details && (
        <section className={cn(stale && STALE_OUTPUT_CLASS)}>
          <PartHeading>{t.binary}</PartHeading>
          <div className="space-y-2 p-3 text-xs">
            <DetailList
              className="items-start"
              rows={[
                [
                  t.rows.address,
                  <BitGroups
                    key="address"
                    groups={binaryGroups(details.cidr.version, details.cidr.address)}
                    prefix={details.cidr.prefix}
                  />,
                ],
                [
                  t.rows.netmask,
                  <BitGroups
                    key="mask"
                    groups={binaryGroups(details.cidr.version, details.mask)}
                    prefix={details.cidr.prefix}
                  />,
                ],
                [
                  t.rows.network,
                  <BitGroups
                    key="network"
                    groups={binaryGroups(details.cidr.version, details.cidr.network)}
                    prefix={details.cidr.prefix}
                  />,
                ],
              ]}
            />
            <Note>{t.binaryHint}</Note>
          </div>
        </section>
      )}
    </div>
  );

  return (
    <>
      <ToolHeader
        slug="network"
        actions={<RunButton label={t.calculateAction} onRun={() => run()} pending={stale} />}
      >
        {picker}
      </ToolHeader>
      <SplitPane
        id="network-calculator"
        first={inputPane}
        second={resultsPane}
        defaultRatio={0.4}
      />
      <StatusBar>
        {stale && <StaleStatus action={t.calculateAction} onRun={() => run()} />}
        {ran && !live.trim() && (
          <StatusItem tone="danger" className="font-sans">
            {fmt(common.enterInput, { action: t.calculateAction })}
          </StatusItem>
        )}
        <ErrorStatus result={parsed} />
        {details && (
          <StatusItem tone="success" className="shrink-0">
            {fmt(t.familyStatus, { version: details.cidr.version, prefix: details.cidr.prefix })}
          </StatusItem>
        )}
        {details && (
          <StatusItem className="shrink-0 max-sm:hidden">
            {fmt(t.addressesStatus, { count: formatCount(details.addresses) })}
          </StatusItem>
        )}
      </StatusBar>
    </>
  );
}
