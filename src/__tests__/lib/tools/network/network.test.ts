import { describe, it, expect } from 'vitest';
import {
  binaryGroups,
  expandIpv6,
  formatIp,
  parseIp,
  reverseDnsName,
  type IpAddress,
} from '@/lib/tools/network/ip';
import {
  containsAddress,
  describeCidr,
  formatCidr,
  parseCidr,
  type Cidr,
} from '@/lib/tools/network/cidr';
import { findOverlaps, parseCidrList, prefixForCount, splitCidr } from '@/lib/tools/network/subnet';

function ip(text: string): IpAddress {
  const result = parseIp(text);
  if (!result.ok) throw new Error(result.message);
  return result.value;
}

function cidr(text: string): Cidr {
  const result = parseCidr(text);
  if (!result.ok) throw new Error(result.message);
  return result.value;
}

const text = (address: IpAddress) => formatIp(address.version, address.value);

describe('parseIp', () => {
  it('reads IPv4 dotted quads', () => {
    expect(ip('192.168.1.10')).toEqual({ version: 4, value: BigInt(0xc0a8010a) });
    expect(ip('0.0.0.0').value).toBe(BigInt(0));
    expect(ip('255.255.255.255').value).toBe(BigInt(0xffffffff));
  });

  it('refuses malformed IPv4', () => {
    for (const bad of ['1.2.3', '1.2.3.4.5', '256.1.1.1', '1.2.3.x', '01.2.3.4', '', '1..2.3']) {
      expect(parseIp(bad).ok, bad).toBe(false);
    }
  });

  it('reads every IPv6 text form from RFC 4291', () => {
    const expected = BigInt('0x20010db8000000000000000000000001');
    expect(ip('2001:0db8:0000:0000:0000:0000:0000:0001').value).toBe(expected);
    expect(ip('2001:db8::1').value).toBe(expected);
    expect(ip('[2001:DB8::1]').value).toBe(expected);
    expect(ip('::').value).toBe(BigInt(0));
    expect(ip('::1').value).toBe(BigInt(1));
    expect(ip('1::').value).toBe(BigInt(1) << BigInt(112));
    expect(ip('::ffff:192.0.2.128').value).toBe(BigInt('0xffffc0000280'));
    expect(ip('1:2:3:4:5:6:7::').value).toBe(BigInt('0x00010002000300040005000600070000'));
  });

  it('refuses malformed IPv6', () => {
    for (const bad of [
      '1:2:3:4:5:6:7',
      '1:2:3:4:5:6:7:8:9',
      '1::2::3',
      '12345::',
      ':1::2',
      '1:2:3:4:5:6:7:8::',
      'fe80::1%eth0',
      '1.2.3.4::',
      'g::1',
    ]) {
      expect(parseIp(bad).ok, bad).toBe(false);
    }
  });
});

describe('formatIp', () => {
  it('follows RFC 5952', () => {
    expect(text(ip('2001:0db8:0000:0000:0000:0000:0000:0001'))).toBe('2001:db8::1');
    // Longest zero run wins; the first one on a tie.
    expect(text(ip('2001:db8:0:0:1:0:0:1'))).toBe('2001:db8::1:0:0:1');
    expect(text(ip('2001:0:0:1:0:0:0:1'))).toBe('2001:0:0:1::1');
    // A single zero group is not compressed.
    expect(text(ip('2001:db8:0:1:1:1:1:1'))).toBe('2001:db8:0:1:1:1:1:1');
    expect(text(ip('::'))).toBe('::');
    expect(text(ip('::1'))).toBe('::1');
    expect(text(ip('FE80::ABCD'))).toBe('fe80::abcd');
    expect(text(ip('::ffff:c000:280'))).toBe('::ffff:192.0.2.128');
  });

  it('expands, binarizes and reverses addresses', () => {
    expect(expandIpv6(ip('2001:db8::1').value)).toBe('2001:0db8:0000:0000:0000:0000:0000:0001');
    expect(binaryGroups(4, ip('192.168.1.10').value)).toEqual([
      '11000000',
      '10101000',
      '00000001',
      '00001010',
    ]);
    expect(binaryGroups(6, ip('::1').value)).toHaveLength(8);
    expect(reverseDnsName(4, ip('192.0.2.1').value)).toBe('1.2.0.192.in-addr.arpa');
    expect(reverseDnsName(6, ip('2001:db8::567:89ab').value)).toBe(
      'b.a.9.8.7.6.5.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.8.b.d.0.1.0.0.2.ip6.arpa'
    );
  });
});

