'use client';

import { usePersistentState } from '@/components/tools/workbench/use-persistent-state';
import { EPOCH_UNITS, type EpochUnit } from '@/lib/tools/time/instant';
import { isTimeZone } from '@/lib/tools/time/zone';

export const MODES = ['convert', 'diff', 'cron'] as const;
export type Mode = (typeof MODES)[number];

const isMode = (value: unknown): value is Mode => MODES.includes(value as Mode);

export function useMode() {
  return usePersistentState<Mode>('time:mode', 'convert', isMode);
}

/** `''` is the viewer's own zone; anything else is an IANA name. */
const isZone = (value: unknown): value is string =>
  typeof value === 'string' && (value === '' || isTimeZone(value));

/** One zone for every view, so a converted date and its cron runs line up. */
export function useZone() {
  return usePersistentState('time:zone', '', isZone);
}

export type UnitOption = EpochUnit | 'auto';
const isUnit = (value: unknown): value is UnitOption =>
  value === 'auto' || EPOCH_UNITS.includes(value as EpochUnit);

export function useUnit() {
  return usePersistentState<UnitOption>('time:unit', 'auto', isUnit);
}

/** Empty means "now". */
export function useConvertInput() {
  return usePersistentState('time:input', '');
}

export function useDiffInputs() {
  const [start, setStart] = usePersistentState('time:start', '2026-01-01T00:00');
  const [end, setEnd] = usePersistentState('time:end', '');
  const [duration, setDuration] = usePersistentState('time:duration', '1d 2h 30m');
  return { start, setStart, end, setEnd, duration, setDuration };
}

export function useCronInput() {
  return usePersistentState('time:cron', '*/15 9-17 * * MON-FRI');
}

export function useQuartz() {
  return usePersistentState('time:quartz', false);
}

export const RUN_COUNTS = ['5', '10', '25', '50'] as const;
export type RunCount = (typeof RUN_COUNTS)[number];
const isRunCount = (value: unknown): value is RunCount => RUN_COUNTS.includes(value as RunCount);

export function useRunCount() {
  return usePersistentState<RunCount>('time:count', '10', isRunCount);
}
