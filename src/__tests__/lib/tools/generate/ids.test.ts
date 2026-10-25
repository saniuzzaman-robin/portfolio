// @vitest-environment node
// UUID v5 uses Web Crypto (crypto.subtle), which is only available in the Node environment.
import { describe, it, expect } from 'vitest';
import { Random, type RandomSource } from '@/lib/tools/generate/random';
import { UlidGenerator, decodeUlid, encodeUlidTime, formatUlid } from '@/lib/tools/generate/ulid';
import { NANOID_ALPHABETS, parseAlphabet, nanoidBits } from '@/lib/tools/generate/nanoid';
import { ObjectIdGenerator, decodeObjectId } from '@/lib/tools/generate/objectid';
import { inspectId } from '@/lib/tools/generate/inspect';
import {
  DEFAULT_ID_OPTIONS,
  ID_KINDS,
  IdGenerator,
  isIdOptions,
  type IdOptions,
} from '@/lib/tools/generate/ids';

/** Deterministic source cycling through the given bytes. */
const cycling =
  (values: number[]): RandomSource =>
  (bytes) => {
    for (let i = 0; i < bytes.length; i++) bytes[i] = values[i % values.length];
  };

describe('Random', () => {
  it('rejects values that would bias the result', () => {
    // max = 3: 2^32 % 3 = 1, so 0xFFFFFFFF is the one value at or above the limit and is redrawn.
    const random = new Random(cycling([0xff, 0xff, 0xff, 0xff, 0, 0, 0, 5]));
    expect(random.int(3)).toBe(5 % 3);
  });

  it('is roughly uniform', () => {
    const random = new Random();
    const counts = new Array(6).fill(0);
    for (let i = 0; i < 60_000; i++) counts[random.int(6)]++;
    for (const count of counts) expect(Math.abs(count - 10_000)).toBeLessThan(600);
  });

  it('refuses ranges it cannot sample', () => {
    const random = new Random();
    expect(() => random.int(0)).toThrow(RangeError);
    expect(() => random.int(2 ** 32 + 1)).toThrow(RangeError);
  });

  it('draws more than 65,536 bytes', () => {
    expect(new Random().bytes(100_000)).toHaveLength(100_000);
  });
});

