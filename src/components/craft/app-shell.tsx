'use client';

import { useState } from 'react';
import { Navbar } from '@/components/craft/navbar';
import { CommandMenu } from '@/components/craft/command-menu';

export function AppShell({ children }: { children: React.ReactNode }) {
  const [isCommandOpen, setIsCommandOpen] = useState(false);

  return (
    <div className="min-h-dvh flex flex-col">
      <Navbar onOpenCommand={() => setIsCommandOpen(true)} />
      <CommandMenu isOpen={isCommandOpen} onClose={() => setIsCommandOpen(false)} />
      <div className="flex-1 flex flex-col">{children}</div>
    </div>
  );
}
