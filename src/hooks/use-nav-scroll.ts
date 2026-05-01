import { useEffect, useState } from 'react';

/**
 * Returns whether the page has been scrolled past the given threshold (px).
 * Attaches a passive scroll listener on mount and cleans up on unmount.
 */
export function useNavScroll(threshold = 20): boolean {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > threshold);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [threshold]);

  return scrolled;
}
