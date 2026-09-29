'use client';

import { useEffect } from 'react';
import { LocaleLink } from '@/components/ui/locale-link';
import { Home, RefreshCw } from 'lucide-react';
import { StatusPage } from '@/components/layout/status-page';
import { Button, buttonClass } from '@/components/ui/button';
import { useDictionary } from '@/i18n/provider';

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  const { t } = useDictionary();
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <StatusPage code="500" title={t.error.title} description={t.error.description}>
      <Button onClick={reset}>
        <RefreshCw className="size-4" />
        {t.error.tryAgain}
      </Button>
      <LocaleLink href="/" className={buttonClass({ variant: 'secondary' })}>
        <Home className="size-4" />
        {t.error.goHome}
      </LocaleLink>
    </StatusPage>
  );
}
