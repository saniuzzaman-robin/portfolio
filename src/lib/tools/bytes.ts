// Technical unit symbols stay untranslated; only the digits follow the locale.
const UNITS = ['B', 'KB', 'MB', 'GB'] as const;

/** Human-readable size in binary steps (1 KB = 1024 B): `formatBytes(1536, 'en')` → "1.5 KB". */
export function formatBytes(bytes: number, locale: string): string {
  let value = Math.max(0, bytes);
  let unit = 0;
  while (value >= 1024 && unit < UNITS.length - 1) {
    value /= 1024;
    unit++;
  }
  const number = new Intl.NumberFormat(locale, { maximumFractionDigits: unit === 0 ? 0 : 1 });
  return `${number.format(value)} ${UNITS[unit]}`;
}

const encoder = new TextEncoder();

/** Size of a string once encoded as UTF-8 (what a file or request body would weigh). */
export function utf8Length(text: string): number {
  return encoder.encode(text).length;
}
