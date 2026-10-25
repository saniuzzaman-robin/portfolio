import { encodeBase64 } from '@/lib/tools/encode/base64';
import { parseJson, type JsonObject } from '@/lib/tools/json/parse';
import { stringifyJson } from '@/lib/tools/json/format';
import {
  algorithmInfo,
  importParams,
  isJwsAlgorithm,
  signParams,
  type JwsAlgorithm,
} from './algorithms';
import { stringMember, type DecodedJwt, type JwtIssue } from './decode';
import { importJwtKey, type KeyOptions } from './keys';
import { toPem } from './der';

const encoder = new TextEncoder();

export function base64url(bytes: Uint8Array): string {
  return encodeBase64(bytes, { urlSafe: true, padding: false });
}

const errorMessage = (error: unknown) => (error instanceof Error ? error.message : String(error));

export type VerifyResult =
  { ok: true; valid: boolean; warning?: string } | { ok: false; error: string };

/** Checks a decoded token's signature with a secret or public key (see `importJwtKey`). */
export async function verifyJwt(
  token: DecodedJwt,
  keyText: string,
  options: Omit<KeyOptions, 'kid'> = {}
): Promise<VerifyResult> {
  const { alg, signature } = token;
  if (alg === null)
    return { ok: false, error: 'The header has no “alg”, so there is nothing to verify with.' };
  if (alg === 'none')
    return { ok: false, error: 'Unsecured token (alg “none”): it has no signature to verify.' };
  if (!isJwsAlgorithm(alg))
    return { ok: false, error: `“${alg}” is not a supported JWS algorithm.` };

  const { signatureBytes } = algorithmInfo(alg);
  if (signatureBytes !== undefined && signature.length !== signatureBytes) {
    const der = signature[0] === 0x30 ? ' It looks DER-encoded; JWS uses the raw r‖s form.' : '';
    return {
      ok: false,
      error: `${alg} signatures are ${signatureBytes} bytes; this one is ${signature.length}.${der}`,
    };
  }

  const key = await importJwtKey(alg, keyText, 'verify', { ...options, kid: token.kid });
  if (!key.ok) return key;
  try {
    const data = encoder.encode(token.signingInput);
    const valid = await crypto.subtle.verify(signParams(alg), key.key, signature, data);
    return { ok: true, valid, warning: key.warning };
  } catch (error) {
    return { ok: false, error: `The signature could not be checked: ${errorMessage(error)}` };
  }
}

export type SignTarget = 'header' | 'payload' | 'key';
export type SignResult =
  | { ok: true; token: string; warnings: string[] }
  | { ok: false; target: SignTarget; error: JwtIssue };

type ObjectResult =
  { ok: true; value: JsonObject; warnings: string[] } | { ok: false; error: JwtIssue };

function parseObject(text: string, name: string): ObjectResult {
  const parsed = parseJson(text);
  if (!parsed.ok) return parsed;
  if (parsed.value.type !== 'object') {
    const { from, to } = parsed.value;
    return { ok: false, error: { message: `The ${name} must be a JSON object.`, from, to } };
  }
  const warnings = parsed.warnings.map((warning) => `In the ${name}: ${warning.message}`);
  return { ok: true, value: parsed.value, warnings };
}

/**
 * Builds a compact JWS from header and payload JSON. The JSON is minified losslessly (numbers
 * and key order stay as written); the algorithm is the header's `alg`.
 */
export async function signJwt(
  headerText: string,
  payloadText: string,
  keyText: string,
  options: Omit<KeyOptions, 'kid'> = {}
): Promise<SignResult> {
  const header = parseObject(headerText, 'header');
  if (!header.ok) return { ok: false, target: 'header', error: header.error };
  const payload = parseObject(payloadText, 'payload');
  if (!payload.ok) return { ok: false, target: 'payload', error: payload.error };

  const alg = stringMember(header.value, 'alg');
  const algError = (message: string) =>
    ({
      ok: false,
      target: 'header',
      error: { message, from: header.value.from, to: header.value.to },
    }) as const;
  if (alg === null) return algError('Add an “alg” to the header.');
  if (alg === 'none')
    return algError('alg “none” makes an unsigned token; choose a signing algorithm.');
  if (!isJwsAlgorithm(alg)) return algError(`“${alg}” is not a supported JWS algorithm.`);

  const key = await importJwtKey(alg, keyText, 'sign', options);
  if (!key.ok) return { ok: false, target: 'key', error: { message: key.error, from: 0, to: 0 } };

  const signingInput = `${base64url(encoder.encode(stringifyJson(header.value)))}.${base64url(
    encoder.encode(stringifyJson(payload.value))
  )}`;
  try {
    const signature = await crypto.subtle.sign(
      signParams(alg),
      key.key,
      encoder.encode(signingInput)
    );
    const warnings = [key.warning, ...header.warnings, ...payload.warnings].filter(
      (warning): warning is string => warning !== undefined
    );
    return { ok: true, token: `${signingInput}.${base64url(new Uint8Array(signature))}`, warnings };
  } catch (error) {
    return {
      ok: false,
      target: 'key',
      error: { message: `Signing failed: ${errorMessage(error)}`, from: 0, to: 0 },
    };
  }
}

/**
 * Header JSON with its `alg` set: an existing `alg` value is replaced in place (keeping the
 * layout), otherwise it is added first. Null when the header isn't a JSON object.
 */
export function withHeaderAlg(headerText: string, alg: JwsAlgorithm): string | null {
  const parsed = parseJson(headerText);
  if (!parsed.ok || parsed.value.type !== 'object') return null;
  const entry = parsed.value.entries.findLast((item) => item.key === 'alg');
  if (entry) {
    return (
      headerText.slice(0, entry.value.from) + JSON.stringify(alg) + headerText.slice(entry.value.to)
    );
  }
  return JSON.stringify({ alg, ...(JSON.parse(headerText) as object) }, null, 2);
}

export type GeneratedKey =
  { kind: 'secret'; secret: string } | { kind: 'pair'; privateKey: string; publicKey: string };

/** A fresh example key for `alg`: a random base64url secret for HS*, else a PEM key pair. */
export async function generateJwtKey(alg: JwsAlgorithm): Promise<GeneratedKey> {
  const { family, hashBytes } = algorithmInfo(alg);
  if (family === 'hmac') {
    return { kind: 'secret', secret: base64url(crypto.getRandomValues(new Uint8Array(hashBytes))) };
  }
  const params =
    family === 'rsa' || family === 'pss'
      ? {
          ...(importParams(alg) as RsaHashedImportParams),
          modulusLength: 2048,
          publicExponent: new Uint8Array([1, 0, 1]),
        }
      : importParams(alg);
  const pair = (await crypto.subtle.generateKey(params, true, ['sign', 'verify'])) as CryptoKeyPair;
  const [spki, pkcs8] = await Promise.all([
    crypto.subtle.exportKey('spki', pair.publicKey),
    crypto.subtle.exportKey('pkcs8', pair.privateKey),
  ]);
  return {
    kind: 'pair',
    privateKey: toPem('PRIVATE KEY', pkcs8),
    publicKey: toPem('PUBLIC KEY', spki),
  };
}

let ed25519Support: Promise<boolean> | null = null;

/** Whether this browser's Web Crypto can do Ed25519 (EdDSA); checked once. */
export function supportsEd25519(): Promise<boolean> {
  ed25519Support ??= crypto.subtle.generateKey({ name: 'Ed25519' }, false, ['sign', 'verify']).then(
    () => true,
    () => false
  );
  return ed25519Support;
}
