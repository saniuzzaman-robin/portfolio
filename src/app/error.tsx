'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Home, RefreshCw, AlertTriangle } from 'lucide-react';

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="relative flex min-h-dvh items-center justify-center overflow-hidden px-6 py-20">
      <div className="ambient-glow top-1/2 left-1/2 h-[25rem] w-[25rem] -translate-x-1/2 -translate-y-1/2 bg-rose-600/15" />

      <div className="surface-card relative z-10 max-w-md rounded-3xl p-10 text-center border border-(--border-subtle) shadow-2xl space-y-4">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-500">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <p className="font-mono text-xs font-bold tracking-widest uppercase text-rose-400">
          EXCEPTION DETECTED
        </p>
        <h1 className="font-heading text-3xl font-extrabold text-(--text-main) tracking-tight">
          Something went <span className="gradient-brand">wrong</span>
        </h1>
        <p className="text-xs sm:text-sm leading-relaxed text-(--text-secondary)">
          An unexpected error occurred during execution. You can attempt to retry the operation or return home.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
          <button
            onClick={reset}
            className="btn-primary gap-2 text-xs cursor-pointer"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Retry</span>
          </button>
          <Link href="/" className="btn-secondary gap-2 text-xs">
            <Home className="h-4 w-4" />
            <span>Go Home</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
