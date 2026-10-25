import { ADDRESS_BITS, ONE, formatIp, parseIp, type IpResult, type IpVersion } from './ip';

/** A CIDR block. `address` is what was typed; `network` has the host bits cleared. */
export type Cidr = {
  version: IpVersion;
  prefix: number;
  address: bigint;
  network: bigint;
  /** Last address in the block (the IPv4 broadcast address for prefixes below /31). */
  last: bigint;
};

const allOnes = (bits: number) => (ONE << BigInt(bits)) - ONE;

/** Netmask for `prefix` leading one bits. */
export function prefixMask(version: IpVersion, prefix: number): bigint {
  const bits = ADDRESS_BITS[version];
  return allOnes(bits) ^ allOnes(bits - prefix);
}

export function makeCidr(version: IpVersion, address: bigint, prefix: number): Cidr {
  const mask = prefixMask(version, prefix);
  const network = address & mask;
  return {
    version,
    prefix,
    address,
    network,
    last: network | (allOnes(ADDRESS_BITS[version]) ^ mask),
  };
}

/** Prefix length of a contiguous dotted IPv4 netmask, or null if it has gaps. */
function maskPrefix(mask: bigint): number | null {
  const bits = mask.toString(2).padStart(32, '0');
  const prefix = bits.indexOf('0') < 0 ? 32 : bits.indexOf('0');
  return bits.slice(prefix).includes('1') ? null : prefix;
}

/**
 * Parses `address/prefix`, `address/255.255.255.0` (IPv4) or a bare address (a single-host
 * block, /32 or /128).
 */
export function parseCidr(input: string): IpResult<Cidr> {
  const text = input.trim();
  const slash = text.indexOf('/');
  const ip = parseIp(slash < 0 ? text : text.slice(0, slash));
  if (!ip.ok) return ip;
  const { version, value } = ip.value;
  const bits = ADDRESS_BITS[version];
  if (slash < 0) return { ok: true, value: makeCidr(version, value, bits) };

  const suffix = text.slice(slash + 1).trim();
  let prefix: number;
  if (/^\d{1,3}$/.test(suffix)) {
    prefix = Number(suffix);
    if (prefix > bits) {
      return { ok: false, message: `/${prefix} is too long for IPv${version} (max /${bits})` };
    }
  } else if (version === 4 && suffix.includes('.')) {
    const mask = parseIp(suffix);
    if (!mask.ok || mask.value.version !== 4) {
      return { ok: false, message: `"${suffix}" is not a netmask` };
    }
    const fromMask = maskPrefix(mask.value.value);
    if (fromMask === null) {
      return { ok: false, message: `${suffix} is not a contiguous netmask` };
    }
    prefix = fromMask;
  } else {
    return { ok: false, message: `"/${suffix}" is not a prefix length (0–${bits})` };
  }
  return { ok: true, value: makeCidr(version, value, prefix) };
}

export function formatCidr(cidr: Cidr): string {
  return `${formatIp(cidr.version, cidr.network)}/${cidr.prefix}`;
}

export function blockSize(cidr: Cidr): bigint {
  return ONE << BigInt(ADDRESS_BITS[cidr.version] - cidr.prefix);
}

export function containsAddress(cidr: Cidr, version: IpVersion, value: bigint): boolean {
  return cidr.version === version && value >= cidr.network && value <= cidr.last;
}

/** True when `outer` covers all of `inner` (CIDR blocks either nest or don't touch). */
export function containsCidr(outer: Cidr, inner: Cidr): boolean {
  return (
    outer.version === inner.version &&
    outer.prefix <= inner.prefix &&
    containsAddress(outer, inner.version, inner.network)
  );
}

export type SpecialRangeId =
  | 'thisNetwork'
  | 'private'
  | 'sharedAddress'
  | 'loopback'
  | 'linkLocal'
  | 'ietfProtocol'
  | 'documentation'
  | 'relay6to4'
  | 'benchmarking'
  | 'multicast'
  | 'reserved'
  | 'broadcast'
  | 'unspecified'
  | 'ipv4Mapped'
  | 'nat64'
  | 'discard'
  | 'teredo'
  | 'orchid'
  | 'sixToFour'
  | 'uniqueLocal'
  | 'global';

export type SpecialRange = { id: SpecialRangeId; cidr: string; rfc: string };

