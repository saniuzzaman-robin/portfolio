// @vitest-environment node
// Web Crypto (crypto.subtle) is only available in the Node environment, not in jsdom.
import { generateKeyPairSync } from 'node:crypto';
import { describe, it, expect } from 'vitest';
import { decodeJwt, type DecodedJwt } from '@/lib/tools/jwt/decode';
import {
  generateJwtKey,
  signJwt,
  supportsEd25519,
  verifyJwt,
  withHeaderAlg,
  type SignResult,
  type VerifyResult,
} from '@/lib/tools/jwt/sign';
import { importJwtKey } from '@/lib/tools/jwt/keys';
import { JWS_ALGORITHMS, type JwsAlgorithm } from '@/lib/tools/jwt/algorithms';
import { SAMPLE_HEADER, SAMPLE_PAYLOAD, SAMPLE_SECRET, SAMPLE_TOKEN } from '@/lib/tools/jwt/sample';

const decoded = (token: string): DecodedJwt => {
  const result = decodeJwt(token);
  if (!result.ok) throw new Error(result.error.message);
  return result.value;
};
const signed = (result: SignResult) => {
  if (!result.ok) throw new Error(result.error.message);
  return result.token;
};
const valid = (result: VerifyResult) => {
  if (!result.ok) throw new Error(result.error);
  return result.valid;
};
const failure = (result: VerifyResult) => (result.ok ? null : result.error);

const header = (alg: string, extra = '') => `{"alg":"${alg}"${extra}}`;
/** Changes one character in the middle of the signature (keeping its length). */
const tamper = (token: string) => {
  const dot = token.lastIndexOf('.');
  const at = dot + Math.floor((token.length - dot) / 2);
  return `${token.slice(0, at)}${token[at] === 'A' ? 'B' : 'A'}${token.slice(at + 1)}`;
};

// RFC 7515 Appendix A.1 (HS256, key given as a base64url JWK "k").
const RFC_7515_A1 =
  'eyJ0eXAiOiJKV1QiLA0KICJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJqb2UiLA0KICJleHAiOjEzMDA4MTkzODAsDQogImh0dHA6Ly9leGFtcGxlLmNvbS9pc19yb290Ijp0cnVlfQ.dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk';
const RFC_7515_A1_KEY =
  'AyM1SysPpbyDfgZld3umj1qzKObwVMkoqQ-EstJQLr_T-1qS0gZH75aKtMN3Yj0iPS4hcgUuTwjAzZr1Z9CAow';
// jwt.io's classic example.
const JWT_IO =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

// Self-signed P-256 certificate and a token signed by its key (generated with openssl).
const EC_CERTIFICATE = `-----BEGIN CERTIFICATE-----
MIIBXDCCAQKgAwIBAgIUHOMdNMV/cIorXkkHAxnujfCT3mgwCgYIKoZIzj0EAwIw
EzERMA8GA1UEAwwIand0LXRlc3QwIBcNMjYxMDI1MDYwNDQzWhgPMjEyNjEwMDEw
NjA0NDNaMBMxETAPBgNVBAMMCGp3dC10ZXN0MFkwEwYHKoZIzj0CAQYIKoZIzj0D
AQcDQgAE5fcYdPOR3QuayuPrO9bQieTvlJSU3SAn3S46lSV6HiwLIiLZIzzeHSom
gjEc3AaBQsu1lJQNPdM2DlosEM1EmKMyMDAwHQYDVR0OBBYEFNi3gvVQfNkgF6sf
RhzUL9AKmF7PMA8GA1UdEwEB/wQFMAMBAf8wCgYIKoZIzj0EAwIDSAAwRQIgB/J1
2Pp7a5h1NX/YZTYybPketwUsZ1lxa1NSz6eszPoCIQDWGVCeqPMIyKIg3j3F1Vzz
cAQW2seGr6xGsuj2EaXJkw==
-----END CERTIFICATE-----`;
const EC_CERTIFICATE_TOKEN =
  'eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjZXJ0LXRlc3QifQ.J3WHlqICISJ1XqyaXUixA6CaoUSvPppDs-YLFPE5W1r4YUdxIf13vqkFdgRvjtPzz_KgdN20QKL9dQLdhCgGEA';

describe('verifyJwt: published vectors', () => {
  it('verifies RFC 7515 A.1 with a base64url secret', async () => {
    const result = await verifyJwt(decoded(RFC_7515_A1), RFC_7515_A1_KEY, {
      secretEncoding: 'base64',
    });
    expect(valid(result)).toBe(true);
    expect(
      valid(
        await verifyJwt(decoded(tamper(RFC_7515_A1)), RFC_7515_A1_KEY, { secretEncoding: 'base64' })
      )
    ).toBe(false);
  });

  it('verifies the jwt.io example and warns about its short secret', async () => {
    const result = await verifyJwt(decoded(JWT_IO), 'your-256-bit-secret');
    expect(valid(result)).toBe(true);
    expect(result.ok && result.warning).toMatch(/19 bytes; HS256 needs at least 32/);
    expect(valid(await verifyJwt(decoded(JWT_IO), 'wrong-secret'))).toBe(false);
  });

  it('verifies the sample token with the sample secret', async () => {
    const result = await verifyJwt(decoded(SAMPLE_TOKEN), SAMPLE_SECRET);
    expect(result).toEqual({ ok: true, valid: true, warning: undefined });
  });

  it('verifies with the public key from an X.509 certificate', async () => {
    expect(valid(await verifyJwt(decoded(EC_CERTIFICATE_TOKEN), EC_CERTIFICATE))).toBe(true);
    expect(valid(await verifyJwt(decoded(tamper(EC_CERTIFICATE_TOKEN)), EC_CERTIFICATE))).toBe(
      false
    );
  });
});

