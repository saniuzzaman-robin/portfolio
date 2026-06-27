'use client';

import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import { ChevronDown } from 'lucide-react';

type MobileNavGroupProps = {
  label: string;
  icon: LucideIcon;
  children: { label: string; href: string; icon: LucideIcon }[];
  isOpen: boolean;
  isActive: boolean;
  isItemActive: (href: string) => boolean;
  onToggle: () => void;
  closeDrawer: () => void;
};

export function MobileNavGroup({
  label,
  icon: Icon,
  children,
  isOpen,
  isActive,
  isItemActive,
  onToggle,
  closeDrawer,
}: MobileNavGroupProps) {
  return (
    <div className="overflow-hidden rounded-sm border border-white/5">
      <button
        onClick={onToggle}
        aria-expanded={isOpen}
        className={`font-poppins group relative flex w-full items-center gap-4 px-4 py-3.5 text-xs tracking-widest uppercase transition-all duration-200 lg:text-sm ${
          isActive
            ? 'text-primary-50 bg-primary-50/8'
            : 'text-midnight-700 hover:text-midnight-100 hover:bg-white/5'
        }`}
      >
        <span
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-sm transition-all duration-200 ${
            isActive
              ? 'bg-primary-50/15 text-primary-50'
              : 'text-midnight-500 group-hover:text-midnight-950 bg-white/5 group-hover:bg-white/8'
          }`}
        >
          <Icon className="h-3.5 w-3.5" />
        </span>
        <span className="flex-1 text-left">{label}</span>
        <ChevronDown
          className={`h-3.5 w-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      <div
        className={`overflow-hidden transition-all duration-300 ${
          isOpen ? 'max-h-[calc(100dvh-16rem)] py-2' : 'max-h-0'
        }`}
      >
        <div className="space-y-1 px-2">
          {children.map((child) => {
            const active = isItemActive(child.href);
            const ChildIcon = child.icon;
            return (
              <Link
                key={child.href}
                href={child.href}
                onClick={closeDrawer}
                className={`font-poppins group relative flex items-center gap-4 rounded-sm px-4 py-3 text-xs tracking-widest uppercase transition-all duration-200 lg:text-sm ${
                  active
                    ? 'text-primary-50 bg-primary-50/8'
                    : 'text-midnight-500 hover:text-midnight-100 hover:bg-white/5'
                }`}
              >
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-sm transition-all duration-200 ${
                    active
                      ? 'bg-primary-50/15 text-primary-50'
                      : 'group-hover:text-midnight-950 text-midnight-50 bg-white/5 group-hover:bg-white/8'
                  }`}
                >
                  <ChildIcon className="h-3 w-3" />
                </span>
                <span className="flex-1">{child.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
