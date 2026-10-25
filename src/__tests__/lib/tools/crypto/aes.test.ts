// @vitest-environment node
// Web Crypto (crypto.subtle) is only available in the Node environment, not in jsdom.
import {
  createCipheriv,
  createDecipheriv,
  pbkdf2Sync,
  type CipherGCM,
  type DecipherGCM,
} from 'node:crypto';
import { describe, it, expect } from 'vitest';
import {
  AES_MODES,
  DEFAULT_AES_SETTINGS,
  decryptAes,
  encryptAes,
  isAesSettings,
  opensslCommand,
  type AesMode,
  type AesSecrets,
  type AesSettings,
  type DecryptResult,
  type EncryptResult,
} from '@/lib/tools/crypto/aes';
import { decodeBase64 } from '@/lib/tools/encode/base64';
import { encodeHex } from '@/lib/tools/encode/hex';

const encoder = new TextEncoder();
const decoder = new TextDecoder();
const PLAINTEXT = 'Hello, World! 👋 Grüße';
const NO_SECRETS: AesSecrets = { passphrase: '', key: '', iv: '' };

const settings = (overrides: Partial<AesSettings>): AesSettings => ({
  ...DEFAULT_AES_SETTINGS,
  // Keep PBKDF2 fast in tests.
  iterations: 1000,
  ...overrides,
});

function output(result: EncryptResult): string {
  if (!result.ok) throw new Error(`Encryption failed: ${result.error}`);
  return result.output;
}

function text(result: DecryptResult): string {
  if (!result.ok) throw new Error(`Decryption failed: ${result.error}`);
  return decoder.decode(result.bytes);
}

const base64Bytes = (value: string) => {
  const decoded = decodeBase64(value);
  if (!decoded.ok) throw new Error(decoded.error.message);
  return decoded.value.bytes;
};

describe('OpenSSL / CryptoJS format', () => {
  // Made with `printf 'Hello, World!' | openssl enc <args> -pass pass:secret -a -A` (OpenSSL 3).
  it.each([
    ['md5', 256, 'CBC', 'U2FsdGVkX1/HXXhUntCiWcfjXL9diDYhIAkqVNyEuGo='],
    ['sha256', 128, 'CTR', 'U2FsdGVkX1+fSc8ttVdRuZjpsmk2IXg69eR9zs4='],
    ['pbkdf2', 256, 'CBC', 'U2FsdGVkX19ww47I/Yf9dYCbC5u/pidG8jHpc4LZQ8U='],
  ] as const)('decrypts openssl enc output (%s, AES-%i-%s)', async (kdf, bits, mode, input) => {
    const options = settings({ source: 'openssl', opensslKdf: kdf, keyBits: bits, mode });
    const result = await decryptAes(input, options, { ...NO_SECRETS, passphrase: 'secret' });
    expect(text(result)).toBe('Hello, World!');
  });

  it('writes the Salted__ header and round-trips', async () => {
    const options = settings({ source: 'openssl', mode: 'CBC' });
    const secrets = { ...NO_SECRETS, passphrase: 'secret' };
    const encrypted = output(await encryptAes(encoder.encode(PLAINTEXT), options, secrets));
    expect(encrypted.startsWith('U2FsdGVkX1')).toBe(true);
    expect(text(await decryptAes(encrypted, options, secrets))).toBe(PLAINTEXT);
  });

  it('uses a fresh salt every time, because the IV comes from it', async () => {
    const options = settings({ source: 'openssl', mode: 'CTR' });
    const secrets = { ...NO_SECRETS, passphrase: 'secret' };
    const plaintext = encoder.encode(PLAINTEXT);
    const first = output(await encryptAes(plaintext, options, secrets));
    const second = output(await encryptAes(plaintext, options, secrets));
    expect(first).not.toBe(second);
  });

  it('rejects GCM and data without the header', async () => {
    const secrets = { ...NO_SECRETS, passphrase: 'secret' };
    const gcm = await encryptAes(new Uint8Array(1), settings({ source: 'openssl' }), secrets);
    expect(gcm).toMatchObject({ ok: false, field: 'settings' });
    const unsalted = await decryptAes(
      'AAAAAAAAAAAAAAAAAAAAAA==',
      settings({ source: 'openssl', mode: 'CBC' }),
      secrets
    );
    expect(unsalted).toMatchObject({ ok: false, field: 'input' });
  });

  it('builds the equivalent command', () => {
    expect(opensslCommand(settings({ source: 'openssl', mode: 'CBC' }), 'encrypt')).toBe(
      'openssl enc -aes-256-cbc -md md5 -a -A'
    );
    expect(
      opensslCommand(
        settings({ source: 'openssl', mode: 'CTR', keyBits: 128, opensslKdf: 'pbkdf2' }),
        'decrypt'
      )
    ).toBe('openssl enc -d -aes-128-ctr -pbkdf2 -iter 1000 -a -A');
    expect(opensslCommand(settings({ source: 'pbkdf2' }), 'encrypt')).toBeNull();
  });
});

