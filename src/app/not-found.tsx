import Link from 'next/link';

export default function NotFoundPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <p className="font-space-grotesk text-xs uppercase tracking-widest neon-green mb-4">404</p>
        <h1 className="font-space-grotesk text-5xl font-bold mb-4">
          <span className="neon-cyan">Page</span> not found
        </h1>
        <p className="text-neutral-70 text-sm mb-10">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          href="/"
          className="btn-neon-cyan px-6 py-3 font-space-grotesk text-sm uppercase tracking-widest inline-block"
        >
          Go home
        </Link>
      </div>
    </main>
  );
}
