'use client';

import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';

type MobileNavLinkProps = {
  href: string;
  label: string;
  icon: LucideIcon;
  active: boolean;
  onClick: () => void;
  delay?: number;
};

export function MobileNavLink({
  href,
  label,
  icon: Icon,
  active,
  onClick,
  delay = 0,
}: MobileNavLinkProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`font-poppins group relative flex items-center gap-4 overflow-hidden rounded-sm px-4 py-3.5 text-xs tracking-widest uppercase transition-all duration-200 lg:text-sm ${
        active
          ? 'text-primary-50 bg-primary-50/8'
          : 'text-midnight-700 hover:text-midnight-100 hover:bg-white/5'
      }`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <span
        className={`absolute top-0 bottom-0 left-0 w-0.5 rounded-r transition-all duration-200 ${
          active ? 'bg-primary-50' : 'bg-primary-50/0 group-hover:bg-white/20'
        }`}
      />
      <span
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-sm transition-all duration-200 ${
          active
            ? 'bg-primary-50/15 text-primary-50'
            : 'text-midnight-500 group-hover:text-midnight-950 bg-white/5 group-hover:bg-white/8'
        }`}
      >
        <Icon className="h-3.5 w-3.5" />
      </span>
      <span className="flex-1">{label}</span>
    </Link>
  );
}
