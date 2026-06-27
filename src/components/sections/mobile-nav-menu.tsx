'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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

const subItemsVariants = {
  hidden: { height: 0, opacity: 0 },
  visible: {
    height: 'auto',
    opacity: 1,
    transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] as const },
  },
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

  return (
    <div className="flex flex-col">
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        className={`group flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
          groupActive
            ? 'bg-aurora-green/10 text-aurora-green'
            : 'text-midnight-500 hover:bg-midnight-100/5'
        }`}
      >
        <span
          className={`absolute top-1 bottom-1 left-0 w-0.5 rounded-r transition-all duration-200 ${
            groupActive ? 'bg-aurora-green' : 'bg-transparent group-hover:bg-midnight-300/30'
          }`}
        />
        <span
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-all duration-200 ${
            groupActive
              ? 'bg-aurora-green/15 text-aurora-green'
              : 'bg-midnight-100/5 text-midnight-500 group-hover:bg-midnight-100/10 group-hover:text-midnight-700'
          }`}
        >
          <Icon className="h-4 w-4" />
        </span>
        <span className="flex-1 text-left">{label}</span>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="h-4 w-4 text-midnight-500" />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            variants={subItemsVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="overflow-y-auto"
            style={{ maxHeight: '40vh' }}
          >
            <div className="ml-4 mt-1 flex flex-col gap-0.5 border-l border-midnight-200 pl-2">
              {items.map((item) => (
                <MobileNavItem
                  key={item.href}
                  href={item.href}
                  label={item.label}
                  icon={item.icon}
                  active={isItemActive(item.href)}
                  onClick={closeDrawer}
                  nested
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
