import Link from 'next/link';

export default function NotFoundPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center px-6">
      <div className="max-w-md text-center">
        <p className="font-poppins neon-green mb-4 text-xs tracking-widest uppercase lg:text-sm">
          404
        </p>
        <h1 className="font-poppins mb-4 text-5xl font-bold">
          <span className="neon-cyan">Page</span> not found
        </h1>
        <p className="text-neutral-70 mb-10 text-sm">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          href="/"
          className="btn-neon font-poppins inline-block px-6 py-3 text-sm tracking-widest uppercase"
        >
          Go home
        </Link>
      </div>
    </main>
  );
}