describe('parseCidr / describeCidr', () => {
  it('computes a classic IPv4 /24', () => {
    const details = describeCidr(cidr('192.168.1.10/24'));
    const v4 = (value: bigint) => formatIp(4, value);
    expect(formatCidr(details.cidr)).toBe('192.168.1.0/24');
    expect(details.hostBitsSet).toBe(true);
    expect(v4(details.mask)).toBe('255.255.255.0');
    expect(v4(details.wildcard)).toBe('0.0.0.255');
    expect(v4(details.broadcast!)).toBe('192.168.1.255');
    expect(v4(details.firstHost)).toBe('192.168.1.1');
    expect(v4(details.lastHost)).toBe('192.168.1.254');
    expect(details.addresses).toBe(BigInt(256));
    expect(details.hosts).toBe(BigInt(254));
    expect(details.ipv4Class).toBe('C');
    expect(details.scope.within.map((range) => range.id)).toEqual(['private']);
  });

  it('accepts dotted netmasks and bare addresses', () => {
    expect(formatCidr(cidr('10.1.2.3/255.255.0.0'))).toBe('10.1.0.0/16');
    expect(parseCidr('10.0.0.0/255.0.255.0').ok).toBe(false);
    expect(formatCidr(cidr('8.8.8.8'))).toBe('8.8.8.8/32');
    expect(formatCidr(cidr('2001:db8::1'))).toBe('2001:db8::1/128');
    expect(parseCidr('10.0.0.0/33').ok).toBe(false);
    expect(parseCidr('::/129').ok).toBe(false);
    expect(parseCidr('10.0.0.0/').ok).toBe(false);
    expect(parseCidr('10.0.0.0/abc').ok).toBe(false);
  });

  it('treats /31 and /32 as all-usable (RFC 3021)', () => {
    const p2p = describeCidr(cidr('10.0.0.0/31'));
    expect(p2p.broadcast).toBeNull();
    expect(p2p.hosts).toBe(BigInt(2));
    expect(formatIp(4, p2p.firstHost)).toBe('10.0.0.0');
    expect(formatIp(4, p2p.lastHost)).toBe('10.0.0.1');
    expect(describeCidr(cidr('10.0.0.7/32')).hosts).toBe(BigInt(1));
  });

  it('handles /0 and IPv6 sizes with BigInt', () => {
    expect(describeCidr(cidr('0.0.0.0/0')).addresses).toBe(BigInt(2) ** BigInt(32));
    const v6 = describeCidr(cidr('2001:db8:abcd::/48'));
    expect(v6.addresses).toBe(BigInt(2) ** BigInt(80));
    expect(v6.hosts).toBe(v6.addresses);
    expect(v6.broadcast).toBeNull();
    expect(formatIp(6, v6.cidr.last)).toBe('2001:db8:abcd:ffff:ffff:ffff:ffff:ffff');
    expect(formatIp(6, v6.mask)).toBe('ffff:ffff:ffff::');
    expect(v6.ipv4Class).toBeNull();
  });

  it('classifies special-purpose and global ranges', () => {
    const within = (text: string) => describeCidr(cidr(text)).scope.within.map((range) => range.id);
    expect(within('127.0.0.1')).toEqual(['loopback']);
    expect(within('100.64.1.0/24')).toEqual(['sharedAddress']);
    expect(within('8.8.8.8')).toEqual([]);
    expect(within('239.1.1.1')).toEqual(['multicast']);
    expect(within('255.255.255.255')).toEqual(['broadcast', 'reserved']);
    expect(within('fe80::1/64')).toEqual(['linkLocal']);
    expect(within('fd12:3456::/48')).toEqual(['uniqueLocal']);
    expect(within('2001:db8::/32')).toEqual(['documentation']);
    expect(within('2606:4700::1111')).toEqual(['global']);
    expect(within('::1')).toEqual(['loopback']);
    expect(describeCidr(cidr('172.0.0.0/8')).scope.includes.map((range) => range.cidr)).toEqual([
      '172.16.0.0/12',
    ]);
  });

  it('checks whether an address is inside a block', () => {
    const block = cidr('10.0.0.0/8');
    expect(containsAddress(block, 4, ip('10.255.255.255').value)).toBe(true);
    expect(containsAddress(block, 4, ip('11.0.0.0').value)).toBe(false);
    expect(containsAddress(block, 6, ip('::a00:1').value)).toBe(false);
  });
});

