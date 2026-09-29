'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Home, RefreshCw } from 'lucide-react';
import { StatusPage } from '@/components/layout/status-page';
import { Button, buttonClass } from '@/components/ui/button';

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <StatusPage
      code="500"
      title="Something went wrong."
      description="An unexpected error occurred while rendering this page. Try again, or head back home."
    >
      <Button onClick={reset}>
        <RefreshCw className="size-4" />
        Try again
      </Button>
      <Link href="/" className={buttonClass({ variant: 'secondary' })}>
        <Home className="size-4" />
        Go home
      </Link>
    </StatusPage>
  );
}
