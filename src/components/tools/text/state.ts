'use client';

import { usePersistentState } from '@/components/tools/workbench/use-persistent-state';
import { DEFAULT_ESCAPE_OPTIONS, ESCAPE_TARGETS, isEscapeOptions } from '@/lib/tools/text/escape';
import type { EscapeTarget } from '@/lib/tools/text/escape';
import { DEFAULT_LINE_OPTIONS, isLineOptions } from '@/lib/tools/text/lines';
import { DEFAULT_LOREM_OPTIONS, isLoremOptions } from '@/lib/tools/text/lorem';
import { DEFAULT_SLUG_OPTIONS, isSlugOptions } from '@/lib/tools/text/slug';

export const MODES = ['case', 'lines', 'count', 'escape', 'lorem'] as const;
export type Mode = (typeof MODES)[number];

const isMode = (value: unknown): value is Mode => MODES.includes(value as Mode);

export function useMode() {
  return usePersistentState<Mode>('text:mode', 'case', isMode);
}

const SAMPLE = ['userAccountId', 'XMLHttpRequest', 'max_retry_count', 'the quick brown fox'].join(
  '\n'
);

/** One input for every view except lorem, so text carries over when switching. */
export function useTextInput() {
  return usePersistentState('text:input', SAMPLE);
}

export function useWrap() {
  return usePersistentState('text:wrap', true);
}

export function useSlugOptions() {
  return usePersistentState('text:slug', DEFAULT_SLUG_OPTIONS, isSlugOptions);
}

export function useLineOptions() {
  return usePersistentState('text:lines', DEFAULT_LINE_OPTIONS, isLineOptions);
}

export type Direction = 'escape' | 'unescape';
const isDirection = (value: unknown): value is Direction =>
  value === 'escape' || value === 'unescape';

export function useDirection() {
  return usePersistentState<Direction>('text:direction', 'escape', isDirection);
}

const isTarget = (value: unknown): value is EscapeTarget =>
  ESCAPE_TARGETS.includes(value as EscapeTarget);

export function useEscapeTarget() {
  return usePersistentState<EscapeTarget>('text:target', 'json', isTarget);
}

export function useEscapeOptions() {
  return usePersistentState('text:escape', DEFAULT_ESCAPE_OPTIONS, isEscapeOptions);
}

export function useLoremOptions() {
  return usePersistentState('text:lorem', DEFAULT_LOREM_OPTIONS, isLoremOptions);
}
