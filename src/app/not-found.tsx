import Link from 'next/link';
import { Home } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <main className="relative flex min-h-dvh items-center justify-center overflow-hidden px-6 py-20">
      <div className="ambient-glow top-1/2 left-1/2 h-[25rem] w-[25rem] -translate-x-1/2 -translate-y-1/2 bg-indigo-600/15" />

      <div className="surface-card relative z-10 max-w-md rounded-3xl p-10 text-center border border-(--border-subtle) shadow-2xl space-y-4">
        <p className="font-mono text-xs font-bold tracking-widest uppercase text-indigo-400">
          404 ERROR
        </p>
        <h1 className="font-heading text-4xl sm:text-5xl font-extrabold text-(--text-main) tracking-tight">
          Page <span className="gradient-brand">Not Found</span>
        </h1>
        <p className="text-xs sm:text-sm leading-relaxed text-(--text-secondary)">
          The requested system node or page is unavailable or has been relocated.
        </p>
        <div className="pt-4 flex justify-center">
          <Link href="/" className="btn-primary gap-2 text-xs">
            <Home className="h-4 w-4" />
            <span>Return to Studio</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
