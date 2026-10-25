import type { Locale } from '@/i18n/config';
import type { ToolMessageKey, ToolMessages } from './en';
import type { ToolPayload } from './provider';
import { toolsEn } from './en';
import { toolsBn } from './bn';
import { toolsAr } from './ar';

/** Server-only: bundles every locale's tool strings. */
const TOOL_MESSAGES: Record<Locale, ToolMessages> = { en: toolsEn, bn: toolsBn, ar: toolsAr };

/** What a tool page sends to the client: the shared strings plus that tool's own section. */
export function getToolPayload(locale: Locale, key: ToolMessageKey): ToolPayload {
  const messages = TOOL_MESSAGES[locale];
  return { common: messages.common, tool: messages[key] };
}
