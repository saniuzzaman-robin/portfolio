export type AccentToken = 'primary' | 'secondary' | 'tertiary';

const ACCENT_VAR: Record<AccentToken, string> = {
  primary: 'var(--color-primary-50)',
  secondary: 'var(--color-secondary-50)',
  tertiary: 'var(--color-tertiary-50)',
};

export function av(token: AccentToken): string {
  return ACCENT_VAR[token];
}

export function ava(token: AccentToken, alpha: number): string {
  return `rgb(from ${ACCENT_VAR[token]} r g b / ${alpha})`;
}

export const ACCENT_CLASSES: Record<
  AccentToken,
  {
    text: string;
    textHover: string;
    neon: string;
    border: string;
    borderSoft: string;
    borderMedium: string;
    tag: string;
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
  },
  secondary: {
    text: 'text-secondary-50',
    textHover: 'hover:text-secondary-60',
    neon: 'neon-cyan',
    border: 'border-secondary-50',
    borderSoft: 'border-secondary-50/20 hover:border-secondary-50/40',
    borderMedium: 'border-secondary-50/25 hover:border-secondary-50/70',
    tag: 'bg-secondary-50/10 text-secondary-50',
  },
  tertiary: {
    text: 'text-tertiary-50',
    textHover: 'hover:text-tertiary-60',
    neon: 'neon-purple',
    border: 'border-tertiary-50',
    borderSoft: 'border-tertiary-50/20 hover:border-tertiary-50/40',
    borderMedium: 'border-tertiary-50/25 hover:border-tertiary-50/70',
    tag: 'bg-tertiary-50/10 text-tertiary-50',
  },
};
