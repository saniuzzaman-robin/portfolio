import { stringifyJson } from '@/lib/tools/json/format';
import type { JsonObject } from '@/lib/tools/json/parse';

/** Claims holding a NumericDate (seconds since the epoch). */
export const TIME_CLAIMS: ReadonlySet<string> = new Set(['exp', 'nbf', 'iat', 'auth_time']);

/** Largest |seconds| a JS Date can represent. */
const MAX_DATE_SECONDS = 8.64e12;
/** Seconds past this are year 5138+, so the value is almost certainly milliseconds. */
const MILLISECONDS_THRESHOLD = 1e11;

export type Claim = {
  name: string;
  /** Strings as they are, anything else as compact JSON (numbers exactly as written). */
  text: string;
  /** Time claims only: the NumericDate in seconds, or null if it isn't a usable number. */
  time: number | null;
};

export function readClaims(payload: JsonObject): Claim[] {
  return payload.entries.map(({ key, value }) => {
    const seconds = value.type === 'number' ? Number(value.raw) : NaN;
    const usable = Number.isFinite(seconds) && Math.abs(seconds) <= MAX_DATE_SECONDS;
    return {
      name: key,
      text: value.type === 'string' ? value.value : stringifyJson(value),
      time: TIME_CLAIMS.has(key) && usable ? seconds : null,
    };
  });
}

export type ClaimTimeState = 'expired' | 'valid' | 'notYetValid' | 'future';

/**
 * How a time claim compares with now (RFC 7519 §4.1.4–4.1.6, no clock-skew allowance):
 * `exp` is expired at or after its time, `nbf` is not yet valid before it, and an `iat` or
 * `auth_time` in the future is suspicious.
 */
export function claimTimeState(
  name: string,
  time: number,
  nowSeconds: number
): ClaimTimeState | null {
  if (name === 'exp') return nowSeconds >= time ? 'expired' : 'valid';
  if (name === 'nbf') return nowSeconds < time ? 'notYetValid' : 'valid';
  return time > nowSeconds ? 'future' : null;
}

export type TokenTimeStatus = 'expired' | 'notYetValid' | 'valid' | 'noExpiry';

/** The token's overall validity window; with duplicate claims the last one counts. */
export function tokenTimeStatus(claims: Claim[], nowSeconds: number): TokenTimeStatus {
  const last = (name: string) => claims.findLast((claim) => claim.name === name)?.time ?? null;
  const exp = last('exp');
  const nbf = last('nbf');
  if (exp !== null && nowSeconds >= exp) return 'expired';
  if (nbf !== null && nowSeconds < nbf) return 'notYetValid';
  return exp === null ? 'noExpiry' : 'valid';
}

export function looksLikeMilliseconds(seconds: number): boolean {
  return Math.abs(seconds) >= MILLISECONDS_THRESHOLD;
}

const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ['year', 31_536_000],
  ['month', 2_592_000],
  ['week', 604_800],
  ['day', 86_400],
  ['hour', 3_600],
  ['minute', 60],
  ['second', 1],
];

/**
 * `target - now` in the largest whole unit, for `Intl.RelativeTimeFormat`. Truncated rather than
 * rounded, so "in 23 hours" is never shown as "in 1 day".
 */
export function relativeTime(
  targetSeconds: number,
  nowSeconds: number
): { value: number; unit: Intl.RelativeTimeFormatUnit } {
  const diff = targetSeconds - nowSeconds;
  for (const [unit, size] of UNITS) {
    if (Math.abs(diff) >= size) return { value: Math.trunc(diff / size), unit };
  }
  return { value: 0, unit: 'second' };
}
