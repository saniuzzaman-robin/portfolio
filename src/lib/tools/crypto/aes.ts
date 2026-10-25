import { decodeBase64, encodeBase64 } from '@/lib/tools/encode/base64';
import { decodeHex, encodeHex } from '@/lib/tools/encode/hex';
import { concatBytes, randomBytes } from './bytes';
import { md5 } from './md5';

export const AES_MODES = ['GCM', 'CBC', 'CTR'] as const;
export type AesMode = (typeof AES_MODES)[number];

/**
 * Where the key comes from:
 * - `pbkdf2`: passphrase → PBKDF2-SHA256; output is salt (16) ‖ IV ‖ ciphertext.
 * - `openssl`: `openssl enc` / CryptoJS format, "Salted__" ‖ salt (8) ‖ ciphertext, with the
 *   key and IV derived from the passphrase and salt.
 * - `raw`: key and IV given as hex; output is the ciphertext alone.
 */
export const KEY_SOURCES = ['pbkdf2', 'openssl', 'raw'] as const;
export type KeySource = (typeof KEY_SOURCES)[number];

/** OpenSSL's key derivations: EVP_BytesToKey with MD5 (CryptoJS, OpenSSL ≤ 1.0) or SHA-256 (OpenSSL ≥ 1.1), or `-pbkdf2`. */
export const OPENSSL_KDFS = ['md5', 'sha256', 'pbkdf2'] as const;
export type OpenSslKdf = (typeof OPENSSL_KDFS)[number];

export type CipherEncoding = 'base64' | 'hex';
export type KeyBits = 128 | 256;

export type AesSettings = {
  source: KeySource;
  mode: AesMode;
  /** Passphrase sources only; a raw key's size comes from its length. */
  keyBits: KeyBits;
  iterations: number;
  opensslKdf: OpenSslKdf;
  encoding: CipherEncoding;
};

export const DEFAULT_AES_SETTINGS: AesSettings = {
  source: 'pbkdf2',
  mode: 'GCM',
  keyBits: 256,
  // OWASP's 2023 recommendation for PBKDF2-HMAC-SHA256.
  iterations: 600_000,
  opensslKdf: 'md5',
  encoding: 'base64',
};

export const MAX_ITERATIONS = 10_000_000;

export function isAesSettings(value: unknown): value is AesSettings {
  if (typeof value !== 'object' || value === null) return false;
  const settings = value as Record<string, unknown>;
  return (
    KEY_SOURCES.includes(settings.source as KeySource) &&
    AES_MODES.includes(settings.mode as AesMode) &&
    (settings.keyBits === 128 || settings.keyBits === 256) &&
    typeof settings.iterations === 'number' &&
    OPENSSL_KDFS.includes(settings.opensslKdf as OpenSslKdf) &&
    (settings.encoding === 'base64' || settings.encoding === 'hex')
  );
}

/** Secrets typed by the user. Kept in memory only, never persisted. */
export type AesSecrets = { passphrase: string; key: string; iv: string };

export type AesField = 'input' | 'passphrase' | 'key' | 'iv' | 'settings';
export type AesFailure = { ok: false; field: AesField; error: string };
export type EncryptResult = { ok: true; output: string } | AesFailure;
export type DecryptResult = { ok: true; bytes: Uint8Array<ArrayBuffer> } | AesFailure;

const fail = (field: AesField, error: string): AesFailure => ({ ok: false, field, error });
const errorMessage = (error: unknown) => (error instanceof Error ? error.message : String(error));

const encoder = new TextEncoder();
const OPENSSL_MAGIC = encoder.encode('Salted__');
const PBKDF2_SALT_BYTES = 16;
const OPENSSL_SALT_BYTES = 8;
const BLOCK_BYTES = 16;
const GCM_TAG_BYTES = 16;

export function ivLength(mode: AesMode): number {
  return mode === 'GCM' ? 12 : BLOCK_BYTES;
}

/** Whether the iteration count is used by these settings. */
export function usesIterations(settings: AesSettings): boolean {
  return (
    settings.source === 'pbkdf2' ||
    (settings.source === 'openssl' && settings.opensslKdf === 'pbkdf2')
  );
}

