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
      className={`font-poppins min-h-fit group relative flex items-center gap-4 overflow-hidden rounded-sm px-4 py-3.5 text-xs tracking-widest uppercase transition-all duration-200 lg:text-sm ${
        nested ? 'pl-12' : ''
      } ${
        active
          ? 'text-primary-50 bg-primary-50/8'
          : 'text-neutral-70 hover:bg-white/5 hover:text-neutral-100'
      }`}
    >
      {!nested && (
        <span
          className={`absolute top-0 bottom-0 left-0 w-0.5 rounded-r transition-all duration-200 ${
            active ? 'bg-primary-50' : 'bg-primary-50/0 group-hover:bg-white/20'
          }`}
        />
      )}
      <span
        className={`flex ${nested ? 'h-6 w-6' : 'h-7 w-7'} shrink-0 items-center justify-center rounded-sm transition-all duration-200 ${
          active
            ? 'bg-primary-50/15 text-primary-50'
            : 'text-neutral-60 group-hover:text-neutral-90 bg-white/5 group-hover:bg-white/8'
        }`}
      >
        <Icon className={`${nested ? 'h-3 w-3' : 'h-3.5 w-3.5'}`} />
      </span>
      <span className="flex-1">{label}</span>
    </Link>
  );
}