describe('PBKDF2 format', () => {
  it.each(AES_MODES.flatMap((mode) => ([128, 256] as const).map((bits) => [mode, bits] as const)))(
    'AES-%s-%i round-trips and is salt ‖ IV ‖ ciphertext',
    async (mode, bits) => {
      const options = settings({ mode, keyBits: bits });
      const secrets = { ...NO_SECRETS, passphrase: 'correct horse' };
      const encrypted = output(await encryptAes(encoder.encode(PLAINTEXT), options, secrets));
      expect(text(await decryptAes(encrypted, options, secrets))).toBe(PLAINTEXT);

      // Decrypt independently with node:crypto to pin down the format.
      const data = base64Bytes(encrypted);
      const ivBytes = mode === 'GCM' ? 12 : 16;
      const salt = data.subarray(0, 16);
      const iv = data.subarray(16, 16 + ivBytes);
      const key = pbkdf2Sync('correct horse', salt, 1000, bits / 8, 'sha256');
      let body = data.subarray(16 + ivBytes);
      const decipher = createDecipheriv(`aes-${bits}-${mode.toLowerCase()}`, key, iv);
      if (mode === 'GCM') {
        (decipher as DecipherGCM).setAuthTag(body.subarray(body.length - 16));
        body = body.subarray(0, body.length - 16);
      }
      const plain = Buffer.concat([decipher.update(body), decipher.final()]).toString('utf8');
      expect(plain).toBe(PLAINTEXT);
    }
  );

  it('never repeats an IV, even when the salt is reused', async () => {
    const options = settings({ mode: 'GCM' });
    const secrets = { ...NO_SECRETS, passphrase: 'p' };
    const ivs = new Set<string>();
    for (let i = 0; i < 5; i++) {
      const data = base64Bytes(output(await encryptAes(new Uint8Array(4), options, secrets)));
      ivs.add(encodeHex(data.subarray(16, 28)));
    }
    expect(ivs.size).toBe(5);
  });

  it('reports a wrong passphrase', async () => {
    const options = settings({ mode: 'GCM' });
    const encrypted = output(
      await encryptAes(encoder.encode('x'), options, { ...NO_SECRETS, passphrase: 'right' })
    );
    const result = await decryptAes(encrypted, options, { ...NO_SECRETS, passphrase: 'wrong' });
    expect(result).toMatchObject({ ok: false, field: 'passphrase' });
  });

  it('validates the passphrase, iterations and input', async () => {
    const data = new Uint8Array(1);
    expect(await encryptAes(data, settings({}), NO_SECRETS)).toMatchObject({
      ok: false,
      field: 'passphrase',
    });
    const secrets = { ...NO_SECRETS, passphrase: 'p' };
    expect(await encryptAes(data, settings({ iterations: 0 }), secrets)).toMatchObject({
      ok: false,
      field: 'settings',
    });
    expect(await decryptAes('AAAA', settings({}), secrets)).toMatchObject({
      ok: false,
      field: 'input',
    });
    expect(await decryptAes('not base64!', settings({}), secrets)).toMatchObject({
      ok: false,
      field: 'input',
    });
  });
});