describe('sign and verify round trips', () => {
  const algorithms = JWS_ALGORITHMS.filter((alg) => alg !== 'EdDSA');

  it.each(algorithms)('%s with generated PEM keys', async (alg) => {
    const key = await generateJwtKey(alg);
    const [signKey, verifyKey, encoding] =
      key.kind === 'secret'
        ? [key.secret, key.secret, 'base64' as const]
        : [key.privateKey, key.publicKey, 'utf8' as const];
    const token = signed(
      await signJwt(header(alg), '{"sub":"x"}', signKey, { secretEncoding: encoding })
    );
    expect(decoded(token).alg).toBe(alg);
    expect(valid(await verifyJwt(decoded(token), verifyKey, { secretEncoding: encoding }))).toBe(
      true
    );
    expect(
      valid(await verifyJwt(decoded(tamper(token)), verifyKey, { secretEncoding: encoding }))
    ).toBe(false);
  });

  it('EdDSA when the runtime supports Ed25519', async () => {
    if (!(await supportsEd25519())) return;
    const key = await generateJwtKey('EdDSA');
    if (key.kind !== 'pair') throw new Error('Expected a key pair');
    const token = signed(await signJwt(header('EdDSA'), '{}', key.privateKey));
    expect(valid(await verifyJwt(decoded(token), key.publicKey))).toBe(true);
  });

  it('signs the sample header and payload into the sample token', async () => {
    expect(signed(await signJwt(SAMPLE_HEADER, SAMPLE_PAYLOAD, SAMPLE_SECRET))).toBe(SAMPLE_TOKEN);
  });

  it('keeps big numbers and key order when signing', async () => {
    const token = signed(
      await signJwt(header('HS256'), '{"z":1,"id":12345678901234567890}', SAMPLE_SECRET)
    );
    expect(Buffer.from(token.split('.')[1], 'base64url').toString()).toBe(
      '{"z":1,"id":12345678901234567890}'
    );
  });

  it('verifies with a private key by deriving its public half', async () => {
    const key = await generateJwtKey('ES384');
    if (key.kind !== 'pair') throw new Error('Expected a key pair');
    const token = signed(await signJwt(header('ES384'), '{}', key.privateKey));
    expect(valid(await verifyJwt(decoded(token), key.privateKey))).toBe(true);
  });
});

