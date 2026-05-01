/**
 * Accent token system — theme-aware color helpers.
 *
 * Components should accept `AccentToken` instead of raw hex strings.
 * `av(token)` returns the CSS custom property (respects light/dark override).
 * `ava(token, alpha)` returns the same with an alpha channel.
 *
 * `ACCENT_CLASSES` provides pre-built Tailwind class strings for each token.
 * Use these instead of defining per-file color maps.
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

/** Pre-built Tailwind class strings for each accent token. */
export const ACCENT_CLASSES: Record<
  AccentToken,
  {
    /** e.g. `text-primary-50` */
    text: string;
    /** e.g. `hover:text-primary-60` */
    textHover: string;
    /** CSS neon glow class e.g. `neon-green` */
    neon: string;
    /** Full-opacity border e.g. `border-primary-50` */
    border: string;
    /** Soft border + hover, suitable for cards e.g. `border-primary-50/20 hover:border-primary-50/40` */
    borderSoft: string;
    /** Stronger soft border e.g. `border-primary-50/25 hover:border-primary-50/70` */
    borderMedium: string;
    /** Tag pill: background + text e.g. `bg-primary-50/10 text-primary-50` */
    tag: string;
    /** Box-glow on hover e.g. `hover:neon-box-green` */
    glow: string;
  }
> = {
  primary: {
    text: 'text-primary-50',
    textHover: 'hover:text-primary-60',
    neon: 'neon-green',
    border: 'border-primary-50',
    borderSoft: 'border-primary-50/20 hover:border-primary-50/40',
    borderMedium: 'border-primary-50/25 hover:border-primary-50/70',
    tag: 'bg-primary-50/10 text-primary-50',
    glow: 'hover:neon-box-green',
  },
  secondary: {
    text: 'text-secondary-50',
    textHover: 'hover:text-secondary-60',
    neon: 'neon-cyan',
    border: 'border-secondary-50',
    borderSoft: 'border-secondary-50/20 hover:border-secondary-50/40',
    borderMedium: 'border-secondary-50/25 hover:border-secondary-50/70',
    tag: 'bg-secondary-50/10 text-secondary-50',
    glow: 'hover:neon-box-cyan',
  },
  tertiary: {
    text: 'text-tertiary-50',
    textHover: 'hover:text-tertiary-60',
    neon: 'neon-purple',
    border: 'border-tertiary-50',
    borderSoft: 'border-tertiary-50/20 hover:border-tertiary-50/40',
    borderMedium: 'border-tertiary-50/25 hover:border-tertiary-50/70',
    tag: 'bg-tertiary-50/10 text-tertiary-50',
    glow: 'hover:neon-box-purple',
  },
};
