'use client';

import { useEffect } from 'react';

export function AdSenseLoader() {
  useEffect(() => {
    // Load AdSense script dynamically on client side to avoid hydration issues
    const script = document.createElement('script');
    script.async = true;
    script.src =
      'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6258584982158882';
    script.crossOrigin = 'anonymous';
    document.head.appendChild(script);
  }, []);

  return null;
}
