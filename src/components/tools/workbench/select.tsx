'use client';

import { Fragment, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { useToolCommon } from '@/i18n/tools/provider';
import { cn } from '@/lib/cn';

export type SelectOption<T extends string> = { value: T; label: string };
export type SelectGroup<T extends string> = { label: string; options: SelectOption<T>[] };

/** Space between the trigger and the popup (px). */
const POPUP_GAP = 4;
/** Closest the popup gets to the viewport edges (px). */
const VIEWPORT_MARGIN = 8;
/** Tallest the popup gets, even with room to spare (px). */
const MAX_POPUP_HEIGHT = 320;
/** With less room than this under the trigger, the popup opens upwards if there's more room there. */
const MIN_ROOM_BELOW = 160;
/** Keys typed within this many ms of each other form one typeahead string. */
const TYPEAHEAD_RESET_MS = 500;
/** Options PageUp/PageDown move by. */
const PAGE_STEP = 10;

type Entry<T extends string> = { option: SelectOption<T>; index: number };
type Section<T extends string> = { label?: string; entries: Entry<T>[] };

const isGroup = <T extends string>(
  item: SelectOption<T> | SelectGroup<T>
): item is SelectGroup<T> => 'options' in item;

/**
 * Select-only combobox (WAI-ARIA APG): a button that opens a listbox. Focus stays on the button
 * (`aria-activedescendant`) unless `searchable`, which adds a filter input. The popup lives in
 * the top layer (`popover`), so scrolling toolbars and transformed ancestors can't clip it.
 */
export function Select<T extends string>({
  label,
  value,
  onChange,
  options,
  id,
  title,
  searchable = false,
  className,
}: {
  /** Accessible name of the button and the listbox. */
  label: string;
  value: T;
  onChange: (value: T) => void;
  options: (SelectOption<T> | SelectGroup<T>)[];
  id?: string;
  title?: string;
  /** Adds a filter input to the popup, for long lists. */
  searchable?: boolean;
  /** Classes for the button. */
  className?: string;
}) {
  const common = useToolCommon();
  const baseId = useId();
  const listId = `${baseId}-list`;
  const optionId = (index: number) => `${baseId}-${index}`;
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [query, setQuery] = useState('');
  const rootRef = useRef<HTMLSpanElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const typed = useRef('');
  const typedTimer = useRef<number | undefined>(undefined);

  const { sections, flat } = useMemo(() => {
    const q = query.trim().toLowerCase();
    const matches = (option: SelectOption<T>) => !q || option.label.toLowerCase().includes(q);
    const flat: SelectOption<T>[] = [];
    const sections: Section<T>[] = [];
    let loose: Section<T> | null = null;
    for (const item of options) {
      if (isGroup(item)) {
        loose = null;
        const entries = item.options
          .filter(matches)
          .map((option) => ({ option, index: flat.push(option) - 1 }));
        if (entries.length > 0) sections.push({ label: item.label, entries });
      } else if (matches(item)) {
        if (!loose) sections.push((loose = { entries: [] }));
        loose.entries.push({ option: item, index: flat.push(item) - 1 });
      }
    }
    return { sections, flat };
  }, [options, query]);

  const selectedIndex = flat.findIndex((option) => option.value === value);
  const selectedLabel = useMemo(() => {
    for (const item of options) {
      for (const option of isGroup(item) ? item.options : [item]) {
        if (option.value === value) return option.label;
      }
    }
    return '';
  }, [options, value]);

  const show = (index: number, initialQuery = '') => {
    setQuery(initialQuery);
    setActiveIndex(index);
    setOpen(true);
  };

  const close = (refocus: boolean) => {
    setOpen(false);
    typed.current = '';
    if (refocus) triggerRef.current?.focus();
  };

  const commit = (index: number) => {
    const option = flat[index];
    if (option && option.value !== value) onChange(option.value);
    close(true);
  };

  /** Next option whose label starts with what was typed; repeating one letter cycles. */
  const typeahead = (key: string, from: number) => {
    window.clearTimeout(typedTimer.current);
    typedTimer.current = window.setTimeout(() => (typed.current = ''), TYPEAHEAD_RESET_MS);
    typed.current += key.toLowerCase();
    const text = typed.current;
    const cycle = [...text].every((char) => char === text[0]);
    const search = cycle ? text[0] : text;
    const start = cycle ? from + 1 : Math.max(from, 0);
    for (let step = 0; step < flat.length; step++) {
      const index = (start + step) % flat.length;
      if (flat[index].label.toLowerCase().startsWith(search)) return index;
    }
    return -1;
  };

  const isPrintable = (event: React.KeyboardEvent) =>
    event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey;

  /** Keys while the popup is open, from the button or the filter input. */
  const onOpenKeyDown = (event: React.KeyboardEvent, fromSearch: boolean) => {
    const last = flat.length - 1;
    const move = (index: number) => {
      event.preventDefault();
      setActiveIndex(Math.max(0, Math.min(last, index)));
    };
    switch (event.key) {
      case 'ArrowDown':
        return move(activeIndex + 1);
      case 'ArrowUp':
        if (event.altKey) {
          event.preventDefault();
          return commit(activeIndex);
        }
        return move(activeIndex - 1);
      case 'PageDown':
        return move(activeIndex + PAGE_STEP);
      case 'PageUp':
        return move(activeIndex - PAGE_STEP);
      case 'Home':
        return fromSearch ? undefined : move(0);
      case 'End':
        return fromSearch ? undefined : move(last);
      case 'Enter':
        event.preventDefault();
        return commit(activeIndex);
      case 'Escape':
        // Handled here, so an enclosing popover (which checks `defaultPrevented`) stays open.
        event.preventDefault();
        return close(true);
      case 'Tab':
        // The filter input disappears on close, so focus would fall back to <body>.
        if (fromSearch) event.preventDefault();
        return commit(activeIndex);
      case ' ':
        if (fromSearch) return;
        if (!typed.current) {
          event.preventDefault();
          return commit(activeIndex);
        }
    }
    if (!fromSearch && isPrintable(event)) {
      event.preventDefault();
      const index = typeahead(event.key, activeIndex);
      if (index >= 0) setActiveIndex(index);
    }
  };

  const onTriggerKeyDown = (event: React.KeyboardEvent) => {
    if (open) return onOpenKeyDown(event, false);
    const current = Math.max(selectedIndex, 0);
    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowUp':
      case 'Enter':
      case ' ':
        event.preventDefault();
        return show(current);
      case 'Home':
        event.preventDefault();
        return show(0);
      case 'End':
        event.preventDefault();
        return show(flat.length - 1);
    }
    if (isPrintable(event)) {
      event.preventDefault();
      if (searchable) return show(0, event.key);
      const index = typeahead(event.key, selectedIndex);
      show(index >= 0 ? index : current);
    }
  };

  // Show the popup in the top layer and keep it next to the button.
  useLayoutEffect(() => {
    const popup = popupRef.current;
    const trigger = triggerRef.current;
    if (!open || !popup || !trigger) return;
    if (typeof popup.showPopover === 'function' && !popup.matches(':popover-open')) {
      popup.showPopover();
    }
    const place = () => {
      const rect = trigger.getBoundingClientRect();
      const { clientWidth: width, clientHeight: height } = document.documentElement;
      const below = height - rect.bottom - POPUP_GAP - VIEWPORT_MARGIN;
      const above = rect.top - POPUP_GAP - VIEWPORT_MARGIN;
      const upwards = below < MIN_ROOM_BELOW && above > below;
      const style = popup.style;
      style.minWidth = `${rect.width}px`;
      style.maxWidth = `${width - 2 * VIEWPORT_MARGIN}px`;
      style.maxHeight = `${Math.min(MAX_POPUP_HEIGHT, upwards ? above : below)}px`;
      style.top = upwards ? 'auto' : `${rect.bottom + POPUP_GAP}px`;
      style.bottom = upwards ? `${height - rect.top + POPUP_GAP}px` : 'auto';
      // Align the inline-start edges, shifted back inside the viewport if it would overflow.
      const room = width - VIEWPORT_MARGIN - popup.offsetWidth;
      if (getComputedStyle(trigger).direction === 'rtl') {
        style.left = 'auto';
        style.right = `${Math.max(VIEWPORT_MARGIN, Math.min(width - rect.right, room))}px`;
      } else {
        style.right = 'auto';
        style.left = `${Math.max(VIEWPORT_MARGIN, Math.min(rect.left, room))}px`;
      }
    };
    const onScroll = (event: Event) => {
      if (!popup.contains(event.target as Node)) place();
    };
    place();
    searchRef.current?.focus();
    window.addEventListener('resize', place);
    document.addEventListener('scroll', onScroll, { capture: true, passive: true });
    return () => {
      window.removeEventListener('resize', place);
      document.removeEventListener('scroll', onScroll, { capture: true });
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    listRef.current
      ?.querySelector(`[data-index="${activeIndex}"]`)
      ?.scrollIntoView({ block: 'nearest' });
  }, [open, activeIndex]);

  useEffect(() => () => window.clearTimeout(typedTimer.current), []);

  const activeId = open && flat[activeIndex] ? optionId(activeIndex) : undefined;

  const renderEntry = ({ option, index }: Entry<T>) => {
    const selected = option.value === value;
    return (
      <div
        key={option.value}
        id={optionId(index)}
        role="option"
        aria-selected={selected}
        data-index={index}
        title={option.label}
        onPointerMove={() => setActiveIndex(index)}
        onClick={() => commit(index)}
        className={cn(
          'flex cursor-pointer items-center gap-1.5 rounded-md py-1.5 ps-1.5 pe-3 whitespace-nowrap pointer-coarse:py-2.5',
          index === activeIndex ? 'bg-primary/10 text-fg' : 'text-fg-muted',
          selected && 'font-semibold text-fg'
        )}
      >
        <Check
          aria-hidden
          className={cn('size-3.5 shrink-0 text-primary-text', !selected && 'invisible')}
        />
        <span className="truncate">{option.label}</span>
      </div>
    );
  };

  return (
    <span ref={rootRef} className="contents">
      <button
        ref={triggerRef}
        id={id}
        type="button"
        role="combobox"
        aria-label={label}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-activedescendant={searchable ? undefined : activeId}
        title={title}
        onClick={() => (open ? close(true) : show(Math.max(selectedIndex, 0)))}
        onKeyDown={onTriggerKeyDown}
        className={cn(
          'inline-flex cursor-pointer items-center justify-between gap-1 text-start',
          className
        )}
      >
        <span className="truncate">{selectedLabel}</span>
        <ChevronDown aria-hidden className="size-3.5 shrink-0 text-fg-subtle" />
      </button>
      {open && (
        <div
          ref={popupRef}
          popover="manual"
          className={cn(
            'fixed m-0 flex flex-col overflow-hidden rounded-lg border border-line-strong bg-elevated p-0 text-xs text-fg shadow-pop',
            searchable ? 'w-72' : 'w-max'
          )}
        >
          {searchable && (
            <input
              ref={searchRef}
              type="text"
              role="combobox"
              aria-label={common.filter}
              aria-expanded
              aria-controls={listId}
              aria-autocomplete="list"
              aria-activedescendant={activeId}
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setActiveIndex(0);
              }}
              onKeyDown={(event) => onOpenKeyDown(event, true)}
              placeholder={common.filter}
              spellCheck={false}
              autoComplete="off"
              className="h-8 shrink-0 border-b border-line bg-transparent px-2.5 text-fg outline-none placeholder:text-fg-subtle"
            />
          )}
          <div
            ref={listRef}
            id={listId}
            role="listbox"
            aria-label={label}
            // Clicking an option must not move focus off the button or the filter input.
            onMouseDown={(event) => event.preventDefault()}
            className="min-h-0 flex-1 overflow-y-auto p-1"
          >
            {sections.map((section, index) =>
              section.label ? (
                <div key={section.label} role="group" aria-labelledby={`${baseId}-group-${index}`}>
                  <div
                    id={`${baseId}-group-${index}`}
                    role="presentation"
                    className="px-2 pt-2 pb-1 font-mono text-[10px] font-semibold tracking-wider text-fg-subtle uppercase"
                  >
                    {section.label}
                  </div>
                  {section.entries.map(renderEntry)}
                </div>
              ) : (
                <Fragment key={index}>{section.entries.map(renderEntry)}</Fragment>
              )
            )}
          </div>
          {flat.length === 0 && (
            <p className="px-2.5 pb-3 text-center text-fg-subtle">{common.noMatches}</p>
          )}
        </div>
      )}
    </span>
  );
}
