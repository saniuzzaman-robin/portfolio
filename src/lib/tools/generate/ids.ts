import { encodeBase64 } from '@/lib/tools/encode/base64';
import { encodeHex } from '@/lib/tools/encode/hex';
import { Random } from './random';
import {
  MAX_UUID,
  NIL_UUID,
  TimeUuidGenerator,
  UUID_NAMESPACES,
  formatUuid,
  parseUuid,
  styleUuid,
  uuidV3,
  uuidV4,
  uuidV5,
  type UuidNamespace,
} from './uuid';
import { UlidGenerator } from './ulid';
import { NANOID_ALPHABETS, NANOID_MAX_SIZE, nanoid, nanoidBits, parseAlphabet } from './nanoid';
import { ObjectIdGenerator } from './objectid';

export const ID_KINDS = [
  'uuid-v4',
  'uuid-v7',
  'uuid-v1',
  'uuid-v6',
  'uuid-v3',
  'uuid-v5',
  'uuid-nil',
  'uuid-max',
  'ulid',
  'nanoid',
  'objectid',
  'bytes',
] as const;
export type IdKind = (typeof ID_KINDS)[number];

export const isUuidKind = (kind: IdKind) => kind.startsWith('uuid-');
/** Kinds whose output depends only on their inputs, so only one is generated. */
export const isFixedKind = (kind: IdKind) =>
  kind === 'uuid-v3' || kind === 'uuid-v5' || kind === 'uuid-nil' || kind === 'uuid-max';
export const isNameBasedKind = (kind: IdKind) => kind === 'uuid-v3' || kind === 'uuid-v5';

export const BYTE_FORMATS = ['hex', 'HEX', 'base64', 'base64url'] as const;
export type ByteFormat = (typeof BYTE_FORMATS)[number];

export const MAX_COUNT = 1000;
export const MAX_BYTE_LENGTH = 1024;

export type NamespaceChoice = UuidNamespace | 'custom';
export type AlphabetChoice = keyof typeof NANOID_ALPHABETS | 'custom';

export type IdOptions = {
  kind: IdKind;
  count: number;
  upper: boolean;
  hyphens: boolean;
  braces: boolean;
  namespace: NamespaceChoice;
  customNamespace: string;
  name: string;
  alphabet: AlphabetChoice;
  customAlphabet: string;
  size: number;
  byteLength: number;
  byteFormat: ByteFormat;
};

export const DEFAULT_ID_OPTIONS: IdOptions = {
  kind: 'uuid-v4',
  count: 10,
  upper: false,
  hyphens: true,
  braces: false,
  namespace: 'dns',
  customNamespace: '',
  name: 'example.com',
  alphabet: 'url',
  customAlphabet: '',
  size: 21,
  byteLength: 32,
  byteFormat: 'hex',
};

const NAMESPACE_CHOICES = [...Object.keys(UUID_NAMESPACES), 'custom'];
const ALPHABET_CHOICES = [...Object.keys(NANOID_ALPHABETS), 'custom'];

export function isIdOptions(value: unknown): value is IdOptions {
  if (typeof value !== 'object' || value === null) return false;
  const o = value as Record<string, unknown>;
  return (
    ID_KINDS.includes(o.kind as IdKind) &&
    typeof o.count === 'number' &&
    typeof o.upper === 'boolean' &&
    typeof o.hyphens === 'boolean' &&
    typeof o.braces === 'boolean' &&
    NAMESPACE_CHOICES.includes(o.namespace as string) &&
    typeof o.customNamespace === 'string' &&
    typeof o.name === 'string' &&
    ALPHABET_CHOICES.includes(o.alphabet as string) &&
    typeof o.customAlphabet === 'string' &&
    typeof o.size === 'number' &&
    typeof o.byteLength === 'number' &&
    BYTE_FORMATS.includes(o.byteFormat as ByteFormat)
  );
}

export type IdField = 'count' | 'customNamespace' | 'customAlphabet' | 'size' | 'byteLength';

export type IdResult =
  | {
      ok: true;
      ids: string[];
      /** Random bits per ID, where that is simple to state. */ bits: number | null;
    }
  | { ok: false; field: IdField; error: string };

const isWhole = (value: number, min: number, max: number) =>
  Number.isInteger(value) && value >= min && value <= max;

