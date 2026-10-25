'use client';

import { createContext, useContext } from 'react';
import type { ToolMessageKey, ToolMessages } from './en';

export type ToolPayload = { common: ToolMessages['common']; tool: unknown };

const ToolI18nContext = createContext<ToolPayload | null>(null);

export function ToolI18nProvider({
  messages,
  children,
}: {
  messages: ToolPayload;
  children: React.ReactNode;
}) {
  return <ToolI18nContext.Provider value={messages}>{children}</ToolI18nContext.Provider>;
}

function usePayload(): ToolPayload {
  const payload = useContext(ToolI18nContext);
  if (!payload) throw new Error('Tool strings must be used inside <ToolI18nProvider>.');
  return payload;
}

/** Strings shared by every workbench (copy, clear, status bar…). */
export function useToolCommon(): ToolMessages['common'] {
  return usePayload().common;
}

/**
 * The current tool's own strings: `useToolMessages<'json'>()`. The page only sends its own
 * section, so the key must be the slug of the page being rendered.
 */
export function useToolMessages<K extends ToolMessageKey>(): ToolMessages[K] {
  return usePayload().tool as ToolMessages[K];
}
