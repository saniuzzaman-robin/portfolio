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
    <main className="flex min-h-dvh items-center justify-center px-6">
      <div className="max-w-md text-center">
        <p className="font-space-grotesk neon-green mb-4 text-xs tracking-widest uppercase lg:text-sm">
          Error
        </p>
        <h1 className="font-space-grotesk mb-4 text-5xl font-bold">
          <span className="neon-cyan">Something</span> went wrong
        </h1>
        <p className="text-neutral-70 mb-10 text-sm">
          An unexpected error occurred. Try again or return home.
        </p>
        <div className="flex justify-center gap-4">
          <button
            onClick={reset}
            className="btn-neon-cyan font-space-grotesk px-6 py-3 text-sm tracking-widest uppercase"
          >
            Try again
          </button>
          <Link
            href="/"
            className="text-neutral-60 font-space-grotesk border border-white/10 px-6 py-3 text-sm tracking-widest uppercase transition-colors duration-200 hover:text-white"
          >
            Go home
          </Link>
        </div>
      </div>
    </main>
  );
}
