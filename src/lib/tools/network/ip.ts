/**
 * IPv4 and IPv6 addresses as BigInts, so both families share one set of bit operations.
 * The tsconfig target has no BigInt literals, hence `BigInt(…)` for constants.
 */

export type IpVersion = 4 | 6;
export type IpAddress = { version: IpVersion; value: bigint };
export type IpResult<T> = { ok: true; value: T } | { ok: false; message: string };

export const ADDRESS_BITS: Record<IpVersion, number> = { 4: 32, 6: 128 };

export const ZERO = BigInt(0);
export const ONE = BigInt(1);
const BYTE = BigInt(8);
const GROUP = BigInt(16);
const BYTE_MASK = BigInt(0xff);
const GROUP_MASK = BigInt(0xffff);

const fail = (message: string): { ok: false; message: string } => ({ ok: false, message });

/** Dotted quad with decimal octets. Leading zeros are refused: some tools read them as octal. */
function parseIpv4(text: string): IpResult<bigint> {
  const parts = text.split('.');
  if (parts.length !== 4) return fail(`An IPv4 address has 4 parts separated by dots: "${text}"`);
  let value = ZERO;
  for (const part of parts) {
    if (!/^\d{1,3}$/.test(part)) return fail(`"${part}" is not an IPv4 octet (0–255)`);
    if (part.length > 1 && part.startsWith('0')) {
      return fail(`"${part}" has a leading zero, which some tools read as octal`);
    }
    const octet = Number(part);
    if (octet > 255) return fail(`${octet} is out of range for an IPv4 octet (0–255)`);
    value = (value << BYTE) | BigInt(octet);
  }
  return { ok: true, value };
}

/** Colon-separated groups; only the address's last group may be a dotted IPv4 tail. */
function parseGroups(text: string, last: boolean): IpResult<number[]> {
  if (text === '') return { ok: true, value: [] };
  const groups: number[] = [];
  const parts = text.split(':');
  for (let index = 0; index < parts.length; index++) {
    const part = parts[index];
    if (part.includes('.') && last && index === parts.length - 1) {
      const v4 = parseIpv4(part);
      if (!v4.ok) return v4;
      const value = Number(v4.value);
      groups.push(Math.floor(value / 0x10000), value % 0x10000);
    } else if (/^[0-9a-f]{1,4}$/i.test(part)) {
      groups.push(parseInt(part, 16));
    } else {
      return fail(
        part === '' ? 'Empty IPv6 group' : `"${part}" is not an IPv6 group (1–4 hex digits)`
      );
    }
  }
  return { ok: true, value: groups };
}

/** RFC 4291 text forms: eight groups, one `::`, and an optional dotted IPv4 tail. */
function parseIpv6(text: string): IpResult<bigint> {
  if (text.includes('%')) return fail('Zone IDs (like %eth0) are not supported');
  const halves = text.split('::');
  if (halves.length > 2) return fail('"::" can only appear once');
  const head = parseGroups(halves[0], halves.length === 1);
  if (!head.ok) return head;
  const tail =
    halves.length === 2 ? parseGroups(halves[1], true) : { ok: true as const, value: [] };
  if (!tail.ok) return tail;
  const count = head.value.length + tail.value.length;
  let groups: number[];
  if (halves.length === 2) {
    if (count > 7) return fail('Too many groups for "::" to stand for any zeros');
    groups = [...head.value, ...Array<number>(8 - count).fill(0), ...tail.value];
  } else {
    if (count !== 8) return fail(`An IPv6 address has 8 groups; this one has ${count}`);
    groups = head.value;
  }
  return {
    ok: true,
    value: groups.reduce((value, group) => (value << GROUP) | BigInt(group), ZERO),
  };
}

/** Parses an IPv4 or IPv6 address (IPv6 may be in brackets, as in URLs). */
export function parseIp(input: string): IpResult<IpAddress> {
  let text = input.trim();
  if (text === '') return fail('Enter an IPv4 or IPv6 address');
  if (text.startsWith('[') && text.endsWith(']')) text = text.slice(1, -1);
  if (text.includes(':')) {
    const v6 = parseIpv6(text);
    return v6.ok ? { ok: true, value: { version: 6, value: v6.value } } : v6;
  }
  const v4 = parseIpv4(text);
  return v4.ok ? { ok: true, value: { version: 4, value: v4.value } } : v4;
}

function ipv4Text(value: bigint): string {
  const octets: string[] = [];
  for (let shift = 24; shift >= 0; shift -= 8) {
    octets.push(String((value >> BigInt(shift)) & BYTE_MASK));
  }
  return octets.join('.');
}

function ipv6Groups(value: bigint): number[] {
  const groups: number[] = [];
  for (let shift = 112; shift >= 0; shift -= 16) {
    groups.push(Number((value >> BigInt(shift)) & GROUP_MASK));
  }
  return groups;
}

const MAPPED_PREFIX = BigInt('0xffff00000000');
const MAPPED_MASK = BigInt('0xffffffffffffffffffffffff00000000');
const V4_MASK = BigInt(0xffffffff);

/**
 * RFC 5952 canonical text: lowercase, no leading zeros, the longest run of two or more zero
 * groups as `::` (the first on a tie), and IPv4-mapped addresses with a dotted tail.
 */
function ipv6Text(value: bigint): string {
  if ((value & MAPPED_MASK) === MAPPED_PREFIX) return `::ffff:${ipv4Text(value & V4_MASK)}`;
  const groups = ipv6Groups(value);
  let bestStart = -1;
  let bestLength = 1;
  for (let start = 0; start < 8; start++) {
    let end = start;
    while (end < 8 && groups[end] === 0) end++;
    if (end - start > bestLength) {
      bestStart = start;
      bestLength = end - start;
    }
    start = end;
  }
  const hex = groups.map((group) => group.toString(16));
  if (bestStart < 0) return hex.join(':');
  return `${hex.slice(0, bestStart).join(':')}::${hex.slice(bestStart + bestLength).join(':')}`;
}

export function formatIp(version: IpVersion, value: bigint): string {
  return version === 4 ? ipv4Text(value) : ipv6Text(value);
}

/** All eight IPv6 groups with four digits each ("2001:0db8:0000:…"). */
export function expandIpv6(value: bigint): string {
  return ipv6Groups(value)
    .map((group) => group.toString(16).padStart(4, '0'))
    .join(':');
}

/** Bits grouped like the text form: octets joined by dots (IPv4) or 16-bit groups by colons. */
export function binaryGroups(version: IpVersion, value: bigint): string[] {
  const bits = value.toString(2).padStart(ADDRESS_BITS[version], '0');
  const size = version === 4 ? 8 : 16;
  const groups: string[] = [];
  for (let index = 0; index < bits.length; index += size)
    groups.push(bits.slice(index, index + size));
  return groups;
}

/** The reverse-DNS name (in-addr.arpa / ip6.arpa) of an address. */
export function reverseDnsName(version: IpVersion, value: bigint): string {
  if (version === 4) return `${ipv4Text(value).split('.').reverse().join('.')}.in-addr.arpa`;
  return `${value.toString(16).padStart(32, '0').split('').reverse().join('.')}.ip6.arpa`;
}
