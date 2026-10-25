/** JWS algorithms (RFC 7518 §3, RFC 8037) and their Web Crypto equivalents. */

export const JWS_ALGORITHMS = [
  'HS256',
  'HS384',
  'HS512',
  'RS256',
  'RS384',
  'RS512',
  'PS256',
  'PS384',
  'PS512',
  'ES256',
  'ES384',
  'ES512',
  'EdDSA',
] as const;
export type JwsAlgorithm = (typeof JWS_ALGORITHMS)[number];

export type AlgorithmFamily = 'hmac' | 'rsa' | 'pss' | 'ec' | 'eddsa';
type Hash = 'SHA-256' | 'SHA-384' | 'SHA-512';
type Curve = 'P-256' | 'P-384' | 'P-521';

export type AlgorithmInfo = {
  family: AlgorithmFamily;
  hash: Hash;
  /** Digest size in bytes: the minimum HMAC key size and the PSS salt length. */
  hashBytes: number;
  curve?: Curve;
  /** ECDSA signatures are the raw r‖s concatenation (not DER). */
  signatureBytes?: number;
};

const HASHES: Record<string, { hash: Hash; hashBytes: number }> = {
  '256': { hash: 'SHA-256', hashBytes: 32 },
  '384': { hash: 'SHA-384', hashBytes: 48 },
  '512': { hash: 'SHA-512', hashBytes: 64 },
};

const FAMILIES: Record<string, AlgorithmFamily> = { HS: 'hmac', RS: 'rsa', PS: 'pss', ES: 'ec' };
const CURVES: Record<string, { curve: Curve; signatureBytes: number }> = {
  '256': { curve: 'P-256', signatureBytes: 64 },
  '384': { curve: 'P-384', signatureBytes: 96 },
  '512': { curve: 'P-521', signatureBytes: 132 },
};

export function isJwsAlgorithm(alg: unknown): alg is JwsAlgorithm {
  return JWS_ALGORITHMS.includes(alg as JwsAlgorithm);
}

export function algorithmInfo(alg: JwsAlgorithm): AlgorithmInfo {
  if (alg === 'EdDSA') return { family: 'eddsa', hash: 'SHA-512', hashBytes: 64 };
  const family = FAMILIES[alg.slice(0, 2)];
  const size = alg.slice(2);
  return { family, ...HASHES[size], ...(family === 'ec' ? CURVES[size] : {}) };
}

/** Parameters for `importKey` / `generateKey`. */
export function importParams(alg: JwsAlgorithm): AlgorithmIdentifier | RsaHashedImportParams {
  const { family, hash, curve } = algorithmInfo(alg);
  switch (family) {
    case 'hmac':
      return { name: 'HMAC', hash } as HmacImportParams;
    case 'rsa':
      return { name: 'RSASSA-PKCS1-v1_5', hash };
    case 'pss':
      return { name: 'RSA-PSS', hash };
    case 'ec':
      return { name: 'ECDSA', namedCurve: curve } as EcKeyImportParams;
    case 'eddsa':
      return { name: 'Ed25519' };
  }
}

/** Parameters for `sign` / `verify`. */
export function signParams(alg: JwsAlgorithm): AlgorithmIdentifier | RsaPssParams | EcdsaParams {
  const { family, hash, hashBytes } = algorithmInfo(alg);
  switch (family) {
    case 'hmac':
      return { name: 'HMAC' };
    case 'rsa':
      return { name: 'RSASSA-PKCS1-v1_5' };
    case 'pss':
      return { name: 'RSA-PSS', saltLength: hashBytes };
    case 'ec':
      return { name: 'ECDSA', hash };
    case 'eddsa':
      return { name: 'Ed25519' };
  }
}

/** What kind of key an algorithm needs, for error messages. */
export function keyDescription(alg: JwsAlgorithm): string {
  const { family, curve } = algorithmInfo(alg);
  if (family === 'hmac') return 'a shared secret';
  if (family === 'ec') return `an EC ${curve} key`;
  if (family === 'eddsa') return 'an Ed25519 key';
  return 'an RSA key';
}
