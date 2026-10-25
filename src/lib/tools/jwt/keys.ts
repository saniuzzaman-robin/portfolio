import { decodeBase64 } from '@/lib/tools/encode/base64';
import { algorithmInfo, importParams, keyDescription, type JwsAlgorithm } from './algorithms';
import {
  KeyFormatError,
  certificateSpki,
  parsePem,
  rsaPrivateKeyToPkcs8,
  rsaPublicKeyToSpki,
  type PemBlock,
} from './der';

export type KeyUse = 'sign' | 'verify';
/** How an HMAC secret is typed in: as text, or as base64/base64url bytes. */
export type SecretEncoding = 'utf8' | 'base64';
export type KeyOptions = {
  secretEncoding?: SecretEncoding;
  /** Picks the key with this `kid` from a JWK set. */
  kid?: string | null;
};

export type KeyResult =
  { ok: true; key: CryptoKey; warning?: string } | { ok: false; error: string };

type Imported = { key: CryptoKey; warning?: string };

const PUBLIC_MEMBERS: Record<string, string[]> = {
  RSA: ['n', 'e'],
  EC: ['crv', 'x', 'y'],
  OKP: ['crv', 'x'],
};
const PRIVATE_MEMBERS: Record<string, string[]> = {
  RSA: ['d', 'p', 'q', 'dp', 'dq', 'qi'],
  EC: ['d'],
  OKP: ['d'],
};

const SIGN_NEEDS_PRIVATE = 'This is a public key; signing needs the private key.';

async function subtleImport(
  format: 'raw' | 'spki' | 'pkcs8' | 'jwk',
  data: BufferSource | JsonWebKey,
  alg: JwsAlgorithm,
  usage: KeyUse,
  extractable = false
): Promise<CryptoKey> {
  try {
    return format === 'jwk'
      ? await crypto.subtle.importKey(format, data as JsonWebKey, importParams(alg), extractable, [
          usage,
        ])
      : await crypto.subtle.importKey(
          format,
          data as BufferSource,
          importParams(alg),
          extractable,
          [usage]
        );
  } catch (error) {
    if (error instanceof DOMException && error.name === 'NotSupportedError') {
      throw new KeyFormatError(`This browser doesn’t support ${alg} keys.`);
    }
    const detail = error instanceof Error && error.message ? ` (${error.message})` : '';
    throw new KeyFormatError(
      `This key can’t be used with ${alg}; it needs ${keyDescription(alg)}.${detail}`
    );
  }
}

async function importSecret(
  alg: JwsAlgorithm,
  text: string,
  usage: KeyUse,
  encoding: SecretEncoding
): Promise<Imported> {
  let bytes: Uint8Array<ArrayBuffer>;
  if (encoding === 'base64') {
    const decoded = decodeBase64(text.trim());
    if (!decoded.ok)
      throw new KeyFormatError(`The secret is not valid base64: ${decoded.error.message}`);
    bytes = decoded.value.bytes;
  } else {
    // Used exactly as typed: trimming would silently change the key.
    bytes = new TextEncoder().encode(text);
  }
  if (bytes.length === 0) throw new KeyFormatError('Enter the secret.');
  const { hashBytes } = algorithmInfo(alg);
  const warning =
    bytes.length < hashBytes
      ? `The secret is ${bytes.length} bytes; ${alg} needs at least ${hashBytes} (RFC 7518 §3.2), or it can be brute-forced.`
      : undefined;
  return { key: await subtleImport('raw', bytes, alg, usage), warning };
}

