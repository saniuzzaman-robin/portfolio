'use client';

import { useEffect } from 'react';
import Link from 'next/link';

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    // Log to error reporting service in production
    console.error(error);
  }, [error]);

  return (
    <main className="min-h-dvh flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <p className="font-space-grotesk text-xs uppercase tracking-widest neon-green mb-4">
          Error
        </p>
        <h1 className="font-space-grotesk text-5xl font-bold mb-4">
          <span className="neon-cyan">Something</span> went wrong
        </h1>
        <p className="text-neutral-70 text-sm mb-10">
          An unexpected error occurred. Try again or return home.
        </p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={reset}
            className="btn-neon-cyan px-6 py-3 font-space-grotesk text-sm uppercase tracking-widest"
          >
            Try again
          </button>
          <Link
            href="/"
            className="px-6 py-3 border border-white/10 text-neutral-60 hover:text-white font-space-grotesk text-sm uppercase tracking-widest transition-colors duration-200"
          >
            Go home
          </Link>
        </div>
      </div>
    </main>
  );
}
