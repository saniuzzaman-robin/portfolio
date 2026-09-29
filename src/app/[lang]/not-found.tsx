import type { Metadata } from 'next';
import { NotFoundView } from '@/components/layout/not-found-view';

export const metadata: Metadata = {
  title: 'Page not found',
  robots: { index: false, follow: true },
};

export default function NotFoundPage() {
  return <NotFoundView />;
}
