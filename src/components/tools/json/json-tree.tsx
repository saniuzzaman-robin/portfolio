'use client';

import {
  createContext,
  useContext,
  useDeferredValue,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';
import { ChevronRight, Search, TextSearch } from 'lucide-react';
import type { JsonNode } from '@/lib/tools/json/parse';
import { formatPath, type PathSegment } from '@/lib/tools/json/path';
import { primitiveText, searchTree, type TreeSearch } from '@/lib/tools/json/tree';
import { CopyButton, IconAction } from '@/components/tools/workbench/toolbar';
import { useToolMessages } from '@/i18n/tools/provider';
import { useLocale } from '@/i18n/use-locale';
import { fmt } from '@/i18n/dictionary';
import { cn } from '@/lib/cn';

/** Children rendered per container before a "Show more" row; keeps huge arrays responsive. */
const PAGE_SIZE = 200;
/** Long strings are cut in the row (the full value is in the editor). */
const PREVIEW_CHARS = 300;
const INDENT_PX = 14;

type TreeState = {
  idPrefix: string;
  search: TreeSearch | null;
  selected: string;
  isExpanded: (path: string, depth: number) => boolean;
  toggle: (path: string, open: boolean) => void;
  limitFor: (path: string) => number;
  showMore: (path: string) => void;
  select: (path: string) => void;
  reveal: (from: number, to: number) => void;
};

const TreeContext = createContext<TreeState | null>(null);

function useTree(): TreeState {
  const state = useContext(TreeContext);
  if (!state) throw new Error('Tree rows must be rendered inside <JsonTree>.');
  return state;
}

/** Element ids can't contain whitespace; encoding keeps every path's id distinct. */
const itemId = (prefix: string, path: string) => `${prefix}${encodeURIComponent(path)}`;

function ValuePreview({ node }: { node: JsonNode }) {
  if (node.type === 'object' || node.type === 'array') {
    const count = node.type === 'object' ? node.entries.length : node.items.length;
    const [open, close] = node.type === 'object' ? ['{', '}'] : ['[', ']'];
    return (
      <span className="shrink-0 text-code-punct">
        {open} <span className="text-fg-subtle">{count}</span> {close}
      </span>
    );
  }
  if (node.type === 'string') {
    const long = node.value.length > PREVIEW_CHARS;
    return (
      <span className="truncate text-code-string">
        {JSON.stringify(long ? node.value.slice(0, PREVIEW_CHARS) : node.value)}
        {long && '…'}
      </span>
    );
  }
  return <span className="truncate text-code-number">{primitiveText(node)}</span>;
}

function TreeItem({
  node,
  name,
  path,
  depth,
}: {
  node: JsonNode;
  /** Object key, array index, or null for the root. */
  name: string | number | null;
  path: PathSegment[];
  depth: number;
}) {
  const tree = useTree();
  const t = useToolMessages<'json'>();
  const locale = useLocale();
  const pathText = formatPath(path);
  const container = node.type === 'object' || node.type === 'array';
  const expanded = container && tree.isExpanded(pathText, depth);
  const id = itemId(tree.idPrefix, pathText);
  const match = tree.search?.matches.has(pathText) ?? false;

  const limit = tree.limitFor(pathText);
  // Only open containers build their child list; collapsed ones stay cheap to render.
  const children: { node: JsonNode; name: string | number }[] = !expanded
    ? []
    : node.type === 'object'
      ? node.entries.slice(0, limit).map((entry) => ({ node: entry.value, name: entry.key }))
      : node.type === 'array'
        ? node.items.slice(0, limit).map((item, index) => ({ node: item, name: index }))
        : [];
  const total =
    node.type === 'object' ? node.entries.length : node.type === 'array' ? node.items.length : 0;
  const hidden = total - limit;

  return (
    <li
      id={id}
      role="treeitem"
      aria-level={depth + 1}
      aria-expanded={container ? expanded : undefined}
      aria-selected={tree.selected === pathText}
      aria-labelledby={`${id}-label`}
      data-path={pathText}
      data-from={node.from}
      data-to={node.to}
    >
      <div
        onClick={() => tree.select(pathText)}
        onDoubleClick={() => tree.reveal(node.from, node.to)}
        style={{ paddingInlineStart: depth * INDENT_PX + 4 }}
        className={cn(
          'flex h-6 cursor-default items-center gap-1 pe-1 font-mono text-[12.5px] whitespace-nowrap',
          match && 'bg-warning/15',
          tree.selected === pathText
            ? 'bg-primary/10 group-focus-visible/tree:shadow-[inset_0_0_0_1px_var(--ring)]'
            : 'hover:bg-surface-2'
        )}
      >
        {container ? (
          <span
            aria-hidden
            onClick={(event) => {
              event.stopPropagation();
              tree.select(pathText);
              tree.toggle(pathText, !expanded);
            }}
            className="flex size-4 shrink-0 cursor-pointer items-center justify-center text-fg-subtle hover:text-fg"
          >
            <ChevronRight
              className={cn('size-3.5 transition-transform', expanded && 'rotate-90')}
            />
          </span>
        ) : (
          <span aria-hidden className="size-4 shrink-0" />
        )}
        <span id={`${id}-label`} className="flex min-w-0 flex-1 items-center gap-1.5">
          {name === null ? (
            <span className="shrink-0 text-fg-subtle">$</span>
          ) : (
            <span className="flex max-w-[60%] min-w-0 shrink-0">
              <span
                className={cn(
                  'truncate',
                  typeof name === 'number' ? 'text-fg-subtle' : 'text-code-property'
                )}
              >
                {name}
              </span>
              <span aria-hidden className="text-code-punct">
                :
              </span>
            </span>
          )}
          <ValuePreview node={node} />
        </span>
      </div>
      {expanded && total > 0 && (
        <ul role="group">
          {children.map((child, index) => (
            <TreeItem
              key={index}
              node={child.node}
              name={child.name}
              path={[...path, child.name]}
              depth={depth + 1}
            />
          ))}
          {hidden > 0 && (
            <li
              id={`${id}-more`}
              role="treeitem"
              aria-level={depth + 2}
              aria-selected={tree.selected === `${pathText}#more`}
              data-more={pathText}
            >
              <div
                onClick={() => tree.showMore(pathText)}
                style={{ paddingInlineStart: (depth + 1) * INDENT_PX + 24 }}
                className={cn(
                  'flex h-6 cursor-pointer items-center text-xs font-medium text-primary-text hover:underline',
                  tree.selected === `${pathText}#more` &&
                    'bg-primary/10 group-focus-visible/tree:shadow-[inset_0_0_0_1px_var(--ring)]'
                )}
              >
                {fmt(t.showMore, {
                  count: new Intl.NumberFormat(locale).format(Math.min(hidden, PAGE_SIZE)),
                })}
              </div>
            </li>
          )}
        </ul>
      )}
    </li>
  );
}

/**
 * Collapsible, searchable view of a parsed document. One tab stop: arrow keys move through the
 * rows (`aria-activedescendant`), Right/Left expand and collapse, Enter jumps to the node in the
 * input editor. The selected node's JSONPath can be copied or sent to the Query view.
 */
export function JsonTree({
  root,
  onReveal,
  onQuery,
  className,
}: {
  root: JsonNode;
  onReveal: (from: number, to: number) => void;
  onQuery: (path: string) => void;
  className?: string;
}) {
  const t = useToolMessages<'json'>();
  const locale = useLocale();
  const idPrefix = useId();
  const treeRef = useRef<HTMLUListElement>(null);
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query.trim());
  // Explicit open/closed choices per path; everything else follows the defaults below.
  const [overrides, setOverrides] = useState<ReadonlyMap<string, boolean>>(() => new Map());
  const [limits, setLimits] = useState<ReadonlyMap<string, number>>(() => new Map());
  const [selected, setSelected] = useState('$');

  const search = useMemo(
    () => (deferredQuery ? searchTree(root, deferredQuery) : null),
    [root, deferredQuery]
  );

  const state: TreeState = {
    idPrefix,
    search,
    selected,
    // Without a search, the root and its children start open; with one, only the way to matches.
    isExpanded: (path, depth) =>
      overrides.get(path) ?? (search ? search.ancestors.has(path) : depth < 2),
    toggle: (path, open) => setOverrides((previous) => new Map(previous).set(path, open)),
    limitFor: (path) => limits.get(path) ?? PAGE_SIZE,
    showMore: (path) =>
      setLimits((previous) =>
        new Map(previous).set(path, (previous.get(path) ?? PAGE_SIZE) + PAGE_SIZE)
      ),
    select: setSelected,
    reveal: onReveal,
  };

  const moveTo = (item: HTMLElement | null | undefined) => {
    if (!item) return;
    setSelected(item.dataset.path ?? `${item.dataset.more}#more`);
    item.firstElementChild?.scrollIntoView({ block: 'nearest' });
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLUListElement>) => {
    const tree = treeRef.current;
    if (!tree) return;
    const items = Array.from(tree.querySelectorAll<HTMLElement>('[role="treeitem"]'));
    const current = document.getElementById(
      selected.endsWith('#more')
        ? `${itemId(idPrefix, selected.slice(0, -5))}-more`
        : itemId(idPrefix, selected)
    );
    const index = current ? items.indexOf(current) : -1;
    const path = current?.dataset.path;
    switch (event.key) {
      case 'ArrowDown':
        moveTo(items[Math.min(index + 1, items.length - 1)]);
        break;
      case 'ArrowUp':
        moveTo(items[Math.max(index - 1, 0)]);
        break;
      case 'Home':
        moveTo(items[0]);
        break;
      case 'End':
        moveTo(items.at(-1));
        break;
      case 'ArrowRight':
        if (!current || !path) break;
        if (current.getAttribute('aria-expanded') === 'false') state.toggle(path, true);
        else if (current.getAttribute('aria-expanded') === 'true') moveTo(items[index + 1]);
        break;
      case 'ArrowLeft':
        if (!current) break;
        if (path && current.getAttribute('aria-expanded') === 'true') state.toggle(path, false);
        else moveTo(current.parentElement?.closest<HTMLElement>('[role="treeitem"]'));
        break;
      case 'Enter':
        if (current?.dataset.more) state.showMore(current.dataset.more);
        else if (current) onReveal(Number(current.dataset.from), Number(current.dataset.to));
        break;
      default:
        return;
    }
    event.preventDefault();
  };

  const numbers = new Intl.NumberFormat(locale);
  const activeId = selected.endsWith('#more')
    ? `${itemId(idPrefix, selected.slice(0, -5))}-more`
    : itemId(idPrefix, selected);
  const selectedPath = selected.endsWith('#more') ? selected.slice(0, -5) : selected;

  return (
    <div className={cn('flex min-h-0 flex-1 flex-col', className)}>
      <label className="flex h-8 shrink-0 items-center gap-2 border-b border-line px-2.5">
        <Search className="size-3.5 shrink-0 text-fg-subtle" aria-hidden />
        <span className="sr-only">{t.search}</span>
        <input
          type="search"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            // A new search decides what is open; earlier manual toggles would hide its matches.
            setOverrides(new Map());
          }}
          placeholder={t.search}
          spellCheck={false}
          className="min-w-0 flex-1 bg-transparent text-xs text-fg outline-none placeholder:text-fg-subtle"
        />
        {search && (
          <span
            className={cn(
              'shrink-0 text-[11px]',
              search.matches.size === 0 ? 'text-danger' : 'text-fg-subtle'
            )}
          >
            {search.matches.size === 0
              ? t.noMatches
              : fmt(search.truncated ? t.moreMatches : t.matches, {
                  count: numbers.format(search.matches.size),
                })}
          </span>
        )}
      </label>
      <TreeContext.Provider value={state}>
        <ul
          ref={treeRef}
          dir="ltr"
          role="tree"
          tabIndex={0}
          aria-label={t.treeLabel}
          aria-activedescendant={activeId}
          onKeyDown={handleKeyDown}
          className="group/tree min-h-0 flex-1 overflow-auto py-1 outline-none"
        >
          <TreeItem node={root} name={null} path={[]} depth={0} />
        </ul>
      </TreeContext.Provider>
      <div className="flex h-8 shrink-0 items-center gap-1 border-t border-line ps-2.5 pe-1">
        <code
          dir="ltr"
          title={selectedPath}
          className="min-w-0 flex-1 truncate font-mono text-[11.5px] text-fg-muted"
        >
          {selectedPath}
        </code>
        <CopyButton getText={() => selectedPath} label={t.copyPath} />
        <IconAction icon={TextSearch} label={t.queryPath} onClick={() => onQuery(selectedPath)} />
      </div>
    </div>
  );
}
