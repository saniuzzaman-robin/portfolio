'use client';

import { useCallback, useMemo, useState } from 'react';
import { usePersistentState } from '@/components/tools/workbench/use-persistent-state';
import {
  CONTENT_TYPES,
  EMPTY_FIELDS,
  isQrFields,
  type ContentType,
  type QrFields,
} from '@/lib/tools/qr/content';
import { EC_LEVELS, type EcLevel } from '@/lib/tools/qr/qr';

const isContentType = (value: unknown): value is ContentType =>
  CONTENT_TYPES.includes(value as ContentType);

export function useContentType() {
  return usePersistentState<ContentType>('qr:type', 'url', isContentType);
}

const SAMPLE_FIELDS: QrFields = {
  ...EMPTY_FIELDS,
  text: 'Hello! This QR code was made in the browser.',
  url: 'https://example.com',
};

/**
 * Content fields, persisted except the Wi-Fi password: that one lives in this tab's memory only,
 * like every other secret in the tools.
 */
export function useQrFields(): [QrFields, (fields: QrFields) => void] {
  const [stored, setStored] = usePersistentState('qr:fields', SAMPLE_FIELDS, isQrFields);
  const [password, setPassword] = useState('');
  const fields = useMemo(
    () => ({ ...stored, wifi: { ...stored.wifi, password } }),
    [stored, password]
  );
  const setFields = useCallback(
    (next: QrFields) => {
      setPassword(next.wifi.password);
      setStored({ ...next, wifi: { ...next.wifi, password: '' } });
    },
    [setStored]
  );
  return [fields, setFields];
}

export type Appearance = {
  level: EcLevel;
  /** PNG width and height, and the SVG's width/height attributes. */
  size: number;
  /** Quiet zone in modules. */
  margin: number;
  foreground: string;
  background: string;
};

export const SIZE_RANGE = { min: 64, max: 4096 };
export const MARGIN_RANGE = { min: 0, max: 16 };
/** What the QR spec asks for; less may not scan. */
export const SPEC_MARGIN = 4;

const DEFAULT_APPEARANCE: Appearance = {
  level: 'M',
  size: 512,
  margin: SPEC_MARGIN,
  foreground: '#000000',
  background: '#ffffff',
};

const isAppearance = (value: unknown): value is Appearance => {
  const appearance = value as Appearance | null;
  return (
    typeof appearance === 'object' &&
    appearance !== null &&
    EC_LEVELS.includes(appearance.level) &&
    typeof appearance.size === 'number' &&
    typeof appearance.margin === 'number' &&
    typeof appearance.foreground === 'string' &&
    typeof appearance.background === 'string'
  );
};

export function useAppearance() {
  return usePersistentState('qr:appearance', DEFAULT_APPEARANCE, isAppearance);
}
