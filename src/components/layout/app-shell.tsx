'use client';

import { useCallback, useEffect, useState } from 'react';
import { LazyMotion, MotionConfig } from 'framer-motion';
import { Navbar } from '@/components/layout/navbar';
import dynamic from 'next/dynamic';

// Only needed on ⌘K: load after hydration instead of in the critical bundle.
const CommandMenu = dynamic(
  () => import('@/components/layout/command-menu').then((mod) => mod.CommandMenu),
  { ssr: false }
);

const loadMotionFeatures = () =>
  import('@/components/ui/motion-features').then((mod) => mod.default);

export function AppShell({ children }: { children: React.ReactNode }) {
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const closeCommand = useCallback(() => setIsCommandOpen(false), []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setIsCommandOpen((open) => !open);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <LazyMotion features={loadMotionFeatures} strict>
      <MotionConfig reducedMotion="user">
        <div className="flex min-h-dvh flex-col">
          <Navbar onOpenCommand={() => setIsCommandOpen(true)} />
          <CommandMenu isOpen={isCommandOpen} onClose={closeCommand} />
          <div className="flex flex-1 flex-col">{children}</div>
        </div>
      </MotionConfig>
    </LazyMotion>
  );
}
