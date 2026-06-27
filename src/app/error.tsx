'use client';

import { useEffect } from 'react';
import Link from 'next/link';

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-dvh items-center justify-center px-6">
      <div className="max-w-md text-center">
        <p className="mb-4 text-xs tracking-widest uppercase text-aurora-green lg:text-sm">
          Error
        </p>
        <h1 className="mb-4 text-5xl font-bold text-midnight-950">
          <span className="gradient-text">Something</span> went wrong
        </h1>
        <p className="mb-10 text-sm text-midnight-500">
          An unexpected error occurred. Try again or return home.
        </p>
        <div className="flex justify-center gap-4">
          <button
            onClick={reset}
            className="btn-primary rounded-full px-6 py-3 text-sm tracking-widest uppercase"
          >
            Try again
          </button>
          <Link
            href="/"
            className="btn-secondary rounded-full px-6 py-3 text-sm tracking-widest uppercase"
          >
            Go home
          </Link>
        </div>
      </div>
    </main>
  );
}