/** IANA special-purpose registries (IPv4 and IPv6), plus the multicast and reserved blocks. */
export const SPECIAL_RANGES: SpecialRange[] = [
  { id: 'thisNetwork', cidr: '0.0.0.0/8', rfc: 'RFC 791' },
  { id: 'private', cidr: '10.0.0.0/8', rfc: 'RFC 1918' },
  { id: 'sharedAddress', cidr: '100.64.0.0/10', rfc: 'RFC 6598' },
  { id: 'loopback', cidr: '127.0.0.0/8', rfc: 'RFC 1122' },
  { id: 'linkLocal', cidr: '169.254.0.0/16', rfc: 'RFC 3927' },
  { id: 'private', cidr: '172.16.0.0/12', rfc: 'RFC 1918' },
  { id: 'ietfProtocol', cidr: '192.0.0.0/24', rfc: 'RFC 6890' },
  { id: 'documentation', cidr: '192.0.2.0/24', rfc: 'RFC 5737' },
  { id: 'relay6to4', cidr: '192.88.99.0/24', rfc: 'RFC 7526' },
  { id: 'private', cidr: '192.168.0.0/16', rfc: 'RFC 1918' },
  { id: 'benchmarking', cidr: '198.18.0.0/15', rfc: 'RFC 2544' },
  { id: 'documentation', cidr: '198.51.100.0/24', rfc: 'RFC 5737' },
  { id: 'documentation', cidr: '203.0.113.0/24', rfc: 'RFC 5737' },
  { id: 'multicast', cidr: '224.0.0.0/4', rfc: 'RFC 5771' },
  { id: 'reserved', cidr: '240.0.0.0/4', rfc: 'RFC 1112' },
  { id: 'broadcast', cidr: '255.255.255.255/32', rfc: 'RFC 919' },
  { id: 'unspecified', cidr: '::/128', rfc: 'RFC 4291' },
  { id: 'loopback', cidr: '::1/128', rfc: 'RFC 4291' },
  { id: 'ipv4Mapped', cidr: '::ffff:0:0/96', rfc: 'RFC 4291' },
  { id: 'nat64', cidr: '64:ff9b::/96', rfc: 'RFC 6052' },
  { id: 'nat64', cidr: '64:ff9b:1::/48', rfc: 'RFC 8215' },
  { id: 'discard', cidr: '100::/64', rfc: 'RFC 6666' },
  { id: 'teredo', cidr: '2001::/32', rfc: 'RFC 4380' },
  { id: 'benchmarking', cidr: '2001:2::/48', rfc: 'RFC 5180' },
  { id: 'orchid', cidr: '2001:20::/28', rfc: 'RFC 7343' },
  { id: 'documentation', cidr: '2001:db8::/32', rfc: 'RFC 3849' },
  { id: 'sixToFour', cidr: '2002::/16', rfc: 'RFC 3056' },
  { id: 'documentation', cidr: '3fff::/20', rfc: 'RFC 9637' },
  { id: 'uniqueLocal', cidr: 'fc00::/7', rfc: 'RFC 4193' },
  { id: 'linkLocal', cidr: 'fe80::/10', rfc: 'RFC 4291' },
  { id: 'multicast', cidr: 'ff00::/8', rfc: 'RFC 4291' },
];

let specialBlocks: { range: SpecialRange; cidr: Cidr }[] | undefined;

function specials() {
  return (specialBlocks ??= SPECIAL_RANGES.map((range) => {
    const parsed = parseCidr(range.cidr);
    if (!parsed.ok) throw new Error(`Bad special range ${range.cidr}: ${parsed.message}`);
    return { range, cidr: parsed.value };
  }));
}

const GLOBAL_UNICAST: SpecialRange = { id: 'global', cidr: '2000::/3', rfc: 'RFC 4291' };
const globalUnicast = makeCidr(6, BigInt(0x2) << BigInt(124), 3);

export type Scope = {
  /** Special-purpose blocks that contain the whole range, most specific first. */
  within: SpecialRange[];
  /** Special-purpose blocks inside the range (only for ranges wider than them). */
  includes: SpecialRange[];
};

/** Where a block sits in the special-purpose registries. Empty `within` means public/global. */
export function scopeOf(cidr: Cidr): Scope {
  const within: { range: SpecialRange; prefix: number }[] = [];
  const includes: SpecialRange[] = [];
  for (const special of specials()) {
    if (containsCidr(special.cidr, cidr))
      within.push({ range: special.range, prefix: special.cidr.prefix });
    else if (containsCidr(cidr, special.cidr)) includes.push(special.range);
  }
  within.sort((a, b) => b.prefix - a.prefix);
  // Global unicast is the IPv6 default; only say so when nothing more specific applies.
  if (within.length === 0 && containsCidr(globalUnicast, cidr)) {
    within.push({ range: GLOBAL_UNICAST, prefix: 3 });
  }
  return { within: within.map((entry) => entry.range), includes };
}

export type CidrDetails = {
  cidr: Cidr;
  mask: bigint;
  wildcard: bigint;
  /** IPv4 below /31 only: the network and broadcast addresses aren't usable hosts. */
  broadcast: bigint | null;
  firstHost: bigint;
  lastHost: bigint;
  addresses: bigint;
  hosts: bigint;
  hostBitsSet: boolean;
  /** Historical IPv4 class (A–E). */
  ipv4Class: 'A' | 'B' | 'C' | 'D' | 'E' | null;
  scope: Scope;
};

function ipv4Class(value: bigint): CidrDetails['ipv4Class'] {
  const first = Number(value >> BigInt(24));
  if (first < 128) return 'A';
  if (first < 192) return 'B';
  if (first < 224) return 'C';
  if (first < 240) return 'D';
  return 'E';
}

const TWO = BigInt(2);

/**
 * Everything a subnet calculator shows. IPv4 /31 point-to-point links (RFC 3021) and /32 hosts
 * use every address; IPv6 has no broadcast, so every address counts.
 */
export function describeCidr(cidr: Cidr): CidrDetails {
  const mask = prefixMask(cidr.version, cidr.prefix);
  const addresses = blockSize(cidr);
  const classic = cidr.version === 4 && cidr.prefix < 31;
  return {
    cidr,
    mask,
    wildcard: allOnes(ADDRESS_BITS[cidr.version]) ^ mask,
    broadcast: classic ? cidr.last : null,
    firstHost: classic ? cidr.network + ONE : cidr.network,
    lastHost: classic ? cidr.last - ONE : cidr.last,
    addresses,
    hosts: classic ? addresses - TWO : addresses,
    hostBitsSet: cidr.address !== cidr.network,
    ipv4Class: cidr.version === 4 ? ipv4Class(cidr.network) : null,
    scope: scopeOf(cidr),
  };
}
