import Link from 'next/link';

export default function NotFoundPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center px-6">
      <div className="max-w-md text-center">
        <p className="mb-4 text-xs tracking-widest uppercase text-aurora-green lg:text-sm">
          404
        </p>
        <h1 className="mb-4 text-5xl font-bold text-midnight-950">
          <span className="gradient-text">Page</span> not found
        </h1>
        <p className="mb-10 text-sm text-midnight-500">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          href="/"
          className="btn-primary inline-block rounded-full px-6 py-3 text-sm tracking-widest uppercase"
        >
          Go home
        </Link>
      </div>
    </main>
  );
}
