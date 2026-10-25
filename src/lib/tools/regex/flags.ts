/** Flags the user can toggle, in the order `RegExp.prototype.flags` prints them. */
export const FLAGS = ['g', 'i', 'm', 's', 'u', 'v', 'y'] as const;
export type RegexFlag = (typeof FLAGS)[number];

const isFlag = (value: string): value is RegexFlag => FLAGS.includes(value as RegexFlag);

/** A string of distinct toggleable flags, at most one of `u` and `v`. */
export function isFlags(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  const chars = [...value];
  return (
    chars.every(isFlag) &&
    new Set(chars).size === chars.length &&
    !(chars.includes('u') && chars.includes('v'))
  );
}

/** Adds or removes `flag`, keeping the canonical order. `u` and `v` replace each other. */
export function toggleFlag(flags: string, flag: RegexFlag): string {
  const set = new Set(flags);
  if (set.has(flag)) set.delete(flag);
  else {
    set.add(flag);
    if (flag === 'u') set.delete('v');
    if (flag === 'v') set.delete('u');
  }
  return FLAGS.filter((each) => set.has(each)).join('');
}

/** `flags` plus `extra`, without duplicates, in canonical order (`d` first). */
export function withFlags(flags: string, extra: string): string {
  const set = new Set(flags + extra);
  return ['d', ...FLAGS].filter((each) => set.has(each)).join('');
}

/** Splits a pasted literal like `/a+b/gi` into its pattern and flags; null if it isn't one. */
export function splitLiteral(text: string): { pattern: string; flags: string } | null {
  const trimmed = text.trim();
  const close = trimmed.lastIndexOf('/');
  if (!trimmed.startsWith('/') || close < 1) return null;
  const flags = trimmed.slice(close + 1);
  const pattern = trimmed.slice(1, close);
  if (!pattern || !isFlags(flags)) return null;
  return { pattern, flags };
}

export type CompileResult = { ok: true; regex: RegExp } | { ok: false; error: string };

/** Engine messages repeat the whole pattern ("Invalid regular expression: /…/g: …"); drop it. */
function cleanMessage(message: string): string {
  const prefix = 'Invalid regular expression: ';
  if (!message.startsWith(prefix)) return message;
  const rest = message.slice(prefix.length);
  const match = /^\/[\s\S]*\/[a-z]*: ([\s\S]+)$/.exec(rest);
  return match ? match[1] : rest;
}

/** Compiles with the browser's own engine, so its rules (and version) decide what is valid. */
export function compileRegex(pattern: string, flags: string): CompileResult {
  try {
    return { ok: true, regex: new RegExp(pattern, flags) };
  } catch (error) {
    return {
      ok: false,
      error: cleanMessage(error instanceof Error ? error.message : String(error)),
    };
  }
}
