'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { m, AnimatePresence } from 'framer-motion';
import {
  Check,
  Copy,
  CornerDownLeft,
  Download,
  Mail,
  Monitor,
  Moon,
  Search,
  Sun,
  type LucideIcon,
} from 'lucide-react';
import { useTheme } from '@/components/reusable/theme-provider';
import { SocialIcon } from '@/components/reusable/social-icon';
import { useCopyToClipboard } from '@/lib/use-copy-to-clipboard';
import { CV_DATA } from '@/lib/cv-data';
import { NAV_LINKS, RESUME_PDF_PATH } from '@/lib/site';
import { localePath } from '@/i18n/config';
import { useLocale } from '@/i18n/use-locale';
import { useDictionary } from '@/i18n/provider';
import { fmt } from '@/i18n/dictionary';
import { cn } from '@/lib/cn';

type CommandItem = {
  id: string;
  label: string;
  hint?: string;
  icon: LucideIcon | (({ className }: { className?: string }) => React.ReactNode);
  active?: boolean;
  keepOpen?: boolean;
  run: () => void;
};

type CommandGroup = { heading: string; items: CommandItem[] };

const GithubIcon = ({ className }: { className?: string }) => (
  <SocialIcon icon="github" className={className} />
);
const LinkedinIcon = ({ className }: { className?: string }) => (
  <SocialIcon icon="linkedin" className={className} />
);

function openExternal(url: string) {
  window.open(url, '_blank', 'noopener,noreferrer');
}

