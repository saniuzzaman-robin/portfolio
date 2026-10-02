'use client';

import { ArrowUp } from 'lucide-react';

/**
 * Scrolls to the top without writing `#main-content` into the URL: a lingering hash makes every
 * reload re-anchor to <main> while the page's enter transform is still offset, drifting the
 * scroll position a few pixels per reload.
 */
export function BackToTop({ label }: { label: string }) {
  return (
    <a
      href="#main-content"
      onClick={(event) => {
        event.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }}
      className="group inline-flex items-center gap-1.5 py-2 transition-colors hover:text-fg"
    >
      {label}
      <ArrowUp className="size-3 transition-transform duration-300 group-hover:-translate-y-0.5" />
    </a>
  );
}
