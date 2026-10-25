// @vitest-environment node
// UUID v5 uses Web Crypto (crypto.subtle), which is only available in the Node environment.
import { describe, it, expect } from 'vitest';
import { Random } from '@/lib/tools/generate/random';
import {
  TimeUuidGenerator,
  UUID_NAMESPACES,
  formatUuid,
  parseUuid,
  styleUuid,
  uuidV1FromFields,
  uuidV3,
  uuidV4,
  uuidV5,
  uuidV6FromFields,
  uuidV7FromFields,
} from '@/lib/tools/generate/uuid';
import { inspectId } from '@/lib/tools/generate/inspect';
import { decodeHex } from '@/lib/tools/encode/hex';

const hex = (text: string) => {
  const decoded = decodeHex(text);
  if (!decoded.ok) throw new Error(decoded.error.message);
  return decoded.value.bytes;
};
const dns = parseUuid(UUID_NAMESPACES.dns)!;

// RFC 9562 Appendix A test vectors.
describe('RFC 9562 vectors', () => {
  const ticks = BigInt('0x1ec9414c232ab00');
  const node = hex('9f6bdeced846');

  it('v1 (A.1)', () => {
    expect(formatUuid(uuidV1FromFields(ticks, 0x33c8, node))).toBe(
      'c232ab00-9414-11ec-b3c8-9f6bdeced846'
    );
  });

  it('v3 (A.2)', () => {
    expect(formatUuid(uuidV3(dns, 'www.example.com'))).toBe('5df41881-3aed-3515-88a7-2f4a814cf09e');
  });

  it('v5 (A.4)', async () => {
    expect(formatUuid(await uuidV5(dns, 'www.example.com'))).toBe(
      '2ed6657d-e927-568b-95e1-2665a8aea6a2'
    );
  });

  it('v6 (A.5)', () => {
    expect(formatUuid(uuidV6FromFields(ticks, 0x33c8, node))).toBe(
      '1ec9414c-232a-6b00-b3c8-9f6bdeced846'
    );
  });

  it('v7 (A.6)', () => {
    // rand_a 0xCC3, rand_b 0x18C4DC0C0C07398F (version/variant bits are overwritten).
    expect(formatUuid(uuidV7FromFields(0x017f22e279b0, hex('0cc318c4dc0c0c07398f')))).toBe(
      '017f22e2-79b0-7cc3-98c4-dc0c0c07398f'
    );
  });
});

describe('uuidV4', () => {
  it('sets version 4 and the RFC variant', () => {
    const random = new Random();
    for (let i = 0; i < 50; i++) {
      expect(formatUuid(uuidV4(random))).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/
      );
    }
  });
});

describe('TimeUuidGenerator', () => {
  const frozen = () => 1_700_000_000_000;

  it('keeps v7 IDs sorted and unique within one millisecond', () => {
    const generator = new TimeUuidGenerator(new Random(), frozen);
    const ids = Array.from({ length: 2000 }, () => formatUuid(generator.v7()));
    expect(new Set(ids).size).toBe(ids.length);
    expect([...ids].sort()).toEqual(ids);
    for (const id of ids.slice(0, 5)) {
      const inspected = inspectId(id);
      expect(inspected).toMatchObject({ kind: 'uuid', version: 7, variant: 'rfc', time: frozen() });
    }
  });

  it('keeps v7 monotonic when the clock goes backwards', () => {
    let now = 2_000;
    const generator = new TimeUuidGenerator(new Random(), () => now);
    const first = formatUuid(generator.v7());
    now = 1_000;
    expect(formatUuid(generator.v7()) > first).toBe(true);
  });

  it('keeps v6 sorted and v1/v6 unique, with the embedded time', () => {
    const generator = new TimeUuidGenerator(new Random(), frozen);
    const v6 = Array.from({ length: 500 }, () => formatUuid(generator.v6()));
    expect([...v6].sort()).toEqual(v6);
    const v1 = Array.from({ length: 500 }, () => formatUuid(generator.v1()));
    expect(new Set([...v1, ...v6]).size).toBe(1000);
    expect(inspectId(v1[0])).toMatchObject({ version: 1, time: frozen() });
    expect(inspectId(v6[0])).toMatchObject({ version: 6, time: frozen() });
  });

  it('sets the multicast bit on the random node', () => {
    const id = new TimeUuidGenerator(new Random()).v1();
    expect(id[10] & 0x01).toBe(1);
  });
});

describe('parseUuid / styleUuid', () => {
  const canonical = '017f22e2-79b0-7cc3-98c4-dc0c0c07398f';

  it.each([
    canonical,
    canonical.toUpperCase(),
    canonical.replaceAll('-', ''),
    `{${canonical}}`,
    `urn:uuid:${canonical}`,
    `  ${canonical}\n`,
  ])('parses %j', (text) => {
    expect(formatUuid(parseUuid(text)!)).toBe(canonical);
  });

  it.each(['', '017f22e2-79b0-7cc3-98c4', `${canonical}0`, '017f22e2-79b0-7cc3-98c4-dc0c0c07398g'])(
    'rejects %j',
    (text) => {
      expect(parseUuid(text)).toBeNull();
    }
  );

  it('applies case, hyphens and braces', () => {
    expect(styleUuid(canonical, { upper: true, hyphens: false, braces: true })).toBe(
      '{017F22E279B07CC398C4DC0C0C07398F}'
    );
    expect(styleUuid(canonical, { upper: false, hyphens: true, braces: false })).toBe(canonical);
  });
});