export function CommandMenu({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  // Mounting the palette only while open gives every opening fresh query/selection state.
  return <AnimatePresence>{isOpen && <CommandPalette onClose={onClose} />}</AnimatePresence>;
}

function CommandPalette({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const locale = useLocale();
  const { t } = useDictionary();
  const { preference, setPreference } = useTheme();
  const { status: copyStatus, copy } = useCopyToClipboard();
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);

  const groups = useMemo<CommandGroup[]>(
    () => [
      {
        heading: t.command.navigate,
        items: NAV_LINKS.map((link) => ({
          id: `nav-${link.href}`,
          label: t.nav[link.id].label,
          hint: link.href,
          icon: link.icon,
          run: () => router.push(localePath(locale, link.href)),
        })),
      },
      {
        heading: t.command.actions,
        items: [
          {
            id: 'download-resume',
            label: t.command.downloadResume,
            icon: Download,
            run: () => {
              const anchor = document.createElement('a');
              anchor.href = RESUME_PDF_PATH;
              anchor.download = '';
              anchor.click();
            },
          },
          {
            id: 'copy-email',
            label: copyStatus === 'copied' ? t.command.emailCopied : t.command.copyEmail,
            hint: CV_DATA.email,
            icon: copyStatus === 'copied' ? Check : Copy,
            keepOpen: true,
            run: () => void copy(CV_DATA.email),
          },
          {
            id: 'send-email',
            label: t.command.sendEmail,
            icon: Mail,
            run: () => {
              window.location.href = `mailto:${CV_DATA.email}`;
            },
          },
        ],
      },
      {
        heading: t.command.theme,
        items: (
          [
            { value: 'light', icon: Sun },
            { value: 'dark', icon: Moon },
            { value: 'system', icon: Monitor },
          ] as const
        ).map(({ value, icon }) => ({
          id: `theme-${value}`,
          label: fmt(t.command.themeItem, { name: t.theme[value] }),
          icon,
          active: preference === value,
          keepOpen: true,
          run: () => setPreference(value),
        })),
      },
      {
        heading: t.command.elsewhere,
        items: [
          {
            id: 'github',
            label: 'GitHub',
            icon: GithubIcon,
            run: () => openExternal(CV_DATA.github),
          },
          {
            id: 'linkedin',
            label: 'LinkedIn',
            icon: LinkedinIcon,
            run: () => openExternal(CV_DATA.linkedin),
          },
        ],
      },
    ],
    [router, locale, t, preference, setPreference, copy, copyStatus]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return groups;
    return groups
      .map((group) => ({
        ...group,
        items: group.items.filter((item) =>
          `${item.label} ${item.hint ?? ''} ${group.heading}`.toLowerCase().includes(q)
        ),
      }))
      .filter((group) => group.items.length > 0);
  }, [groups, query]);

  const flatItems = useMemo(() => filtered.flatMap((group) => group.items), [filtered]);
  const indexOf = useMemo(
    () => new Map(flatItems.map((item, index) => [item.id, index])),
    [flatItems]
  );

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  useEffect(() => {
    listRef.current
      ?.querySelector<HTMLElement>(`[data-index="${activeIndex}"]`)
      ?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex]);

  const runItem = (item: CommandItem) => {
    item.run();
    if (!item.keepOpen) onClose();
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      onClose();
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((i) => (flatItems.length ? (i + 1) % flatItems.length : 0));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((i) => (flatItems.length ? (i - 1 + flatItems.length) % flatItems.length : 0));
    } else if (event.key === 'Enter') {
      event.preventDefault();
      const item = flatItems[activeIndex];
      if (item) runItem(item);
    }
  };

  return (
    <div
      className="fixed inset-0 z-60 flex items-start justify-center px-4 pt-[14vh]"
      onKeyDown={handleKeyDown}
    >
      <m.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-overlay backdrop-blur-sm"
      />

      <m.div
        role="dialog"
        aria-modal="true"
        aria-label={t.command.dialog}
        initial={{ opacity: 0, scale: 0.97, y: -8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97, y: -8 }}
        transition={{ duration: 0.18 }}
        className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-line-strong bg-elevated text-fg shadow-pop"
      >
        <div className="flex items-center gap-3 border-b border-line px-4">
          <Search className="size-4 shrink-0 text-fg-subtle" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setActiveIndex(0);
            }}
            placeholder={t.command.placeholder}
            aria-label={t.command.search}
            role="combobox"
            aria-expanded="true"
            aria-controls="command-list"
            aria-activedescendant={flatItems[activeIndex]?.id}
            className="h-12 w-full bg-transparent text-base text-fg placeholder:text-fg-subtle focus:outline-none sm:text-sm"
          />
          <kbd className="rounded border border-line bg-surface-2 px-1.5 py-0.5 font-mono text-[10px] text-fg-subtle">
            ESC
          </kbd>
        </div>

        <div
          ref={listRef}
          id="command-list"
          role="listbox"
          className="max-h-[min(60vh,22rem)] overflow-y-auto p-2"
        >
          {flatItems.length === 0 ? (
            <p className="py-10 text-center text-sm text-fg-subtle">
              {fmt(t.command.noResults, { query })}
            </p>
          ) : (
            filtered.map((group) => (
              <div key={group.heading} role="group" aria-label={group.heading} className="mb-1">
                <p className="px-3 pt-2 pb-1 font-mono text-[10px] font-semibold tracking-wider text-fg-subtle uppercase">
                  {group.heading}
                </p>
                {group.items.map((item) => {
                  const index = indexOf.get(item.id) ?? -1;
                  const selected = index === activeIndex;
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      id={item.id}
                      type="button"
                      role="option"
                      aria-selected={selected}
                      data-index={index}
                      onMouseMove={() => setActiveIndex(index)}
                      onClick={() => runItem(item)}
                      className={cn(
                        'flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-start text-sm transition-colors',
                        selected ? 'bg-primary/10 text-fg' : 'text-fg-muted'
                      )}
                    >
                      <Icon
                        className={cn('size-4 shrink-0', selected ? 'text-primary-text' : '')}
                      />
                      <span className="flex-1 truncate font-medium">{item.label}</span>
                      {item.hint && (
                        <span className="hidden truncate font-mono text-[11px] text-fg-subtle sm:inline">
                          {item.hint}
                        </span>
                      )}
                      {item.active && <Check className="size-4 text-primary-text" />}
                      {selected && !item.active && (
                        <CornerDownLeft className="size-3.5 text-fg-subtle" />
                      )}
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>

        <div className="flex items-center justify-between border-t border-line bg-surface-2/60 px-4 py-2 font-mono text-[10px] text-fg-subtle">
          <span>{t.command.hintNavigate}</span>
          <span>{t.command.hintToggle}</span>
        </div>
      </m.div>
    </div>
  );
}
