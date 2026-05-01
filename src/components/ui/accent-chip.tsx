/**
 * AccentChip
 *
 * A `terminal-text` styled badge whose colour is driven by an AccentToken.
 * Used for tags, difficulty labels, duration badges, etc. across multiple sections.
 */

import { av, ava, type AccentToken } from '@/lib/accent';

interface AccentChipProps {
  accent: AccentToken;
  className?: string;
  children: React.ReactNode;
}

export function AccentChip({ accent, className = '', children }: AccentChipProps) {
  return (
    <span
      className={`terminal-text text-xs ${className}`}
      style={{
        color: av(accent),
        borderColor: ava(accent, 0.25),
        background: ava(accent, 0.06),
      }}
    >
      {children}
    </span>
  );
}
