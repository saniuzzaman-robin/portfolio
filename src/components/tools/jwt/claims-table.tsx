'use client';

import { useMemo } from 'react';
import {
  claimTimeState,
  looksLikeMilliseconds,
  relativeTime,
  tokenTimeStatus,
  type Claim,
  type ClaimTimeState,
  type TokenTimeStatus,
} from '@/lib/tools/jwt/claims';
import { StatusItem } from '@/components/tools/workbench/status-bar';
import { useNow } from '@/components/tools/workbench/use-now';
import { useToolMessages } from '@/i18n/tools/provider';
import type { ToolMessages } from '@/i18n/tools/en';
import { useLocale } from '@/i18n/use-locale';
import { StateBadge, type Tone } from './parts';

type JwtMessages = ToolMessages['jwt'];
type StateKey = 'expired' | 'active' | 'notYetValid' | 'future' | 'noExpiry';
type Formats = {
  local: Intl.DateTimeFormat;
  utc: Intl.DateTimeFormat;
  relative: Intl.RelativeTimeFormat;
};

const CLAIM_STATES: Record<ClaimTimeState, { tone: Tone; key: StateKey }> = {
  expired: { tone: 'danger', key: 'expired' },
  valid: { tone: 'success', key: 'active' },
  notYetValid: { tone: 'warning', key: 'notYetValid' },
  future: { tone: 'warning', key: 'future' },
};

const TOKEN_STATES: Record<TokenTimeStatus, { tone: Tone; key: StateKey }> = {
  expired: { tone: 'danger', key: 'expired' },
  notYetValid: { tone: 'warning', key: 'notYetValid' },
  valid: { tone: 'success', key: 'active' },
  noExpiry: { tone: 'muted', key: 'noExpiry' },
};

const seconds = (ms: number) => Math.floor(ms / 1000);

function claimHint(t: JwtMessages, name: string): string | null {
  const hints: Record<string, string> = t.claimHints;
  return Object.hasOwn(hints, name) ? hints[name] : null;
}

/**
 * Every payload claim with its value; time claims also show local, UTC and relative time and
 * whether they make the token expired or not yet valid. Times appear only after hydration,
 * since they depend on the clock and the viewer's time zone.
 */
export function ClaimsTable({ claims }: { claims: Claim[] }) {
  const t = useToolMessages<'jwt'>();
  const locale = useLocale();
  const now = useNow();
  const formats = useMemo(
    (): Formats => ({
      local: new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'long' }),
      utc: new Intl.DateTimeFormat(locale, {
        dateStyle: 'medium',
        timeStyle: 'long',
        timeZone: 'UTC',
      }),
      relative: new Intl.RelativeTimeFormat(locale, { numeric: 'auto' }),
    }),
    [locale]
  );

  if (claims.length === 0) return <p className="px-3 py-2 text-xs text-fg-subtle">{t.noClaims}</p>;
  return (
    <table className="w-full border-collapse text-xs">
      <thead className="sr-only">
        <tr>
          <th scope="col">{t.claim}</th>
          <th scope="col">{t.value}</th>
        </tr>
      </thead>
      <tbody>
        {claims.map((claim, index) => {
          const hint = claimHint(t, claim.name);
          return (
            <tr key={index} className="border-b border-line align-top">
              <th scope="row" className="w-px px-3 py-1.5 text-start font-normal whitespace-nowrap">
                <bdi dir="ltr" className="block font-mono text-code-property">
                  {claim.name}
                </bdi>
                {hint && <span className="block text-[11px] text-fg-subtle">{hint}</span>}
              </th>
              <td className="px-3 py-1.5">
                <bdi dir="ltr" className="block font-mono break-all text-fg">
                  {claim.text}
                </bdi>
                {claim.time !== null && now !== null && (
                  <TimeDetails
                    name={claim.name}
                    time={claim.time}
                    nowSeconds={seconds(now)}
                    formats={formats}
                    t={t}
                  />
                )}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

function TimeDetails({
  name,
  time,
  nowSeconds,
  formats,
  t,
}: {
  name: string;
  time: number;
  nowSeconds: number;
  formats: Formats;
  t: JwtMessages;
}) {
  const state = claimTimeState(name, time, nowSeconds);
  const badge = state && CLAIM_STATES[state];
  const date = new Date(time * 1000);
  const { value, unit } = relativeTime(time, nowSeconds);
  return (
    <div className="mt-1 space-y-0.5 text-[11px] text-fg-muted">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
        {badge && <StateBadge tone={badge.tone}>{t[badge.key]}</StateBadge>}
        <span>{formats.relative.format(value, unit)}</span>
      </div>
      <div>
        <span className="text-fg-subtle">{t.local}:</span> <bdi>{formats.local.format(date)}</bdi>
      </div>
      <div>
        <span className="text-fg-subtle">{t.utc}:</span> <bdi>{formats.utc.format(date)}</bdi>
      </div>
      {looksLikeMilliseconds(time) && <div className="text-warning">{t.milliseconds}</div>}
    </div>
  );
}

/** Status-bar summary of the token's validity window (client-only, like the claim times). */
export function TokenTimeStatusItem({ claims }: { claims: Claim[] }) {
  const t = useToolMessages<'jwt'>();
  const now = useNow();
  if (now === null) return null;
  const { tone, key } = TOKEN_STATES[tokenTimeStatus(claims, seconds(now))];
  return (
    <StatusItem tone={tone} className="shrink-0">
      {t[key]}
    </StatusItem>
  );
}
