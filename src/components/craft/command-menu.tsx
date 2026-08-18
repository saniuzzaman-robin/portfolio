'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  FileText,
  FolderGit2,
  Download,
  Mail,
  Globe,
  Share2,
  Sun,
  Moon,
  X,
  ArrowRight,
} from 'lucide-react';
import { useTheme } from '@/components/reusable/theme-provider';
import { CV_DATA } from '@/lib/cv-data';

interface CommandMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CommandMenu({ isOpen, onClose }: CommandMenuProps) {
  const router = useRouter();
  const { toggleTheme, isDark } = useTheme();
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const items = [
    {
      group: 'Quick Navigation',
      options: [
        {
          label: 'Overview // Home',
          icon: FileText,
          action: () => {
            router.push('/');
            onClose();
          },
        },
        {
          label: 'Experience & Career Timeline',
          icon: FileText,
          action: () => {
            router.push('/resume');
            onClose();
          },
        },
        {
          label: 'Selected Production Platforms',
          icon: FolderGit2,
          action: () => {
            router.push('/projects');
            onClose();
          },
        },
      ],
    },
    {
      group: 'Direct Actions',
      options: [
        {
          label: 'Download Resume PDF',
          icon: Download,
          action: () => {
            window.open('/CV_SANIUZZAMAN_ROBIN.pdf', '_blank');
            onClose();
          },
        },
        {
          label: `Send Email to ${CV_DATA.name}`,
          icon: Mail,
          action: () => {
            window.open(`mailto:${CV_DATA.email}`, '_self');
            onClose();
          },
        },
        {
          label: 'Toggle Dark / Light Theme',
          icon: isDark ? Sun : Moon,
          action: () => {
            toggleTheme();
            onClose();
          },
        },
      ],
    },
    {
      group: 'Profiles & Links',
      options: [
        {
          label: 'GitHub Profile',
          icon: Globe,
          action: () => {
            window.open(CV_DATA.github, '_blank');
            onClose();
          },
        },
        {
          label: 'LinkedIn Profile',
          icon: Share2,
          action: () => {
            window.open(CV_DATA.linkedin, '_blank');
            onClose();
          },
        },
      ],
    },
  ];

  const filteredGroups = items
    .map((group) => ({
      ...group,
      options: group.options.filter((opt) => opt.label.toLowerCase().includes(query.toLowerCase())),
    }))
    .filter((group) => group.options.length > 0);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-24">
          {/* Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
          />

          {/* Modal Container with solid high-contrast backgrounds in both light and dark modes */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -8 }}
            transition={{ duration: 0.18 }}
            className="relative z-10 w-full max-w-lg overflow-hidden rounded-2xl border border-(--border-hover) bg-(--modal-bg) text-(--text-main) shadow-2xl"
          >
            {/* Search Input Bar */}
            <div className="flex items-center gap-3 border-b border-(--border-subtle) bg-(--surface-2) px-4 py-3.5">
              <Search className="h-4 w-4 shrink-0 text-indigo-500" />
              <input
                type="text"
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search pages, actions, or links..."
                className="w-full bg-transparent font-sans text-sm font-medium text-(--text-main) placeholder-(--text-muted) focus:outline-none"
              />
              <button
                onClick={onClose}
                className="cursor-pointer rounded-md p-1 text-(--text-muted) transition-colors hover:text-(--text-main)"
                aria-label="Close modal"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Results */}
            <div className="max-h-80 space-y-3 overflow-y-auto bg-(--modal-bg) p-2">
              {filteredGroups.length === 0 ? (
                <div className="py-8 text-center text-xs text-(--text-muted)">
                  No matching results found
                </div>
              ) : (
                filteredGroups.map((group) => (
                  <div key={group.group}>
                    <p className="px-3 py-1 font-mono text-[10px] font-bold tracking-wider text-(--text-muted) uppercase">
                      {group.group}
                    </p>
                    <div className="mt-1 space-y-0.5">
                      {group.options.map((opt) => {
                        const Icon = opt.icon;
                        return (
                          <button
                            key={opt.label}
                            onClick={opt.action}
                            className="group flex w-full cursor-pointer items-center justify-between rounded-xl px-3 py-2.5 text-left text-xs font-semibold text-(--text-main) transition-colors hover:bg-(--surface-2)"
                          >
                            <div className="flex items-center gap-3">
                              <Icon className="h-4 w-4 shrink-0 text-indigo-500" />
                              <span>{opt.label}</span>
                            </div>
                            <ArrowRight className="h-3 w-3 text-indigo-500 opacity-0 transition-opacity group-hover:opacity-100" />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer Tip */}
            <div className="flex items-center justify-between border-t border-(--border-subtle) bg-(--surface-2) px-4 py-2.5 font-mono text-[10px] text-(--text-muted)">
              <span>Select item to jump</span>
              <kbd className="rounded border border-(--border-subtle) bg-(--surface-1) px-1.5 py-0.5 text-[9px]">
                ESC to close
              </kbd>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
