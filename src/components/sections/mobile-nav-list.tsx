'use client';

import { useEffect, useRef, ReactNode } from 'react';

type MobileNavListProps = {
  children: ReactNode;
};

export function MobileNavList({ children }: MobileNavListProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Prevent scroll propagation from drawer to body
  useEffect(() => {
    const drawer = scrollContainerRef.current;
    if (!drawer) return;

    const handleWheel = (e: WheelEvent) => {
      const isScrollingDown = e.deltaY > 0;
      const isAtBottom = drawer.scrollHeight - drawer.scrollTop <= drawer.clientHeight + 5;
      const isAtTop = drawer.scrollTop <= 5;

      if ((isScrollingDown && isAtBottom) || (!isScrollingDown && isAtTop)) {
        e.preventDefault();
      }
    };

    drawer.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      drawer.removeEventListener('wheel', handleWheel);
    };
  }, []);

  return (
    <div
      ref={scrollContainerRef}
      className="flex flex-1 touch-pan-y flex-col gap-1 overflow-y-auto px-4"
      style={{ WebkitOverflowScrolling: 'touch' }}
    >
      {children}
    </div>
  );
}
