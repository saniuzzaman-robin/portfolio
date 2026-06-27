export type AccentToken = 'primary' | 'secondary' | 'tertiary';

const ACCENT_VAR: Record<AccentToken, string> = {
  primary: 'var(--color-primary-40)',
  secondary: 'var(--color-secondary-50)',
  tertiary: 'var(--color-tertiary-40)',
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
    border: string;
    borderSoft: string;
    borderMedium: string;
    tag: string;
  }
> = {
  primary: {
    text: 'text-aurora-green',
    textHover: 'hover:text-aurora-green-light',
    border: 'border-aurora-green',
    borderSoft: 'border-aurora-green/20 hover:border-aurora-green/40',
    borderMedium: 'border-aurora-green/25 hover:border-aurora-green/70',
    tag: 'bg-aurora-green/10 text-aurora-green',
  },
  secondary: {
    text: 'text-aurora-purple',
    textHover: 'hover:text-aurora-purple-light',
    border: 'border-aurora-purple',
    borderSoft: 'border-aurora-purple/20 hover:border-aurora-purple/40',
    borderMedium: 'border-aurora-purple/25 hover:border-aurora-purple/70',
    tag: 'bg-aurora-purple/10 text-aurora-purple',
  },
  tertiary: {
    text: 'text-aurora-pink',
    textHover: 'hover:text-aurora-pink-light',
    border: 'border-aurora-pink',
    borderSoft: 'border-aurora-pink/20 hover:border-aurora-pink/40',
    borderMedium: 'border-aurora-pink/25 hover:border-aurora-pink/70',
    tag: 'bg-aurora-pink/10 text-aurora-pink',
  },
};
