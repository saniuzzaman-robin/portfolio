'use client';

import { usePersistentState } from '@/components/tools/workbench/use-persistent-state';
import { DEFAULT_CODEC_OPTIONS, isCodecOptions, type Direction } from '@/lib/tools/encode/codecs';

/** Every mode in the picker: the text codecs plus File and the URL parser. */
export const MODES = [
  'base64',
  'file',
  'base32',
  'hex',
  'binary',
  'url',
  'urlParts',
  'html',
  'unicode',
  'punycode',
  'qp',
  'rot',
] as const;
export type Mode = (typeof MODES)[number];

const isMode = (value: unknown): value is Mode => MODES.includes(value as Mode);
const isDirection = (value: unknown): value is Direction =>
  value === 'encode' || value === 'decode';

// Non-ASCII on purpose: shows that text is encoded as UTF-8.
const SAMPLE = 'Hello, World! 👋 Grüße — こんにちは';

export function useMode() {
  return usePersistentState<Mode>('encode:mode', 'base64', isMode);
}

/** Shared by the text codecs and File mode, so switching between them keeps the direction. */
export function useDirection() {
  return usePersistentState<Direction>('encode:direction', 'encode', isDirection);
}

/** Shared by the text codecs and File mode's decoder, so a detected data URI carries over. */
export function useEncodeInput() {
  return usePersistentState('encode:input', SAMPLE);
}

export function useCodecOptions() {
  return usePersistentState('encode:options', DEFAULT_CODEC_OPTIONS, isCodecOptions);
}

/** Encoded output is usually one long line, so wrapping starts on. */
export function useWrap() {
  return usePersistentState('encode:wrap', true);
}