function checkSettings(settings: AesSettings): AesFailure | null {
  if (settings.source === 'openssl' && settings.mode === 'GCM') {
    return fail('settings', 'openssl enc has no GCM mode; choose CBC or CTR.');
  }
  const { iterations } = settings;
  if (
    usesIterations(settings) &&
    !(Number.isInteger(iterations) && iterations >= 1 && iterations <= MAX_ITERATIONS)
  ) {
    return fail('settings', 'Iterations must be a whole number from 1 to 10,000,000.');
  }
  return null;
}

/*
 * PBKDF2 is deliberately slow and runs again on every keystroke, so recent derivations are
 * kept (in memory, for this tab only).
 */
const derivations = new Map<string, Promise<Uint8Array<ArrayBuffer>>>();
const MAX_DERIVATIONS = 4;

function pbkdf2(
  passphrase: string,
  salt: Uint8Array<ArrayBuffer>,
  iterations: number,
  bits: number
): Promise<Uint8Array<ArrayBuffer>> {
  const id = `${iterations}:${bits}:${encodeHex(salt)}:${passphrase}`;
  let derived = derivations.get(id);
  if (!derived) {
    derived = (async () => {
      const base = await crypto.subtle.importKey(
        'raw',
        encoder.encode(passphrase),
        'PBKDF2',
        false,
        ['deriveBits']
      );
      const params = { name: 'PBKDF2', hash: 'SHA-256', salt, iterations };
      return new Uint8Array(await crypto.subtle.deriveBits(params, base, bits));
    })();
    derived.catch(() => derivations.delete(id));
    derivations.set(id, derived);
    if (derivations.size > MAX_DERIVATIONS) derivations.delete(derivations.keys().next().value!);
  }
  return derived;
}

/*
 * The PBKDF2 format reuses one salt per passphrase and settings in this tab (so the cached key
 * applies while typing) and draws a fresh IV for every encryption, so no key/IV pair repeats.
 */
let encryptionSalt: { scope: string; salt: Uint8Array<ArrayBuffer> } | null = null;

function saltFor(scope: string): Uint8Array<ArrayBuffer> {
  if (encryptionSalt?.scope !== scope) {
    encryptionSalt = { scope, salt: randomBytes(PBKDF2_SALT_BYTES) };
  }
  return encryptionSalt.salt;
}

/** OpenSSL's original KDF: D_i = H(D_{i-1} ‖ password ‖ salt), concatenated. */
async function evpBytesToKey(
  password: Uint8Array,
  salt: Uint8Array,
  length: number,
  digest: 'md5' | 'sha256'
): Promise<Uint8Array<ArrayBuffer>> {
  const out = new Uint8Array(length);
  let block: Uint8Array<ArrayBuffer> = new Uint8Array(0);
  for (let filled = 0; filled < length;) {
    const input = concatBytes(block, password, salt);
    block =
      digest === 'md5' ? md5(input) : new Uint8Array(await crypto.subtle.digest('SHA-256', input));
    const take = Math.min(block.length, length - filled);
    out.set(block.subarray(0, take), filled);
    filled += take;
  }
  return out;
}

type KeyAndIv = { key: Uint8Array<ArrayBuffer>; iv: Uint8Array<ArrayBuffer> };

async function opensslKeyIv(
  passphrase: string,
  salt: Uint8Array<ArrayBuffer>,
  settings: AesSettings
): Promise<KeyAndIv> {
  const keyBytes = settings.keyBits / 8;
  const length = keyBytes + BLOCK_BYTES;
  const material =
    settings.opensslKdf === 'pbkdf2'
      ? await pbkdf2(passphrase, salt, settings.iterations, length * 8)
      : await evpBytesToKey(encoder.encode(passphrase), salt, length, settings.opensslKdf);
  return { key: material.slice(0, keyBytes), iv: material.slice(keyBytes) };
}

