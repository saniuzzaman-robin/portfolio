'use client';

import { createContext, useContext, useLayoutEffect } from 'react';
import type { ToolSlug } from '@/lib/data/tools';
import { TOOL_PARAMS } from '@/lib/data/tool-presets';
import { readPersistentState, writePersistentState } from './use-persistent-state';

const PresetTitleContext = createContext<string | null>(null);

/** Gives the page's `<h1>` the preset's title instead of the tool's. */
export function PresetTitleProvider({
  title,
  children,
}: {
  title: string | null;
  children: React.ReactNode;
}) {
  return <PresetTitleContext.Provider value={title}>{children}</PresetTitleContext.Provider>;
}

export function usePresetTitle(): string | null {
  return useContext(PresetTitleContext);
}

/** Selects an ID kind in the generator, keeping its other options. */
async function selectIdKind(kind: string) {
  const { ID_KINDS, DEFAULT_ID_OPTIONS, isIdOptions } = await import('@/lib/tools/generate/ids');
  const valid = ID_KINDS.find((entry) => entry === kind);
  if (!valid) return;
  const stored = readPersistentState('generate:ids');
  writePersistentState('generate:ids', {
    ...(isIdOptions(stored) ? stored : DEFAULT_ID_OPTIONS),
    kind: valid,
  });
}

/** Short plain tokens only: whatever a link carries ends up in storage. */
const SAFE_VALUE = /^[\w.,-]{1,64}$/;

/**
 * Opens the tool in the view a link asks for: a preset page's own settings, or the query params
 * the tool understands (`?mode=minify`, `?language=sql`…) on the plain tool URL. The tool's own
 * setting ignores values it doesn't know. Runs before paint, so the tool doesn't flash its
 * previous view.
 */
export function ToolDeepLink({
  slug,
  preset,
}: {
  slug: ToolSlug;
  preset?: { params: Record<string, string> };
}) {
  const presetParams = preset ? JSON.stringify(preset.params) : null;
  useLayoutEffect(() => {
    const specs = TOOL_PARAMS[slug];
    if (!specs) return;
    const query = new URLSearchParams(window.location.search);
    const requested: Record<string, string> = presetParams
      ? JSON.parse(presetParams)
      : Object.fromEntries(
          Object.keys(specs).flatMap((name) => {
            const value = query.get(name);
            return value === null ? [] : [[name, value]];
          })
        );
    for (const [name, value] of Object.entries(requested)) {
      const spec = specs[name];
      if (!spec || !SAFE_VALUE.test(value)) continue;
      if (spec.key === 'generate:ids') {
        // An ID kind only shows in the generator's first mode.
        if (!requested.mode) writePersistentState('generate:mode', 'ids');
        void selectIdKind(value);
      } else {
        writePersistentState(spec.key, spec.list ? value.split(',') : value);
      }
    }
  }, [slug, presetParams]);
  return null;
}
