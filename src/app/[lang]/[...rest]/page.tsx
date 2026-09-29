import { notFound } from 'next/navigation';

/** Unmatched paths: renders `[lang]/not-found.tsx` inside the locale's root layout. */
export default function CatchAll() {
  notFound();
}