/** The JWK `kty` (and `crv`) an algorithm needs. */
function expectedKty(alg: JwsAlgorithm): { kty: string; crv?: string } {
  const { family, curve } = algorithmInfo(alg);
  if (family === 'ec') return { kty: 'EC', crv: curve };
  if (family === 'eddsa') return { kty: 'OKP', crv: 'Ed25519' };
  return { kty: 'RSA' };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function fitsAlgorithm(jwk: Record<string, unknown>, alg: JwsAlgorithm): boolean {
  const { kty, crv } = expectedKty(alg);
  return jwk.kty === kty && (crv === undefined || jwk.crv === crv);
}

/** Only the key material, so a key's `alg`, `use` or `key_ops` can't make Web Crypto refuse it. */
function cleanJwk(jwk: Record<string, unknown>, alg: JwsAlgorithm, usage: KeyUse): JsonWebKey {
  if (!fitsAlgorithm(jwk, alg)) {
    const kind = [jwk.kty, jwk.crv].filter((part) => typeof part === 'string').join(' ');
    throw new KeyFormatError(
      `This is ${kind ? `an ${kind}` : 'an unknown'} key; ${alg} needs ${keyDescription(alg)}.`
    );
  }
  if (typeof jwk.alg === 'string' && jwk.alg !== alg) {
    throw new KeyFormatError(`This key is marked for ${jwk.alg}, not ${alg}.`);
  }
  const kty = jwk.kty as string;
  if (usage === 'sign' && typeof jwk.d !== 'string') throw new KeyFormatError(SIGN_NEEDS_PRIVATE);
  const members = [...PUBLIC_MEMBERS[kty], ...(usage === 'sign' ? PRIVATE_MEMBERS[kty] : [])];
  const clean: Record<string, unknown> = { kty };
  for (const member of members) if (jwk[member] !== undefined) clean[member] = jwk[member];
  return clean as JsonWebKey;
}

/** One key from a JWK set: the one matching `kid`, else the first that fits the algorithm. */
function pickFromSet(
  keys: unknown[],
  alg: JwsAlgorithm,
  kid: string | null | undefined
): { jwk: Record<string, unknown>; warning?: string } {
  const candidates = keys.filter(isRecord);
  if (kid) {
    const match = candidates.find((key) => key.kid === kid);
    if (!match) throw new KeyFormatError(`No key in the set has the token’s kid “${kid}”.`);
    return { jwk: match };
  }
  const fitting = candidates.filter((key) => fitsAlgorithm(key, alg));
  if (fitting.length === 0) {
    throw new KeyFormatError(`No key in the set fits ${alg}; it needs ${keyDescription(alg)}.`);
  }
  const warning =
    fitting.length > 1
      ? `The set has ${fitting.length} keys for ${alg} and the token has no kid; using the first.`
      : undefined;
  return { jwk: fitting[0], warning };
}

async function importJwk(
  alg: JwsAlgorithm,
  text: string,
  usage: KeyUse,
  kid: string | null | undefined
): Promise<Imported> {
  let value: unknown;
  try {
    value = JSON.parse(text);
  } catch (error) {
    throw new KeyFormatError(
      `The key looks like a JWK but isn’t valid JSON: ${(error as Error).message}`
    );
  }
  if (!isRecord(value)) throw new KeyFormatError('A JWK must be a JSON object.');
  let jwk = value;
  let warning: string | undefined;
  if (Array.isArray(value.keys)) ({ jwk, warning } = pickFromSet(value.keys, alg, kid));
  return { key: await subtleImport('jwk', cleanJwk(jwk, alg, usage), alg, usage), warning };
}

/** Verifying with a private key: derive its public half (via JWK) instead of refusing it. */
async function publicFromPrivate(
  alg: JwsAlgorithm,
  pkcs8: Uint8Array<ArrayBuffer>
): Promise<CryptoKey> {
  const privateKey = await subtleImport('pkcs8', pkcs8, alg, 'sign', true);
  const jwk = (await crypto.subtle.exportKey('jwk', privateKey)) as Record<string, unknown>;
  return subtleImport('jwk', cleanJwk(jwk, alg, 'verify'), alg, 'verify');
}

async function importPem(
  alg: JwsAlgorithm,
  { label, der }: PemBlock,
  usage: KeyUse
): Promise<CryptoKey> {
  switch (label) {
    case 'PUBLIC KEY':
    case 'RSA PUBLIC KEY':
    case 'CERTIFICATE': {
      if (usage === 'sign') throw new KeyFormatError(SIGN_NEEDS_PRIVATE);
      const spki =
        label === 'PUBLIC KEY'
          ? der
          : label === 'CERTIFICATE'
            ? certificateSpki(der)
            : rsaPublicKeyToSpki(der);
      return subtleImport('spki', spki, alg, usage);
    }
    case 'PRIVATE KEY':
    case 'RSA PRIVATE KEY': {
      const pkcs8 = label === 'PRIVATE KEY' ? der : rsaPrivateKeyToPkcs8(der);
      return usage === 'sign'
        ? subtleImport('pkcs8', pkcs8, alg, usage)
        : publicFromPrivate(alg, pkcs8);
    }
    case 'EC PRIVATE KEY':
      throw new KeyFormatError(
        'SEC1 “EC PRIVATE KEY” files aren’t supported; convert to PKCS#8 with: openssl pkcs8 -topk8 -nocrypt -in key.pem'
      );
    case 'ENCRYPTED PRIVATE KEY':
      throw new KeyFormatError(
        'This private key is encrypted; decrypt it first with: openssl pkcs8 -in key.pem'
      );
    default:
      throw new KeyFormatError(
        `“${label}” blocks aren’t supported; use a PUBLIC KEY, CERTIFICATE or PRIVATE KEY.`
      );
  }
}

/**
 * Imports the key for `alg` from what the user typed: an HMAC secret, a PEM public key,
 * certificate or private key (PKCS#8, or PKCS#1 for RSA), or a JWK / JWK set. For verifying,
 * a private key is accepted and its public half is used.
 */
export async function importJwtKey(
  alg: JwsAlgorithm,
  text: string,
  usage: KeyUse,
  { secretEncoding = 'utf8', kid }: KeyOptions = {}
): Promise<KeyResult> {
  try {
    if (algorithmInfo(alg).family === 'hmac') {
      return { ok: true, ...(await importSecret(alg, text, usage, secretEncoding)) };
    }
    const trimmed = text.trim();
    if (!trimmed) {
      throw new KeyFormatError(usage === 'sign' ? 'Enter a private key.' : 'Enter a public key.');
    }
    if (trimmed.startsWith('{'))
      return { ok: true, ...(await importJwk(alg, trimmed, usage, kid)) };
    const block = parsePem(trimmed);
    if (block) return { ok: true, key: await importPem(alg, block, usage) };
    throw new KeyFormatError('Paste a PEM key (-----BEGIN …-----) or a JWK.');
  } catch (error) {
    if (error instanceof KeyFormatError) return { ok: false, error: error.message };
    throw error;
  }
}
