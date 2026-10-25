import { encodeBase64 } from '@/lib/tools/encode/base64';
import { toPem } from '@/lib/tools/jwt/der';

export const KEY_TYPES = [
  'rsa-2048',
  'rsa-3072',
  'rsa-4096',
  'ec-p256',
  'ec-p384',
  'ec-p521',
  'ed25519',
] as const;
export type KeyType = (typeof KEY_TYPES)[number];

export const KEY_TYPE_LABELS: Record<KeyType, string> = {
  'rsa-2048': 'RSA 2048',
  'rsa-3072': 'RSA 3072',
  'rsa-4096': 'RSA 4096',
  'ec-p256': 'EC P-256',
  'ec-p384': 'EC P-384',
  'ec-p521': 'EC P-521',
  ed25519: 'Ed25519',
};

export function isKeyType(value: unknown): value is KeyType {
  return KEY_TYPES.includes(value as KeyType);
}

function generateParams(type: KeyType): RsaHashedKeyGenParams | EcKeyGenParams | Algorithm {
  if (type.startsWith('rsa-')) {
    return {
      name: 'RSASSA-PKCS1-v1_5',
      modulusLength: Number(type.slice(4)),
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: 'SHA-256',
    };
  }
  if (type.startsWith('ec-')) return { name: 'ECDSA', namedCurve: `P-${type.slice(4)}` };
  return { name: 'Ed25519' };
}

/** RFC 7638 members that identify a key, per key type (in the required lexicographic order). */
const THUMBPRINT_MEMBERS: Record<string, (keyof JsonWebKey)[]> = {
  RSA: ['e', 'kty', 'n'],
  EC: ['crv', 'kty', 'x', 'y'],
  OKP: ['crv', 'kty', 'x'],
};

/** RFC 7638 JWK thumbprint: base64url SHA-256 of the key's required members. */
export async function jwkThumbprint(jwk: JsonWebKey): Promise<string> {
  const members = jwk.kty ? THUMBPRINT_MEMBERS[jwk.kty] : undefined;
  if (!members) throw new Error(`Unsupported JWK key type “${jwk.kty}”.`);
  const canonical = JSON.stringify(Object.fromEntries(members.map((name) => [name, jwk[name]])));
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(canonical));
  return encodeBase64(new Uint8Array(digest), { urlSafe: true, padding: false });
}

/**
 * Web Crypto's export includes usage hints (`alg`, `key_ops`, `ext`) tied to the algorithm the
 * key was generated for; drop them so the key is neutral, and name it by its thumbprint.
 */
function neutralJwk(jwk: JsonWebKey, kid: string): string {
  const key: JsonWebKey = { ...jwk };
  delete key.alg;
  delete key.key_ops;
  delete key.ext;
  return JSON.stringify({ ...key, kid }, null, 2);
}

export type GeneratedKeyPair = {
  /** PKCS#8 */
  privatePem: string;
  /** SPKI */
  publicPem: string;
  privateJwk: string;
  publicJwk: string;
  thumbprint: string;
};

export async function generateKeyPair(type: KeyType): Promise<GeneratedKeyPair> {
  const pair = (await crypto.subtle.generateKey(generateParams(type), true, [
    'sign',
    'verify',
  ])) as CryptoKeyPair;
  const [pkcs8, spki, privateJwk, publicJwk] = await Promise.all([
    crypto.subtle.exportKey('pkcs8', pair.privateKey),
    crypto.subtle.exportKey('spki', pair.publicKey),
    crypto.subtle.exportKey('jwk', pair.privateKey),
    crypto.subtle.exportKey('jwk', pair.publicKey),
  ]);
  const thumbprint = await jwkThumbprint(publicJwk);
  return {
    privatePem: toPem('PRIVATE KEY', pkcs8),
    publicPem: toPem('PUBLIC KEY', spki),
    privateJwk: neutralJwk(privateJwk, thumbprint),
    publicJwk: neutralJwk(publicJwk, thumbprint),
    thumbprint,
  };
}