function rawKeyAndIv(secrets: AesSecrets, mode: AesMode): KeyAndIv | AesFailure {
  const key = decodeHex(secrets.key);
  if (!key.ok) return fail('key', `Key: ${key.error.message}`);
  const keyLength = key.value.bytes.length;
  if (keyLength === 0) return fail('key', 'Enter a key (16 or 32 bytes as hex) or generate one.');
  if (keyLength === 24) {
    return fail('key', 'Browsers don’t support AES-192 (24-byte keys); use 16 or 32 bytes.');
  }
  if (keyLength !== 16 && keyLength !== 32) {
    return fail('key', `AES keys are 16 or 32 bytes; this one is ${keyLength}.`);
  }
  const iv = decodeHex(secrets.iv);
  if (!iv.ok) return fail('iv', `IV: ${iv.error.message}`);
  const wanted = ivLength(mode);
  const ivBytes = iv.value.bytes.length;
  if (ivBytes === 0) return fail('iv', `Enter an IV (${wanted} bytes as hex) or generate one.`);
  if (ivBytes !== wanted) {
    return fail('iv', `${mode} needs a ${wanted}-byte IV; this one is ${ivBytes} bytes.`);
  }
  return { key: key.value.bytes, iv: iv.value.bytes };
}

function cipherParams(
  mode: AesMode,
  iv: Uint8Array<ArrayBuffer>
): AesGcmParams | AesCbcParams | AesCtrParams {
  if (mode === 'GCM') return { name: 'AES-GCM', iv };
  if (mode === 'CBC') return { name: 'AES-CBC', iv };
  // The whole block is the counter, like OpenSSL and NIST SP 800-38A.
  return { name: 'AES-CTR', counter: iv, length: 128 };
}

function importAesKey(raw: Uint8Array<ArrayBuffer>, mode: AesMode): Promise<CryptoKey> {
  return crypto.subtle.importKey('raw', raw, { name: `AES-${mode}` }, false, [
    'encrypt',
    'decrypt',
  ]);
}

export async function encryptAes(
  plaintext: Uint8Array<ArrayBuffer>,
  settings: AesSettings,
  secrets: AesSecrets
): Promise<EncryptResult> {
  const invalid = checkSettings(settings);
  if (invalid) return invalid;
  const { source, mode } = settings;

  let material: KeyAndIv;
  let prefix: Uint8Array = new Uint8Array(0);
  if (source === 'raw') {
    const raw = rawKeyAndIv(secrets, mode);
    if ('ok' in raw) return raw;
    material = raw;
  } else {
    const { passphrase } = secrets;
    if (!passphrase) return fail('passphrase', 'Enter a passphrase.');
    if (source === 'pbkdf2') {
      const salt = saltFor(`${settings.iterations}:${settings.keyBits}:${passphrase}`);
      const key = await pbkdf2(passphrase, salt, settings.iterations, settings.keyBits);
      const iv = randomBytes(ivLength(mode));
      material = { key, iv };
      prefix = concatBytes(salt, iv);
    } else {
      // The IV comes from the salt here, so the salt must be fresh every time.
      const salt = randomBytes(OPENSSL_SALT_BYTES);
      material = await opensslKeyIv(passphrase, salt, settings);
      prefix = concatBytes(OPENSSL_MAGIC, salt);
    }
  }

  try {
    const key = await importAesKey(material.key, mode);
    const ciphertext = await crypto.subtle.encrypt(cipherParams(mode, material.iv), key, plaintext);
    const output = concatBytes(prefix, new Uint8Array(ciphertext));
    return {
      ok: true,
      output: settings.encoding === 'hex' ? encodeHex(output) : encodeBase64(output),
    };
  } catch (error) {
    return fail('settings', `Encryption failed: ${errorMessage(error)}`);
  }
}

function startsWith(bytes: Uint8Array, prefix: Uint8Array): boolean {
  return bytes.length >= prefix.length && prefix.every((byte, i) => bytes[i] === byte);
}

