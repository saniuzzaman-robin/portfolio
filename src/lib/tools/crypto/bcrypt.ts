export const BCRYPT_MIN_COST = 4;
export const BCRYPT_MAX_COST = 31;
/** bcrypt ignores everything past the first 72 bytes of the password. */
export const BCRYPT_MAX_BYTES = 72;

export type BcryptParts = {
  /** "2a", "2b", "2x" or "2y". */
  version: string;
  cost: number;
  /** 22 characters of bcrypt's own base64 (16 bytes). */
  salt: string;
  /** 31 characters (23 bytes). */
  checksum: string;
};

export type BcryptParse = { ok: true; value: BcryptParts } | { ok: false; error: string };

const BCRYPT_BASE64 = /^[./A-Za-z0-9]*$/;

/** Splits a modular-crypt bcrypt hash: `$2b$10$` + 22-char salt + 31-char checksum. */
export function parseBcryptHash(text: string): BcryptParse {
  const hash = text.trim();
  const match = /^\$(2[abxy]?)\$(\d\d)\$(.*)$/.exec(hash);
  if (!match) {
    return { ok: false, error: 'A bcrypt hash starts with $2a$, $2b$ or $2y$ and a 2-digit cost.' };
  }
  const [, version, rawCost, rest] = match;
  const cost = Number(rawCost);
  if (cost < BCRYPT_MIN_COST || cost > BCRYPT_MAX_COST) {
    return {
      ok: false,
      error: `The cost must be ${BCRYPT_MIN_COST}–${BCRYPT_MAX_COST}; it is ${cost}.`,
    };
  }
  if (!BCRYPT_BASE64.test(rest)) {
    return { ok: false, error: 'The salt and checksum use only . / A–Z a–z 0–9.' };
  }
  if (rest.length !== 53) {
    return {
      ok: false,
      error: `After the cost come 53 characters (22 salt + 31 checksum); this hash has ${rest.length}.`,
    };
  }
  return { ok: true, value: { version, cost, salt: rest.slice(0, 22), checksum: rest.slice(22) } };
}

/** Hashes with a fresh random salt. Slow by design: run it off the main thread. */
export async function bcryptHash(password: string, cost: number): Promise<string> {
  const { hash } = await import('bcryptjs');
  return hash(password, cost);
}

export async function bcryptCompare(password: string, hash: string): Promise<boolean> {
  const { compare } = await import('bcryptjs');
  // $2y$ (PHP) is the same algorithm as $2b$; normalize it for libraries that only know 2a/2b.
  return compare(password, hash.trim().replace(/^\$2y\$/, '$2b$'));
}
