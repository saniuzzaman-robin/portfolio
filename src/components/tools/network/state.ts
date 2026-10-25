'use client';

import { usePersistentState } from '@/components/tools/workbench/use-persistent-state';

export const MODES = ['calculator', 'split', 'list'] as const;
export type Mode = (typeof MODES)[number];

const isMode = (value: unknown): value is Mode => MODES.includes(value as Mode);

export function useMode() {
  return usePersistentState<Mode>('network:mode', 'calculator', isMode);
}

export function useCidrInput() {
  return usePersistentState('network:cidr', '192.168.1.10/24');
}

export type SplitOptions = { block: string; by: 'prefix' | 'count'; prefix: number; count: number };

const DEFAULT_SPLIT: SplitOptions = { block: '10.0.0.0/16', by: 'prefix', prefix: 24, count: 4 };

const isSplitOptions = (value: unknown): value is SplitOptions => {
  const options = value as SplitOptions | null;
  return (
    typeof options === 'object' &&
    options !== null &&
    typeof options.block === 'string' &&
    (options.by === 'prefix' || options.by === 'count') &&
    typeof options.prefix === 'number' &&
    typeof options.count === 'number'
  );
};

export function useSplitOptions() {
  return usePersistentState('network:split', DEFAULT_SPLIT, isSplitOptions);
}

const SAMPLE_LIST = [
  '# VPCs and on-prem ranges',
  '10.0.0.0/16      # prod',
  '10.1.0.0/16      # staging',
  '10.2.0.0/16      # dev',
  '10.0.8.0/24      # vpn (inside prod!)',
  '192.168.0.0/16   # office',
  '172.16.0.0/12    # partner',
  'fd00:1234::/32   # prod IPv6',
  'fd00:1234::/32   # pasted twice',
].join('\n');

export function useCidrList() {
  return usePersistentState('network:list', SAMPLE_LIST);
}

export function useLookup() {
  return usePersistentState('network:lookup', '10.0.8.20');
}
