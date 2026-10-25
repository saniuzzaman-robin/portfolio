'use client';

import { usePersistentState } from '@/components/tools/workbench/use-persistent-state';
import { DEFAULT_ID_OPTIONS, isIdOptions } from '@/lib/tools/generate/ids';
import {
  DEFAULT_PASSPHRASE_OPTIONS,
  DEFAULT_PASSWORD_OPTIONS,
  isPassphraseOptions,
  isPasswordOptions,
} from '@/lib/tools/generate/password';

/*
 * Options and the inspector's input persist. Generated passwords are credentials: they live in
 * component state and are gone on reload.
 */

export const MODES = ['ids', 'inspect', 'password'] as const;
export type Mode = (typeof MODES)[number];

const isMode = (value: unknown): value is Mode => MODES.includes(value as Mode);

export function useMode() {
  return usePersistentState<Mode>('generate:mode', 'ids', isMode);
}

export function useIdOptions() {
  return usePersistentState('generate:ids', DEFAULT_ID_OPTIONS, isIdOptions);
}

/** One of each kind the inspector understands. */
const INSPECT_SAMPLE = [
  '017f22e2-79b0-7cc3-98c4-dc0c0c07398f',
  'c232ab00-9414-11ec-b3c8-9f6bdeced846',
  '01ARZ3NDEKTSV4RRFFQ69G5FAV',
  '507f1f77bcf86cd799439011',
].join('\n');

export function useInspectInput() {
  return usePersistentState('generate:inspect', INSPECT_SAMPLE);
}

export type PasswordKind = 'password' | 'passphrase';

const isPasswordKind = (value: unknown): value is PasswordKind =>
  value === 'password' || value === 'passphrase';

export function usePasswordKind() {
  return usePersistentState<PasswordKind>('generate:passwordKind', 'password', isPasswordKind);
}

export function usePasswordOptions() {
  return usePersistentState('generate:password', DEFAULT_PASSWORD_OPTIONS, isPasswordOptions);
}

export function usePassphraseOptions() {
  return usePersistentState('generate:passphrase', DEFAULT_PASSPHRASE_OPTIONS, isPassphraseOptions);
}
