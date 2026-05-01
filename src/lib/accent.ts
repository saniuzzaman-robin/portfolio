/**
 * Accent token system — theme-aware color helpers.
 *
 * Components should accept `AccentToken` instead of raw hex strings.
 * `av(token)` returns the CSS custom property (respects light/dark override).
 * `ava(token, alpha)` returns the same with an alpha channel.
 */

export type AccentToken = 'primary' | 'secondary' | 'tertiary';

const ACCENT_VAR: Record<AccentToken, string> = {
  primary: 'var(--color-primary-50)',
  secondary: 'var(--color-secondary-50)',
  tertiary: 'var(--color-tertiary-50)',
};

/** Returns the CSS variable for the given accent token. */
export function av(token: AccentToken): string {
  return ACCENT_VAR[token];
}

/** Returns the CSS variable with an alpha channel (0–1). */
export function ava(token: AccentToken, alpha: number): string {
  return `rgb(from ${ACCENT_VAR[token]} r g b / ${alpha})`;
}
