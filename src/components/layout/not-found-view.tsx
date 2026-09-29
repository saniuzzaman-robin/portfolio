'use client';

import { ArrowLeft, FolderGit2 } from 'lucide-react';
import { StatusPage } from '@/components/layout/status-page';
import { buttonClass } from '@/components/ui/button';
import { LocaleLink } from '@/components/ui/locale-link';
import { useDictionary } from '@/i18n/provider';

/** Client so it can read the locale: `not-found.tsx` receives no route params. */
export function NotFoundView() {
  const { t } = useDictionary();
  return (
    <StatusPage code="404" title={t.notFound.title} description={t.notFound.description}>
      <LocaleLink href="/" className={buttonClass()}>
        <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5 rtl:-scale-x-100 rtl:group-hover:translate-x-0.5" />
        {t.notFound.backHome}
      </LocaleLink>
      <LocaleLink href="/projects" className={buttonClass({ variant: 'secondary' })}>
        <FolderGit2 className="size-4" />
        {t.notFound.browse}
      </LocaleLink>
    </StatusPage>
  );
}
