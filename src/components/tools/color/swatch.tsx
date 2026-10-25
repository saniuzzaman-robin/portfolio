'use client';

import type { Color } from '@/lib/tools/color/convert';
import { formatColor } from '@/lib/tools/color/format';
import { cn } from '@/lib/cn';

/**
 * A color over the transparency checkerboard. Painted with `oklch()`, so wide-gamut colors show
 * as they are on screens that can display them (and are mapped by the browser elsewhere).
 */
export function Swatch({ color, className }: { color: Color; className?: string }) {
  return (
    <span aria-hidden className={cn('block overflow-hidden bg-checker', className)}>
      <span
        className="block size-full"
        style={{ background: formatColor(color, 'oklch', { legacy: false }) }}
      />
    </span>
  );
}
