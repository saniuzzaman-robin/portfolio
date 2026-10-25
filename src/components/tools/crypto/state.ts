'use client';

import { usePersistentState } from '@/components/tools/workbench/use-persistent-state';
import {
  DEFAULT_HASH_ALGORITHMS,
  isHashAlgorithm,
  type DigestFormat,
  type HashAlgorithm,
} from '@/lib/tools/crypto/hash';
import { DEFAULT_AES_SETTINGS, isAesSettings } from '@/lib/tools/crypto/aes';
import { BCRYPT_MIN_COST } from '@/lib/tools/crypto/bcrypt';
import { isKeyType, type KeyType } from '@/lib/tools/crypto/keypair';

/*
 * Only inputs and options persist. HMAC keys, passphrases, AES keys, passwords and generated
 * key pairs are credentials: they live in component state and are gone on reload.
 */

export const MODES = ['hash', 'aes', 'bcrypt', 'keys'] as const;
export type Mode = (typeof MODES)[number];

const isMode = (value: unknown): value is Mode => MODES.includes(value as Mode);

export function useMode() {
  return usePersistentState<Mode>('crypto:mode', 'hash', isMode);
}

export function useHashInput() {
  return usePersistentState('crypto:input', 'Hello, World!');
}

const isAlgorithmList = (value: unknown): value is HashAlgorithm[] =>
  Array.isArray(value) && value.every(isHashAlgorithm);

export function useHashAlgorithms() {
  return usePersistentState('crypto:algorithms', DEFAULT_HASH_ALGORITHMS, isAlgorithmList);
}

const isDigestFormat = (value: unknown): value is DigestFormat =>
  value === 'hex' || value === 'HEX' || value === 'base64';

export function useDigestFormat() {
  return usePersistentState<DigestFormat>('crypto:format', 'hex', isDigestFormat);
}

export function useHmacEnabled() {
  return usePersistentState('crypto:hmac', false);
}

export type Direction = 'encrypt' | 'decrypt';

const isDirection = (value: unknown): value is Direction =>
  value === 'encrypt' || value === 'decrypt';

export function useAesDirection() {
  return usePersistentState<Direction>('crypto:aesDirection', 'encrypt', isDirection);
}

export function useAesSettings() {
  return usePersistentState('crypto:aes', DEFAULT_AES_SETTINGS, isAesSettings);
}

export type BcryptAction = 'hash' | 'verify';

const isBcryptAction = (value: unknown): value is BcryptAction =>
  value === 'hash' || value === 'verify';

export function useBcryptAction() {
  return usePersistentState<BcryptAction>('crypto:bcryptAction', 'hash', isBcryptAction);
}

/** Highest cost the slider offers: 2^16 rounds already takes several seconds in a browser. */
export const BCRYPT_SLIDER_MAX = 16;

const isCost = (value: unknown): value is number =>
  Number.isInteger(value) &&
  (value as number) >= BCRYPT_MIN_COST &&
  (value as number) <= BCRYPT_SLIDER_MAX;

export function useBcryptCost() {
  return usePersistentState('crypto:bcryptCost', 10, isCost);
}

export function useKeyType() {
  return usePersistentState<KeyType>('crypto:keyType', 'ec-p256', isKeyType);
}

export type KeyFormat = 'pem' | 'jwk';

const isKeyFormat = (value: unknown): value is KeyFormat => value === 'pem' || value === 'jwk';

export function useKeyFormat() {
  return usePersistentState<KeyFormat>('crypto:keyFormat', 'pem', isKeyFormat);
}
