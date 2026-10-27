import type { ToolMessageKey } from './en';
import type { ToolPayload } from './provider';
import { toolsEn } from './en';

/** What a tool page sends to the client: the shared strings plus that tool's own section. */
export function getToolPayload(key: ToolMessageKey): ToolPayload {
  return { common: toolsEn.common, tool: toolsEn[key] };
}
