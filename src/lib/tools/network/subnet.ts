import { ADDRESS_BITS, ONE, type IpResult, type IpVersion } from './ip';
import { blockSize, containsCidr, makeCidr, parseCidr, type Cidr } from './cidr';

export type Split = {
  prefix: number;
  /** How many subnets the block splits into (can be astronomically large for IPv6). */
  count: bigint;
  /** The first subnets, at most `limit` of them. */
  subnets: Cidr[];
};

/** Splits `cidr` into equal subnets of length `prefix`, listing at most `limit` of them. */
export function splitCidr(cidr: Cidr, prefix: number, limit: number): IpResult<Split> {
  const bits = ADDRESS_BITS[cidr.version];
  if (!Number.isInteger(prefix) || prefix < cidr.prefix || prefix > bits) {
    return {
      ok: false,
      message: `The new prefix must be between /${cidr.prefix} and /${bits}`,
    };
  }
  const count = ONE << BigInt(prefix - cidr.prefix);
  const step = ONE << BigInt(bits - prefix);
  const shown = count < BigInt(limit) ? Number(count) : limit;
  const subnets: Cidr[] = [];
  for (let index = 0; index < shown; index++) {
    subnets.push(makeCidr(cidr.version, cidr.network + step * BigInt(index), prefix));
  }
  return { ok: true, value: { prefix, count, subnets } };
}

/** The longest prefix that still yields at least `count` subnets of `cidr`. */
export function prefixForCount(cidr: Cidr, count: number): IpResult<number> {
  if (!Number.isInteger(count) || count < 1) {
    return { ok: false, message: 'The number of subnets must be a whole number of at least 1' };
  }
  const extra = count === 1 ? 0 : (count - 1).toString(2).length;
  const prefix = cidr.prefix + extra;
  const bits = ADDRESS_BITS[cidr.version];
  if (prefix > bits) {
    const most = blockSize(cidr);
    return { ok: false, message: `A /${cidr.prefix} has room for at most ${most} subnets` };
  }
  return { ok: true, value: prefix };
}

/** `from`/`to` are offsets of the entry's text in the list, for editor diagnostics and jumps. */
export type ListEntry = { line: number; from: number; to: number; text: string; cidr: Cidr };
export type ListError = { line: number; from: number; to: number; message: string };

/**
 * One CIDR or address per line. Blank lines and `#` comments (whole-line or trailing) are
 * skipped.
 */
export function parseCidrList(text: string): { entries: ListEntry[]; errors: ListError[] } {
  const entries: ListEntry[] = [];
  const errors: ListError[] = [];
  let offset = 0;
  text.split('\n').forEach((raw, index) => {
    const content = raw.split('#')[0];
    const start = content.length - content.trimStart().length;
    const value = content.trim();
    if (value) {
      const parsed = parseCidr(value);
      const span = { line: index + 1, from: offset + start, to: offset + start + value.length };
      if (parsed.ok) entries.push({ ...span, text: value, cidr: parsed.value });
      else errors.push({ ...span, message: parsed.message });
    }
    offset += raw.length + 1;
  });
  return { entries, errors };
}

export type Overlap = {
  /** The wider (or, for duplicates, the earlier) block. */
  outer: ListEntry;
  inner: ListEntry;
  relation: 'duplicate' | 'contains';
};

/**
 * Pairs of listed blocks that overlap. CIDR blocks never partly overlap: one always contains
 * the other. Sorted by start address so each block is only compared with blocks it can reach.
 */
export function findOverlaps(
  entries: ListEntry[],
  limit: number
): { overlaps: Overlap[]; truncated: boolean } {
  const byVersion = (version: IpVersion) =>
    entries
      .filter((entry) => entry.cidr.version === version)
      .sort(
        (a, b) =>
          (a.cidr.network < b.cidr.network ? -1 : a.cidr.network > b.cidr.network ? 1 : 0) ||
          a.cidr.prefix - b.cidr.prefix ||
          a.line - b.line
      );
  const overlaps: Overlap[] = [];
  for (const sorted of [byVersion(4), byVersion(6)]) {
    for (let i = 0; i < sorted.length; i++) {
      const outer = sorted[i];
      for (let j = i + 1; j < sorted.length && sorted[j].cidr.network <= outer.cidr.last; j++) {
        const inner = sorted[j];
        if (!containsCidr(outer.cidr, inner.cidr)) continue;
        if (overlaps.length === limit) return { overlaps, truncated: true };
        const duplicate = outer.cidr.prefix === inner.cidr.prefix;
        overlaps.push({ outer, inner, relation: duplicate ? 'duplicate' : 'contains' });
      }
    }
  }
  return { overlaps, truncated: false };
}