function formatBytes(bytes: Uint8Array, format: ByteFormat): string {
  if (format === 'base64' || format === 'base64url') {
    return encodeBase64(bytes, { urlSafe: format === 'base64url', padding: format === 'base64' });
  }
  return encodeHex(bytes, { upper: format === 'HEX' });
}

/**
 * Generates IDs of every kind. Holds the time-based generators' state, so keep one instance for
 * the page's lifetime: IDs from successive calls then stay monotonic.
 */
export class IdGenerator {
  private readonly random: Random;
  private readonly time: TimeUuidGenerator;
  private readonly ulid: UlidGenerator;
  private readonly objectId: ObjectIdGenerator;

  constructor(random = new Random(), now: () => number = Date.now) {
    this.random = random;
    this.time = new TimeUuidGenerator(random, now);
    this.ulid = new UlidGenerator(random, now);
    this.objectId = new ObjectIdGenerator(random, now);
  }

  async generate(options: IdOptions): Promise<IdResult> {
    const { kind } = options;
    const count = isFixedKind(kind) ? 1 : options.count;
    if (!isWhole(count, 1, MAX_COUNT)) {
      return { ok: false, field: 'count', error: `Count must be from 1 to ${MAX_COUNT}.` };
    }
    const repeat = (make: () => string) => Array.from({ length: count }, make);
    const uuid = (bytes: Uint8Array) => styleUuid(formatUuid(bytes), options);

    switch (kind) {
      case 'uuid-v4':
        return { ok: true, ids: repeat(() => uuid(uuidV4(this.random))), bits: 122 };
      case 'uuid-v7':
        return { ok: true, ids: repeat(() => uuid(this.time.v7())), bits: null };
      case 'uuid-v1':
        return { ok: true, ids: repeat(() => uuid(this.time.v1())), bits: null };
      case 'uuid-v6':
        return { ok: true, ids: repeat(() => uuid(this.time.v6())), bits: null };
      case 'uuid-nil':
        return { ok: true, ids: [styleUuid(NIL_UUID, options)], bits: null };
      case 'uuid-max':
        return { ok: true, ids: [styleUuid(MAX_UUID, options)], bits: null };
      case 'uuid-v3':
      case 'uuid-v5': {
        const namespace = parseUuid(
          options.namespace === 'custom'
            ? options.customNamespace
            : UUID_NAMESPACES[options.namespace]
        );
        if (!namespace) {
          return { ok: false, field: 'customNamespace', error: 'The namespace must be a UUID.' };
        }
        const bytes =
          kind === 'uuid-v3'
            ? uuidV3(namespace, options.name)
            : await uuidV5(namespace, options.name);
        return { ok: true, ids: [uuid(bytes)], bits: null };
      }
      case 'ulid':
        return { ok: true, ids: repeat(() => this.ulid.next()), bits: 80 };
      case 'nanoid': {
        const alphabet = parseAlphabet(
          options.alphabet === 'custom'
            ? options.customAlphabet
            : NANOID_ALPHABETS[options.alphabet]
        );
        if (!alphabet.ok) return { ok: false, field: 'customAlphabet', error: alphabet.error };
        if (!isWhole(options.size, 1, NANOID_MAX_SIZE)) {
          return { ok: false, field: 'size', error: `Size must be from 1 to ${NANOID_MAX_SIZE}.` };
        }
        return {
          ok: true,
          ids: repeat(() => nanoid(this.random, alphabet.chars, options.size)),
          bits: nanoidBits(alphabet.chars.length, options.size),
        };
      }
      case 'objectid': {
        const ids = repeat(() => this.objectId.next());
        return {
          ok: true,
          ids: options.upper ? ids.map((id) => id.toUpperCase()) : ids,
          bits: null,
        };
      }
      case 'bytes': {
        if (!isWhole(options.byteLength, 1, MAX_BYTE_LENGTH)) {
          return {
            ok: false,
            field: 'byteLength',
            error: `Length must be from 1 to ${MAX_BYTE_LENGTH} bytes.`,
          };
        }
        return {
          ok: true,
          ids: repeat(() => formatBytes(this.random.bytes(options.byteLength), options.byteFormat)),
          bits: options.byteLength * 8,
        };
      }
    }
  }
}
