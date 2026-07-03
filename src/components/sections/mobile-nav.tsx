'use client';

import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import type { NavItem, SimpleLink, GroupLink } from '@/components/sections/navigation';
import { MobileNavItem } from '@/components/sections/mobile-nav-item';
import { MobileNavMenu } from '@/components/sections/mobile-nav-menu';
import { MobileNavList } from '@/components/sections/mobile-nav-list';

const mobileDrawerVariants = {
  hidden: { x: '100%', transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] as const } },
  visible: {
    x: 0,
    transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] as const },
  },
};

interface MobileNavProps {
  isMenuOpen: boolean;
  onClose: () => void;
  navItems: NavItem[];
  isActive: (href: string) => boolean;
  isGroupActive: (children: { href: string }[]) => boolean;
}

export function MobileNav({
  isMenuOpen,
  onClose,
  navItems,
  isActive,
  isGroupActive,
}: MobileNavProps) {
  const mobileTopLinks = navItems.filter((i) => i.kind === 'link') as SimpleLink[];
  const exploreGroup = navItems.find(
    (i) => i.kind === 'group' && i.label === 'Explore'
  ) as GroupLink;
  const toolsGroup = navItems.find((i) => i.kind === 'group' && i.label === 'Tools') as GroupLink;

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-md lg:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            variants={mobileDrawerVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="bg-midnight-50 border-midnight-200 fixed top-0 right-0 z-50 flex h-dvh w-80 flex-col border-l lg:hidden"
          >
            <div className="via-aurora-green/30 h-px w-full bg-linear-to-r from-transparent to-transparent" />

            <div className="flex items-center justify-between px-6 py-5">
              <div>
                <Link
                  href="/"
                  onClick={onClose}
                  className="font-heading text-lg font-bold tracking-wide"
                >
                  Md. Saniuzzaman Robin
                </Link>
                <p className="text-midnight-500 text-sm">Software Engineer</p>
              </div>
            </div>

            <div className="from-midnight-200 via-midnight-200 mx-6 mb-3 h-px bg-linear-to-r to-transparent" />

            <MobileNavList>
              {mobileTopLinks.slice(0, 1).map((link) => (
                <MobileNavItem
                  key={link.href}
                  href={link.href}
                  label={link.label}
                  icon={link.icon}
                  active={isActive(link.href)}
                  onClick={onClose}
                />
              ))}

              <MobileNavMenu
                label={exploreGroup.label}
                icon={exploreGroup.icon}
                items={exploreGroup.children}
                isItemActive={isActive}
                isGroupActive={isGroupActive}
                closeDrawer={onClose}
              />

              {mobileTopLinks.slice(1, 3).map((link) => (
                <MobileNavItem
                  key={link.href}
                  href={link.href}
                  label={link.label}
                  icon={link.icon}
                  active={isActive(link.href)}
                  onClick={onClose}
                />
              ))}

              <MobileNavMenu
                label={toolsGroup.label}
                icon={toolsGroup.icon}
                items={toolsGroup.children}
                isItemActive={isActive}
                isGroupActive={isGroupActive}
                closeDrawer={onClose}
              />

              {mobileTopLinks.slice(3).map((link) => (
                <MobileNavItem
                  key={link.href}
                  href={link.href}
                  label={link.label}
                  icon={link.icon}
                  active={isActive(link.href)}
                  onClick={onClose}
                />
              ))}
            </MobileNavList>

            <div className="px-6 pt-3 pb-6">
              <div className="from-midnight-200 via-midnight-200 mb-4 h-px bg-linear-to-r to-transparent" />
              <div className="flex items-center gap-2">
                <span className="bg-aurora-green h-2.5 w-2.5 animate-pulse rounded-full shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
                <span className="text-aurora-green text-sm font-medium">Open to opportunities</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
