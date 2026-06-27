'use client';

import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';

type MobileNavItemProps = {
  href: string;
  label: string;
  icon: LucideIcon;
  active: boolean;
  onClick: () => void;
  nested?: boolean;
};

export function MobileNavItem({
  href,
  label,
  icon: Icon,
  active,
  onClick,
  nested = false,
}: MobileNavItemProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`group relative flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
        nested ? 'pl-11' : ''
      } ${
        active
          ? 'bg-aurora-green/10 text-aurora-green'
          : 'text-midnight-500 hover:bg-midnight-100/5'
      }`}
    >
      {!nested && (
        <span
          className={`absolute top-1 bottom-1 left-0 w-0.5 rounded-r transition-all duration-200 ${
            active ? 'bg-aurora-green' : 'bg-transparent group-hover:bg-midnight-300/30'
          }`}
        />
      )}
      <span
        className={`flex shrink-0 items-center justify-center rounded-lg transition-all duration-200 ${
          nested ? 'h-7 w-7' : 'h-8 w-8'
        } ${
          active
            ? 'bg-aurora-green/15 text-aurora-green'
            : 'bg-midnight-100/5 text-midnight-500 group-hover:bg-midnight-100/10 group-hover:text-midnight-700'
        }`}
      >
        <Icon className={`${nested ? 'h-3.5 w-3.5' : 'h-4 w-4'}`} />
      </span>
      <span className="flex-1">{label}</span>
    </Link>
  );
}
