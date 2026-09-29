import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, FolderGit2 } from 'lucide-react';
import { StatusPage } from '@/components/layout/status-page';
import { buttonClass } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Page not found',
  robots: { index: false, follow: true },
};

export default function NotFoundPage() {
  return (
    <StatusPage
      code="404"
      title="This page wandered off."
      description="The page you're looking for doesn't exist or has been moved."
    >
      <Link href="/" className={buttonClass()}>
        <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" />
        Back home
      </Link>
      <Link href="/projects" className={buttonClass({ variant: 'secondary' })}>
        <FolderGit2 className="size-4" />
        Browse platforms
      </Link>
    </StatusPage>
  );
}
