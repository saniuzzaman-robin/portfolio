'use client';

import { usePersistentState } from '@/components/tools/workbench/use-persistent-state';
import { SAMPLE_HEADER, SAMPLE_PAYLOAD } from '@/lib/tools/jwt/sample';

export type JwtMode = 'decode' | 'encode';

const isMode = (value: unknown): value is JwtMode => value === 'decode' || value === 'encode';

export function useJwtMode() {
  return usePersistentState<JwtMode>('jwt:mode', 'decode', isMode);
}

/*
 * The encoder's header and payload persist like any other tool input. Tokens, secrets and keys
 * are credentials, so they live in component state only and are gone on reload.
 */
export function useSignHeader() {
  return usePersistentState('jwt:header', SAMPLE_HEADER);
}

export function useSignPayload() {
  return usePersistentState('jwt:payload', SAMPLE_PAYLOAD);
}
