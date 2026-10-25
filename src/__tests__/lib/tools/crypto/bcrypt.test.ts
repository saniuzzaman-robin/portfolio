// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { bcryptCompare, bcryptHash, parseBcryptHash } from '@/lib/tools/crypto/bcrypt';

// OpenBSD / Openwall crypt_blowfish test vector.
const VECTOR = '$2a$05$CCCCCCCCCCCCCCCCCCCCC.E5YPO9kmyuRGyh0XouQYb4YMJKvyOeW';

describe('parseBcryptHash', () => {
  it('splits version, cost, salt and checksum', () => {
    expect(parseBcryptHash(`  ${VECTOR}\n`)).toEqual({
      ok: true,
      value: {
        version: '2a',
        cost: 5,
        salt: 'CCCCCCCCCCCCCCCCCCCCC.',
        checksum: 'E5YPO9kmyuRGyh0XouQYb4YMJKvyOeW',
      },
    });
  });

  it.each([
    ['', 'starts with'],
    ['$1$abc', 'starts with'],
    ['$2b$03$CCCCCCCCCCCCCCCCCCCCC.E5YPO9kmyuRGyh0XouQYb4YMJKvyOeW', 'cost must be'],
    ['$2b$10$CCCCCCCCCCCCCCCCCCCCC.E5YPO9kmyuRGyh0XouQYb4YMJKvyOe', '53 characters'],
    ['$2b$10$CCCCCCCCCCCCCCCCCCCCC.E5YPO9kmyuRGyh0XouQYb4YMJKvyOe+', 'use only'],
  ])('rejects %j', (hash, message) => {
    const result = parseBcryptHash(hash);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toContain(message);
  });
});

describe('bcrypt', () => {
  it('verifies the published vector', async () => {
    expect(await bcryptCompare('U*U', VECTOR)).toBe(true);
    expect(await bcryptCompare('U*V', VECTOR)).toBe(false);
  });

  it('accepts PHP-style $2y$ hashes', async () => {
    expect(await bcryptCompare('U*U', VECTOR.replace('$2a$', '$2y$'))).toBe(true);
  });

  it('hashes with the requested cost and a fresh salt', async () => {
    const first = await bcryptHash('hunter2', 4);
    const second = await bcryptHash('hunter2', 4);
    expect(parseBcryptHash(first)).toMatchObject({ ok: true, value: { cost: 4 } });
    expect(first).not.toBe(second);
    expect(await bcryptCompare('hunter2', first)).toBe(true);
  });
});
