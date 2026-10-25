'use client';

import { useState } from 'react';
import { usePersistentState } from '@/components/tools/workbench/use-persistent-state';
import { parseColor, type ParseColorResult } from '@/lib/tools/color/parse';
import type { Color } from '@/lib/tools/color/convert';

export function useColorInput() {
  return usePersistentState('color:input', 'oklch(62% 0.19 260)');
}

export function useBackgroundInput() {
  return usePersistentState('color:background', '#ffffff');
}

export function useLegacySyntax() {
  return usePersistentState('color:legacy', false);
}

/**
 * Parses `text`, and while it is invalid (mid-typing) keeps returning the last valid color, so
 * the panels don't flash empty on every keystroke.
 */
export function useParsedColor(text: string): { result: ParseColorResult; color: Color | null } {
  const [lastValid, setLastValid] = useState<{ text: string; color: Color } | null>(null);
  const result = parseColor(text);
  // Adjusting state during render (React's pattern for remembering earlier values).
  if (result.ok && lastValid?.text !== text) setLastValid({ text, color: result.color });
  return { result, color: result.ok ? result.color : (lastValid?.color ?? null) };
}
