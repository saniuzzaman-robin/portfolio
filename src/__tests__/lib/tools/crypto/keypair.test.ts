// @vitest-environment node
// Web Crypto (crypto.subtle) is only available in the Node environment, not in jsdom.
import { createPrivateKey, createPublicKey } from 'node:crypto';
import { describe, it, expect } from 'vitest';
import { KEY_TYPES, generateKeyPair, jwkThumbprint } from '@/lib/tools/crypto/keypair';

describe('jwkThumbprint', () => {
  it('matches RFC 8037 §A.3 (Ed25519)', async () => {
    const jwk = { kty: 'OKP', crv: 'Ed25519', x: '11qYAYKxCrfVS_7TyWQHOg7hcvPapiMlrwIaaPcHURo' };
    expect(await jwkThumbprint(jwk)).toBe('kPrK_qmxVWaYVA9wwBF6Iuo3vVzz7TxHCTwXBygrS4k');
  });

  it('ignores members that are not part of the thumbprint and their order', async () => {
    const jwk = { kty: 'OKP', crv: 'Ed25519', x: '11qYAYKxCrfVS_7TyWQHOg7hcvPapiMlrwIaaPcHURo' };
    const extended = { x: jwk.x, use: 'sig', kid: 'other', crv: jwk.crv, kty: jwk.kty };
    expect(await jwkThumbprint(extended)).toBe(await jwkThumbprint(jwk));
  });
});

describe('generateKeyPair', () => {
  // RSA 3072/4096 only differ in size and are slow to generate; one RSA size is enough here.
  const types = KEY_TYPES.filter((type) => type !== 'rsa-3072' && type !== 'rsa-4096');

  it.each(types)('%s exports PEM and JWK that node:crypto can read', async (type) => {
    const pair = await generateKeyPair(type);
    expect(pair.privatePem).toMatch(
      /^-----BEGIN PRIVATE KEY-----\n[\s\S]+\n-----END PRIVATE KEY-----$/
    );
    expect(pair.publicPem).toMatch(/^-----BEGIN PUBLIC KEY-----\n/);

    const privateJwk = JSON.parse(pair.privateJwk) as Record<string, unknown>;
    const publicJwk = JSON.parse(pair.publicJwk) as Record<string, unknown>;
    for (const jwk of [privateJwk, publicJwk]) {
      expect(jwk).not.toHaveProperty('alg');
      expect(jwk).not.toHaveProperty('key_ops');
      expect(jwk).not.toHaveProperty('ext');
      expect(jwk.kid).toBe(pair.thumbprint);
    }
    expect(publicJwk).not.toHaveProperty('d');
    expect(privateJwk).toHaveProperty('d');

    // The PEM and JWK forms describe the same key.
    const fromPem = createPublicKey(pair.publicPem).export({ format: 'jwk' });
    const fromJwk = createPublicKey({ key: publicJwk, format: 'jwk' }).export({ format: 'jwk' });
    expect(fromPem).toEqual(fromJwk);
    expect(createPrivateKey(pair.privatePem).asymmetricKeyType).toBe(
      type.startsWith('rsa') ? 'rsa' : type.startsWith('ec') ? 'ec' : 'ed25519'
    );
  });
});