describe('ULID', () => {
  it('encodes time like the reference implementation', () => {
    expect(encodeUlidTime(1469918176385)).toBe('01ARYZ6S41');
    expect(encodeUlidTime(2 ** 48 - 1)).toBe('7ZZZZZZZZZ');
  });

  it('round-trips time and randomness', () => {
    const random = new Uint8Array(10).map((_, i) => i * 25 + 3);
    const ulid = formatUlid(1469918176385, random);
    expect(ulid).toHaveLength(26);
    const decoded = decodeUlid(ulid.toLowerCase())!;
    expect(decoded.time).toBe(1469918176385);
    expect([...decoded.bytes.subarray(6)]).toEqual([...random]);
  });

  it('rejects overflowing and invalid strings', () => {
    expect(decodeUlid('81ARYZ6S41TSV4RRFFQ69G5FAV')).toBeNull();
    expect(decodeUlid('01ARYZ6S41TSV4RRFFQ69G5FAU')).toBeNull(); // U isn't Crockford
    expect(decodeUlid('01ARYZ6S41TSV4RRFFQ69G5FA')).toBeNull();
  });

  it('increments within one millisecond', () => {
    const generator = new UlidGenerator(new Random(cycling([0xff])), () => 1000);
    const first = generator.next();
    // All-ones randomness overflows on the next call, so the time moves on by 1 ms.
    const second = generator.next();
    expect(decodeUlid(second)!.time).toBe(1001);
    expect(second > first).toBe(true);

    const sorted = new UlidGenerator(new Random(), () => 1000);
    const ids = Array.from({ length: 1000 }, () => sorted.next());
    expect([...ids].sort()).toEqual(ids);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('NanoID alphabets', () => {
  it('validates the alphabet', () => {
    expect(parseAlphabet('a')).toMatchObject({ ok: false });
    expect(parseAlphabet('abca')).toMatchObject({ ok: false });
    expect(parseAlphabet('😀😁')).toEqual({ ok: true, chars: ['😀', '😁'] });
  });

  it('has 126 bits by default, like NanoID', () => {
    expect(nanoidBits(NANOID_ALPHABETS.url.length, 21)).toBe(126);
    for (const alphabet of Object.values(NANOID_ALPHABETS)) {
      expect(parseAlphabet(alphabet).ok).toBe(true);
    }
  });
});

describe('ObjectId', () => {
  it('embeds the time in seconds and increments the counter', () => {
    const generator = new ObjectIdGenerator(new Random(), () => 1_700_000_000_999);
    const a = decodeObjectId(generator.next())!;
    const b = decodeObjectId(generator.next())!;
    expect(a.seconds).toBe(1_700_000_000);
    expect(b.random).toBe(a.random);
    expect(b.counter).toBe((a.counter + 1) % 0x1000000);
  });
});

describe('inspectId', () => {
  it('recognizes each kind', () => {
    expect(inspectId('00000000-0000-0000-0000-000000000000')).toMatchObject({ special: 'nil' });
    expect(inspectId('FFFFFFFF-FFFF-FFFF-FFFF-FFFFFFFFFFFF')).toMatchObject({ special: 'max' });
    expect(inspectId('5df41881-3aed-3515-88a7-2f4a814cf09e')).toMatchObject({
      version: 3,
      variant: 'rfc',
      time: null,
    });
    expect(inspectId('c232ab00-9414-11ec-b3c8-9f6bdeced846')).toMatchObject({
      version: 1,
      ticks: BigInt('0x1ec9414c232ab00'),
      clockSeq: 0x33c8,
      node: '9f:6b:de:ce:d8:46',
    });
    expect(inspectId('01ARYZ6S41TSV4RRFFQ69G5FAV')).toMatchObject({
      kind: 'ulid',
      time: 1469918176385,
    });
    expect(inspectId('507f1f77bcf86cd799439011')).toMatchObject({
      kind: 'objectid',
      time: 0x507f1f77 * 1000,
      counter: 0x439011,
    });
    expect(inspectId('not an id')).toBeNull();
  });

  it('reads the variant', () => {
    expect(inspectId('00000000-0000-0000-7000-000000000000')).toMatchObject({ variant: 'ncs' });
    expect(inspectId('00000000-0000-0000-c000-000000000000')).toMatchObject({
      variant: 'microsoft',
    });
    expect(inspectId('00000000-0000-0000-e000-000000000000')).toMatchObject({ variant: 'future' });
  });
});

describe('IdGenerator', () => {
  const generator = new IdGenerator();
  const run = (options: Partial<IdOptions>) =>
    generator.generate({ ...DEFAULT_ID_OPTIONS, ...options });

  it.each(ID_KINDS)('generates %s that the inspector understands', async (kind) => {
    const result = await run({ kind, count: 3 });
    if (!result.ok) throw new Error(result.error);
    if (kind === 'bytes' || kind === 'nanoid') return;
    for (const id of result.ids) expect(inspectId(id)).not.toBeNull();
  });

  it('generates one ID for fixed kinds and `count` otherwise', async () => {
    expect(await run({ kind: 'uuid-v5', count: 5 })).toMatchObject({ ids: { length: 1 } });
    expect(await run({ kind: 'uuid-v4', count: 5 })).toMatchObject({ ids: { length: 5 } });
  });

  it('uses the namespace and name', async () => {
    expect(await run({ kind: 'uuid-v5', name: 'www.example.com' })).toMatchObject({
      ids: ['2ed6657d-e927-568b-95e1-2665a8aea6a2'],
    });
    expect(
      await run({ kind: 'uuid-v3', namespace: 'custom', customNamespace: 'nope' })
    ).toMatchObject({ ok: false, field: 'customNamespace' });
  });

  it('formats and validates', async () => {
    const styled = await run({ kind: 'uuid-nil', upper: true, hyphens: false, braces: true });
    expect(styled).toMatchObject({ ids: ['{00000000000000000000000000000000}'] });
    expect(await run({ kind: 'bytes', byteLength: 4, byteFormat: 'HEX' })).toMatchObject({
      bits: 32,
    });
    expect(await run({ kind: 'bytes', byteLength: 0 })).toMatchObject({ field: 'byteLength' });
    expect(await run({ count: 0 })).toMatchObject({ field: 'count' });
    expect(await run({ kind: 'nanoid', size: 300 })).toMatchObject({ field: 'size' });
    expect(await run({ kind: 'nanoid', alphabet: 'custom', customAlphabet: 'aa' })).toMatchObject({
      field: 'customAlphabet',
    });

    const nano = await run({ kind: 'nanoid', alphabet: 'hex', size: 8, count: 20 });
    if (!nano.ok) throw new Error(nano.error);
    for (const id of nano.ids) expect(id).toMatch(/^[0-9a-f]{8}$/);
    expect(nano.bits).toBe(32);
  });

  it('validates stored options', () => {
    expect(isIdOptions(DEFAULT_ID_OPTIONS)).toBe(true);
    expect(isIdOptions({ ...DEFAULT_ID_OPTIONS, kind: 'uuid-v9' })).toBe(false);
    expect(isIdOptions({ ...DEFAULT_ID_OPTIONS, namespace: 'nope' })).toBe(false);
  });
});