describe('splitCidr / prefixForCount', () => {
  it('splits into equal subnets', () => {
    const split = splitCidr(cidr('10.0.0.0/22'), 24, 100);
    if (!split.ok) throw new Error(split.message);
    expect(split.value.count).toBe(BigInt(4));
    expect(split.value.subnets.map(formatCidr)).toEqual([
      '10.0.0.0/24',
      '10.0.1.0/24',
      '10.0.2.0/24',
      '10.0.3.0/24',
    ]);
  });

  it('caps the listed subnets but reports the full count', () => {
    const split = splitCidr(cidr('2001:db8::/32'), 64, 3);
    if (!split.ok) throw new Error(split.message);
    expect(split.value.count).toBe(BigInt(2) ** BigInt(32));
    expect(split.value.subnets.map(formatCidr)).toEqual([
      '2001:db8::/64',
      '2001:db8:0:1::/64',
      '2001:db8:0:2::/64',
    ]);
  });

  it('refuses prefixes outside the block', () => {
    expect(splitCidr(cidr('10.0.0.0/24'), 23, 10).ok).toBe(false);
    expect(splitCidr(cidr('10.0.0.0/24'), 33, 10).ok).toBe(false);
  });

  it('rounds a subnet count up to a power of two', () => {
    const block = cidr('10.0.0.0/24');
    const prefix = (count: number) => {
      const result = prefixForCount(block, count);
      return result.ok ? result.value : null;
    };
    expect(prefix(1)).toBe(24);
    expect(prefix(2)).toBe(25);
    expect(prefix(3)).toBe(26);
    expect(prefix(4)).toBe(26);
    expect(prefix(5)).toBe(27);
    expect(prefix(256)).toBe(32);
    expect(prefix(257)).toBeNull();
    expect(prefix(0)).toBeNull();
  });
});

describe('parseCidrList / findOverlaps', () => {
  it('skips blanks and comments and points errors at their text', () => {
    const list = '10.0.0.0/8\n\n# comment\n  bad/8  # typo\n192.168.0.0/16 # office';
    const { entries, errors } = parseCidrList(list);
    expect(entries.map((entry) => [entry.line, entry.text])).toEqual([
      [1, '10.0.0.0/8'],
      [5, '192.168.0.0/16'],
    ]);
    expect(errors).toHaveLength(1);
    expect(errors[0].line).toBe(4);
    expect(list.slice(errors[0].from, errors[0].to)).toBe('bad/8');
  });

  it('finds nested and duplicate blocks per family', () => {
    const { entries } = parseCidrList(
      [
        '10.0.0.0/16',
        '10.0.1.0/24',
        '10.1.0.0/16',
        '10.0.0.0/16',
        'fd00::/8',
        'fd00:1::/32',
        '10.0.0.0/8',
      ].join('\n')
    );
    const { overlaps, truncated } = findOverlaps(entries, 100);
    expect(truncated).toBe(false);
    const pairs = overlaps.map((o) => `${o.outer.line}>${o.inner.line}:${o.relation}`);
    expect(pairs.sort()).toEqual(
      [
        '7>1:contains',
        '7>2:contains',
        '7>3:contains',
        '7>4:contains',
        '1>4:duplicate',
        '1>2:contains',
        '4>2:contains',
        '5>6:contains',
      ].sort()
    );
    expect(findOverlaps(entries, 2)).toMatchObject({ truncated: true });
    expect(findOverlaps(parseCidrList('10.0.0.0/24\n10.0.1.0/24').entries, 10).overlaps).toEqual(
      []
    );
  });
});