describe('key formats', () => {
  it('accepts PKCS#1 RSA keys', async () => {
    const pair = generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: { type: 'pkcs1', format: 'pem' },
      privateKeyEncoding: { type: 'pkcs1', format: 'pem' },
    });
    expect(pair.privateKey).toMatch(/BEGIN RSA PRIVATE KEY/);
    const token = signed(await signJwt(header('RS256'), '{}', pair.privateKey));
    expect(valid(await verifyJwt(decoded(token), pair.publicKey))).toBe(true);
    expect(valid(await verifyJwt(decoded(token), pair.privateKey))).toBe(true);
  });

  it('accepts JWKs and picks from a JWK set by kid', async () => {
    const pair = generateKeyPairSync('ec', { namedCurve: 'P-256' });
    const other = generateKeyPairSync('ec', { namedCurve: 'P-256' });
    const privateJwk = JSON.stringify({
      ...pair.privateKey.export({ format: 'jwk' }),
      alg: 'ES256',
      use: 'sig',
    });
    const publicJwk = {
      ...pair.publicKey.export({ format: 'jwk' }),
      kid: 'mine',
      key_ops: ['verify'],
    };
    const otherJwk = { ...other.publicKey.export({ format: 'jwk' }), kid: 'other' };

    const token = signed(await signJwt(header('ES256', ',"kid":"mine"'), '{}', privateJwk));
    expect(valid(await verifyJwt(decoded(token), JSON.stringify(publicJwk)))).toBe(true);
    const set = JSON.stringify({ keys: [otherJwk, publicJwk] });
    expect(valid(await verifyJwt(decoded(token), set))).toBe(true);

    const noKid = signed(await signJwt(header('ES256'), '{}', privateJwk));
    const result = await verifyJwt(decoded(noKid), set);
    expect(valid(result)).toBe(false); // the first key in the set is the other one
    expect(result.ok && result.warning).toMatch(/2 keys for ES256.*using the first/);

    const missing = signed(await signJwt(header('ES256', ',"kid":"nope"'), '{}', privateJwk));
    expect(failure(await verifyJwt(decoded(missing), set))).toMatch(/kid “nope”/);
  });

  it('explains keys that do not fit', async () => {
    const p256 = await generateJwtKey('ES256');
    const rsa = await generateJwtKey('RS256');
    if (p256.kind !== 'pair' || rsa.kind !== 'pair') throw new Error('Expected key pairs');

    const es384 = signed(await signJwt(header('ES384'), '{}', (await pair('ES384')).privateKey));
    expect(failure(await verifyJwt(decoded(es384), p256.publicKey))).toMatch(
      /needs an EC P-384 key/
    );
    const rs256 = signed(await signJwt(header('RS256'), '{}', rsa.privateKey));
    expect(failure(await verifyJwt(decoded(rs256), p256.publicKey))).toMatch(/needs an RSA key/);
    const jwk = JSON.stringify({ kty: 'EC', crv: 'P-256', x: 'a', y: 'b', alg: 'ES256' });
    expect(failure(await verifyJwt(decoded(rs256), jwk))).toBe(
      'This is an EC P-256 key; RS256 needs an RSA key.'
    );

    const signing = await signJwt(header('RS256'), '{}', rsa.publicKey);
    expect(signing).toMatchObject({
      ok: false,
      target: 'key',
      error: { message: /signing needs the private key/ },
    });
    expect(failure(await verifyJwt(decoded(rs256), 'not a key'))).toMatch(/Paste a PEM key/);
    expect(
      failure(
        await verifyJwt(
          decoded(rs256),
          '-----BEGIN EC PRIVATE KEY-----\nAAAA\n-----END EC PRIVATE KEY-----'
        )
      )
    ).toMatch(/openssl pkcs8 -topk8/);
    expect(failure(await verifyJwt(decoded(rs256), ''))).toBe('Enter a public key.');
  });

  it('decodes base64 secrets and rejects invalid ones', async () => {
    const result = await importJwtKey('HS256', 'not base64!', 'verify', {
      secretEncoding: 'base64',
    });
    expect(result).toEqual({
      ok: false,
      error: expect.stringMatching(/secret is not valid base64/),
    });
    expect(await importJwtKey('HS256', '', 'sign')).toEqual({
      ok: false,
      error: 'Enter the secret.',
    });
  });
});

const pair = async (alg: JwsAlgorithm) => {
  const key = await generateJwtKey(alg);
  if (key.kind !== 'pair') throw new Error('Expected a key pair');
  return key;
};

describe('verifyJwt: tokens that cannot be verified', () => {
  const unsigned = (alg: string) =>
    `${Buffer.from(header(alg)).toString('base64url')}.${Buffer.from('{}').toString('base64url')}.`;

  it('explains alg none, a missing alg and unknown algorithms', async () => {
    expect(failure(await verifyJwt(decoded(unsigned('none')), 'x'))).toMatch(/Unsecured token/);
    const noAlg = `${Buffer.from('{}').toString('base64url')}.e30.`;
    expect(failure(await verifyJwt(decoded(noAlg), 'x'))).toMatch(/no “alg”/);
    expect(failure(await verifyJwt(decoded(unsigned('HS999')), 'x'))).toMatch(/not a supported/);
  });

  it('rejects ECDSA signatures of the wrong size and recognizes DER', async () => {
    const der = Buffer.from([0x30, 0x44, ...new Array(68).fill(1)]).toString('base64url');
    const token = `${unsigned('ES256')}${der}`;
    expect(failure(await verifyJwt(decoded(token), 'x'))).toBe(
      'ES256 signatures are 64 bytes; this one is 70. It looks DER-encoded; JWS uses the raw r‖s form.'
    );
  });
});

describe('signJwt errors', () => {
  it('points at the header or payload', async () => {
    expect(await signJwt('{"alg":', '{}', 'k')).toMatchObject({
      ok: false,
      target: 'header',
      error: { from: 7 },
    });
    expect(await signJwt(header('HS256'), '[]', 'k')).toMatchObject({
      ok: false,
      target: 'payload',
      error: { message: 'The payload must be a JSON object.', from: 0, to: 2 },
    });
    expect(await signJwt('{}', '{}', 'k')).toMatchObject({
      target: 'header',
      error: { message: 'Add an “alg” to the header.' },
    });
    expect(await signJwt(header('none'), '{}', 'k')).toMatchObject({
      target: 'header',
      error: { message: /unsigned token/ },
    });
  });
});

describe('withHeaderAlg', () => {
  it('replaces alg in place, keeping the layout', () => {
    expect(withHeaderAlg(SAMPLE_HEADER, 'RS256')).toBe(SAMPLE_HEADER.replace('HS256', 'RS256'));
  });

  it('adds a missing alg first, and gives up on invalid JSON', () => {
    expect(withHeaderAlg('{"typ":"JWT"}', 'ES256')).toBe('{\n  "alg": "ES256",\n  "typ": "JWT"\n}');
    expect(withHeaderAlg('{"typ":', 'ES256')).toBeNull();
    expect(withHeaderAlg('[]', 'ES256')).toBeNull();
  });
});
