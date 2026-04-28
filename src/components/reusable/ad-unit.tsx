'use client';

import { useEffect, useRef } from 'react';

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

interface AdUnitProps {
  slot: string;
  format?: 'auto' | 'horizontal' | 'rectangle' | 'vertical';
  className?: string;
}

export function AdUnit({ slot, format = 'auto', className = '' }: AdUnitProps) {
  const pushed = useRef(false);

  useEffect(() => {
    if (pushed.current) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      pushed.current = true;
    } catch {
      // AdSense not available (e.g. adblocker, dev mode)
    }
  }, []);

  return (
    <div
      className={`relative ${className}`}
      // Prevent clicks on the ad container from propagating to the game/page
      onPointerDown={(e) => e.stopPropagation()}
    >
      <p className="text-center text-[9px] text-neutral-50 uppercase tracking-widest mb-0.5 font-space-grotesk pointer-events-none select-none">
        Advertisement
      </p>
      <ins
        className="adsbygoogle block"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-6258584982158882"
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
}
