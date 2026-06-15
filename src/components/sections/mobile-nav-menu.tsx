'use client';

import { useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import { ChevronDown } from 'lucide-react';
import { MobileNavItem } from './mobile-nav-item';

export type NavMenuItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

type MobileNavMenuProps = {
  label: string;
  icon: LucideIcon;
  items: NavMenuItem[];
  isItemActive: (href: string) => boolean;
  isGroupActive: (items: NavMenuItem[]) => boolean;
  closeDrawer: () => void;
};

export function MobileNavMenu({
  label,
  icon: Icon,
  items,
  isItemActive,
  isGroupActive,
  closeDrawer,
}: MobileNavMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const groupActive = isGroupActive(items);

  const handleItemClick = () => {
    closeDrawer();
  };

  return (
    <div className="flex min-h-fit flex-col overflow-hidden">
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        className={`font-poppins group relative flex w-full items-center gap-4 rounded-sm px-4 py-3.5 text-xs tracking-widest uppercase transition-all duration-200 lg:text-sm ${
          groupActive
            ? 'text-primary-50 bg-primary-50/8'
            : 'text-neutral-70 hover:bg-white/5 hover:text-neutral-100'
        }`}
      >
        <span
          className={`absolute top-0 bottom-0 left-0 w-0.5 rounded-r transition-all duration-200 ${
            groupActive ? 'bg-primary-50' : 'bg-primary-50/0 group-hover:bg-white/20'
          }`}
        />
        <span
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-sm transition-all duration-200 ${
            groupActive
              ? 'bg-primary-50/15 text-primary-50'
              : 'text-neutral-60 group-hover:text-neutral-90 bg-white/5 group-hover:bg-white/8'
          }`}
        >
          <Icon className="h-3.5 w-3.5" />
        </span>
        <span className="flex-1 text-left">{label}</span>
        <ChevronDown
          className={`h-3.5 w-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Nested items container */}
      <div
        className={`transition-all duration-200 ${isOpen ? 'overflow-y-auto' : 'max-h-0 overflow-hidden'}`}
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        <div className="my-1 flex flex-col gap-1 border-l border-white/5 pl-2">
          {items.map((item) => (
            <MobileNavItem
              key={item.href}
              href={item.href}
              label={item.label}
              icon={item.icon}
              active={isItemActive(item.href)}
              onClick={handleItemClick}
              nested
            />
          ))}
        </div>
      </div>
    </div>
  );
}