export async function decryptAes(
  text: string,
  settings: AesSettings,
  secrets: AesSecrets
): Promise<DecryptResult> {
  const invalid = checkSettings(settings);
  if (invalid) return invalid;
  const { source, mode } = settings;

  const decoded = settings.encoding === 'hex' ? decodeHex(text) : decodeBase64(text);
  if (!decoded.ok) return fail('input', decoded.error.message);
  const data = decoded.value.bytes;
  if (data.length === 0) return fail('input', 'Paste the ciphertext to decrypt.');

  let material: KeyAndIv;
  let ciphertext: Uint8Array<ArrayBuffer>;
  if (source === 'raw') {
    const raw = rawKeyAndIv(secrets, mode);
    if ('ok' in raw) return raw;
    material = raw;
    ciphertext = data;
  } else {
    const { passphrase } = secrets;
    if (!passphrase) return fail('passphrase', 'Enter a passphrase.');
    if (source === 'pbkdf2') {
      const header = PBKDF2_SALT_BYTES + ivLength(mode);
      if (data.length <= header) {
        return fail(
          'input',
          `Too short: this format starts with a ${PBKDF2_SALT_BYTES}-byte salt and a ${ivLength(mode)}-byte IV.`
        );
      }
      const salt = data.slice(0, PBKDF2_SALT_BYTES);
      const key = await pbkdf2(passphrase, salt, settings.iterations, settings.keyBits);
      material = { key, iv: data.slice(PBKDF2_SALT_BYTES, header) };
      ciphertext = data.subarray(header);
    } else {
      if (!startsWith(data, OPENSSL_MAGIC) || data.length < OPENSSL_MAGIC.length + 8) {
        return fail(
          'input',
          'Not OpenSSL data: it starts with “Salted__” (“U2FsdGVkX1” in base64). Data made with -nosalt isn’t supported.'
        );
      }
      const saltEnd = OPENSSL_MAGIC.length + OPENSSL_SALT_BYTES;
      material = await opensslKeyIv(
        passphrase,
        data.slice(OPENSSL_MAGIC.length, saltEnd),
        settings
      );
      ciphertext = data.subarray(saltEnd);
    }
  }

  if (mode === 'CBC' && (ciphertext.length === 0 || ciphertext.length % BLOCK_BYTES !== 0)) {
    return fail(
      'input',
      `CBC ciphertext is a whole number of 16-byte blocks; this one is ${ciphertext.length} bytes.`
    );
  }
  if (mode === 'GCM' && ciphertext.length < GCM_TAG_BYTES) {
    return fail('input', 'Too short to hold the 16-byte GCM authentication tag.');
  }

  let key: CryptoKey;
  try {
    key = await importAesKey(material.key, mode);
  } catch (error) {
    return fail(source === 'raw' ? 'key' : 'settings', `Invalid key: ${errorMessage(error)}`);
  }
  try {
    const plaintext = await crypto.subtle.decrypt(cipherParams(mode, material.iv), key, ciphertext);
    return { ok: true, bytes: new Uint8Array(plaintext) };
  } catch {
    // Web Crypto reports every decryption failure as the same opaque OperationError.
    return fail(
      source === 'raw' ? 'key' : 'passphrase',
      mode === 'GCM'
        ? 'Decryption failed: wrong key or passphrase, or the data was changed (the GCM tag doesn’t match).'
        : 'Decryption failed: wrong key or passphrase, or corrupted data (the padding is invalid).'
    );
  }
}

/** The equivalent `openssl enc` command, for the OpenSSL format with base64 output. */
export function opensslCommand(
  settings: AesSettings,
  direction: 'encrypt' | 'decrypt'
): string | null {
  if (settings.source !== 'openssl' || settings.mode === 'GCM' || settings.encoding !== 'base64') {
    return null;
  }
  const kdf =
    settings.opensslKdf === 'pbkdf2'
      ? `-pbkdf2 -iter ${settings.iterations}`
      : `-md ${settings.opensslKdf}`;
  const cipher = `-aes-${settings.keyBits}-${settings.mode.toLowerCase()}`;
  return `openssl enc ${direction === 'decrypt' ? '-d ' : ''}${cipher} ${kdf} -a -A`;
}

export function randomHex(bytes: number): string {
  return encodeHex(randomBytes(bytes));
}
