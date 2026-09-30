'use client';

import { cn } from '@/lib/cn';

/** Surface card whose border glow follows the pointer (see `.spotlight` in globals.css). */
export function SpotlightCard({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty('--x', `${event.clientX - rect.left}px`);
    event.currentTarget.style.setProperty('--y', `${event.clientY - rect.top}px`);
  };

  return (
    <div
      onPointerMove={handlePointerMove}
      className={cn(
        'spotlight rounded-ss-3xl rounded-se-lg rounded-ee-3xl rounded-es-lg border border-line bg-surface shadow-card transition-[border-color,translate] duration-300 ease-out-expo hover:-translate-y-1 hover:border-line-strong',
        className
      )}
    >
      {children}
    </div>
  );
}