describe('raw key and IV', () => {
  // NIST SP 800-38A F.2.5 / F.5.5 (AES-256), first block.
  const KEY = '603deb1015ca71be2b73aef0857d77811f352c073b6108d72d9810a30914dff4';
  const BLOCK = '6bc1bee22e409f96e93d7e117393172a';
  const hexBytes = (hex: string) => new Uint8Array(hex.match(/../g)!.map((b) => parseInt(b, 16)));

  it('matches SP 800-38A CBC', async () => {
    const options = settings({ source: 'raw', mode: 'CBC', encoding: 'hex' });
    const secrets = { ...NO_SECRETS, key: KEY, iv: '000102030405060708090a0b0c0d0e0f' };
    const encrypted = output(await encryptAes(hexBytes(BLOCK), options, secrets));
    // Web Crypto adds a PKCS#7 padding block after the NIST block.
    expect(encrypted.slice(0, 32)).toBe('f58c4c04d6e5f1ba779eabfb5f7bfbd6');
    expect(encrypted).toHaveLength(64);
  });

  it('matches SP 800-38A CTR', async () => {
    const options = settings({ source: 'raw', mode: 'CTR', encoding: 'hex' });
    const secrets = { ...NO_SECRETS, key: KEY, iv: 'f0f1f2f3f4f5f6f7f8f9fafbfcfdfeff' };
    expect(output(await encryptAes(hexBytes(BLOCK), options, secrets))).toBe(
      '601ec313775789a5b7a7f504bbf3d228'
    );
  });

  it.each(AES_MODES)(
    'AES-%s matches node:crypto (GCM output is ciphertext ‖ tag)',
    async (mode: AesMode) => {
      const key = '000102030405060708090a0b0c0d0e0f';
      const iv = mode === 'GCM' ? 'cafebabefacedbaddecaf888' : 'f0f1f2f3f4f5f6f7f8f9fafbfcfdfeff';
      const options = settings({ source: 'raw', mode, encoding: 'hex' });
      const secrets = { ...NO_SECRETS, key, iv };
      const encrypted = output(await encryptAes(encoder.encode(PLAINTEXT), options, secrets));

      const cipher = createCipheriv(`aes-128-${mode.toLowerCase()}`, hexBytes(key), hexBytes(iv));
      let expected = Buffer.concat([cipher.update(PLAINTEXT, 'utf8'), cipher.final()]).toString(
        'hex'
      );
      if (mode === 'GCM') expected += (cipher as CipherGCM).getAuthTag().toString('hex');
      expect(encrypted).toBe(expected);
      expect(text(await decryptAes(encrypted, options, secrets))).toBe(PLAINTEXT);
    }
  );

  it.each([
    [{ key: '', iv: '00'.repeat(12) }, 'key'],
    [{ key: '00'.repeat(24), iv: '00'.repeat(12) }, 'key'],
    [{ key: '00'.repeat(15), iv: '00'.repeat(12) }, 'key'],
    [{ key: 'zz', iv: '00'.repeat(12) }, 'key'],
    [{ key: '00'.repeat(16), iv: '' }, 'iv'],
    [{ key: '00'.repeat(16), iv: '00'.repeat(16) }, 'iv'],
  ])('rejects %j', async (secrets, field) => {
    const result = await encryptAes(new Uint8Array(1), settings({ source: 'raw', mode: 'GCM' }), {
      ...NO_SECRETS,
      ...secrets,
    });
    expect(result).toMatchObject({ ok: false, field });
  });

  it('rejects CBC ciphertext that is not whole blocks', async () => {
    const options = settings({ source: 'raw', mode: 'CBC', encoding: 'hex' });
    const secrets = { ...NO_SECRETS, key: '00'.repeat(16), iv: '00'.repeat(16) };
    expect(await decryptAes('00'.repeat(17), options, secrets)).toMatchObject({
      ok: false,
      field: 'input',
    });
  });
});

describe('isAesSettings', () => {
  it('accepts the defaults and rejects other shapes', () => {
    expect(isAesSettings(DEFAULT_AES_SETTINGS)).toBe(true);
    expect(isAesSettings({ ...DEFAULT_AES_SETTINGS, keyBits: 192 })).toBe(false);
    expect(isAesSettings({ ...DEFAULT_AES_SETTINGS, mode: 'ECB' })).toBe(false);
    expect(isAesSettings(null)).toBe(false);
  });
});
