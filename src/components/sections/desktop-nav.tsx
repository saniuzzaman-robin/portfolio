'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import type { NavItem, SimpleLink, GroupLink } from '@/components/sections/navigation';

const dropdownVariants = {
  hidden: { opacity: 0, y: -8, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] as const },
  },
  exit: {
    opacity: 0,
    y: -8,
    scale: 0.96,
    transition: { duration: 0.15, ease: 'easeIn' as const },
  },
};

interface DesktopNavProps {
  navItems: NavItem[];
  isActive: (href: string) => boolean;
  isGroupActive: (children: { href: string }[]) => boolean;
}

export function DesktopNav({ navItems, isActive, isGroupActive }: DesktopNavProps) {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const dropdownRefs = useRef<Record<string, HTMLDivElement | null>>({});

  return (
    <div className="hidden items-center gap-1 lg:flex">
      {navItems.map((item) => {
        if (item.kind === 'link') {
          const active = isActive(item.href);
          return (
            <div key={item.href}>
              <Link
                href={item.href}
                className={`relative rounded-lg px-4 py-2 text-sm font-medium transition-colors duration-200 ${
                  active ? 'text-aurora-green' : 'text-midnight-500 hover:text-midnight-950'
                }`}
              >
                {item.label}
                {active && (
                  <motion.span
                    layoutId="nav-indicator"
                    className="bg-aurora-green absolute inset-x-2 -bottom-1 h-0.5 rounded-full"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
              </Link>
            </div>
          );
        }

        const groupItem = item as GroupLink;
        const groupActive = isGroupActive(groupItem.children);
        const isOpen = openDropdown === groupItem.label;
        return (
          <div key={groupItem.label}>
            <div
              className="relative"
              ref={(el) => {
                if (el) dropdownRefs.current[groupItem.label] = el;
              }}
              onMouseEnter={() => setOpenDropdown(groupItem.label)}
              onMouseLeave={() => setOpenDropdown(null)}
            >
              <button
                className={`flex cursor-pointer items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-colors duration-200 ${
                  groupActive || isOpen
                    ? 'text-aurora-green'
                    : 'text-midnight-500 hover:text-midnight-950'
                }`}
              >
                {groupItem.label}
                <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                  <ChevronDown className="h-3.5 w-3.5" />
                </motion.div>
              </button>

              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    variants={dropdownVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="absolute top-full left-1/2 -translate-x-1/2 pt-2"
                  >
                    <div
                      className={`border-midnight-200 bg-midnight-50 overflow-hidden rounded-xl border shadow-xl ${
                        groupItem.label === 'Tools' ? 'w-96' : 'min-w-48'
                      }`}
                    >
                      <div className="via-aurora-green/20 h-px w-full bg-linear-to-r from-transparent to-transparent" />
                      {groupItem.label === 'Tools' ? (
                        <>
                          {(() => {
                            const AllToolsIcon = groupItem.children[0].icon;
                            const allToolsActive = isActive(groupItem.children[0].href);
                            return (
                              <Link
                                href={groupItem.children[0].href}
                                className={`border-midnight-200 flex items-center justify-center gap-2 border-b px-4 py-3.5 text-sm font-medium transition-all duration-200 ${
                                  allToolsActive
                                    ? 'text-aurora-green bg-aurora-green/5'
                                    : 'text-midnight-500 hover:text-midnight-950 hover:bg-midnight-100'
                                }`}
                              >
                                <AllToolsIcon className="h-4 w-4 shrink-0" />
                                {groupItem.children[0].label}
                                <span className="text-midnight-500 ml-1 text-xs font-normal">
                                  ({groupItem.children.length - 1})
                                </span>
                              </Link>
                            );
                          })()}
                          <div className="grid max-h-72 grid-cols-3 gap-px overflow-auto p-1">
                            {groupItem.children.slice(1).map((child) => {
                              const active = isActive(child.href);
                              const ChildIcon = child.icon;
                              return (
                                <Link
                                  key={child.href}
                                  href={child.href}
                                  className={`flex flex-col items-center justify-center gap-1.5 rounded-lg px-2 py-3 text-xs font-medium transition-all duration-200 ${
                                    active
                                      ? 'text-aurora-green bg-aurora-green/5'
                                      : 'text-midnight-500 hover:text-midnight-950 hover:bg-midnight-100'
                                  }`}
                                >
                                  <ChildIcon className="h-3.5 w-3.5 shrink-0" />
                                  <p className="text-center">{child.label}</p>
                                </Link>
                              );
                            })}
                          </div>
                        </>
                      ) : (
                        <div className="flex flex-col p-1">
                          {groupItem.children.map((child) => {
                            const active = isActive(child.href);
                            const ChildIcon = child.icon;
                            return (
                              <Link
                                key={child.href}
                                href={child.href}
                                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                                  active
                                    ? 'text-aurora-green bg-aurora-green/5'
                                    : 'text-midnight-500 hover:text-midnight-950 hover:bg-midnight-100'
                                }`}
                              >
                                <span
                                  className={`absolute top-0 bottom-0 left-0 w-0.5 rounded-r transition-opacity duration-200 ${
                                    active
                                      ? 'bg-aurora-green opacity-100'
                                      : 'bg-midnight-300 opacity-0 group-hover:opacity-100'
                                  }`}
                                />
                                <ChildIcon className="h-3.5 w-3.5 shrink-0" />
                                {child.label}
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        );
      })}
    </div>
  );
}
