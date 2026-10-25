'use client';

import { useMemo, useState } from 'react';
import { ArrowUpRight, Search } from 'lucide-react';
import { Container } from '@/components/ui/section';
import { LocaleLink } from '@/components/ui/locale-link';
import { TOOLS, toolPath, toolText, type ToolCategory } from '@/lib/data/tools';
import { useDictionary } from '@/i18n/provider';
import { fmt } from '@/i18n/dictionary';

/** Searchable tool directory, grouped by category. */
export function ToolsExplorer() {
  const { t } = useDictionary();
  const [query, setQuery] = useState('');

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    const matches = TOOLS.filter((tool) => {
      if (!q) return true;
      const text = toolText(t, tool.slug);
      return [tool.slug, text.label, text.title, text.description, ...tool.keywords]
        .join(' ')
        .toLowerCase()
        .includes(q);
    });
    const categories = Object.keys(t.tools.categories) as ToolCategory[];
    return categories
      .map((category) => ({
        category,
        tools: matches.filter((tool) => tool.category === category),
      }))
      .filter((group) => group.tools.length > 0);
  }, [query, t]);

  return (
    <section aria-label={t.tools.label} className="pb-20 sm:pb-28">
      <Container>
        <label className="relative mb-6 flex max-w-md items-center">
          <span className="sr-only">{t.tools.search}</span>
          <Search
            className="pointer-events-none absolute start-3.5 size-4 text-fg-subtle"
            aria-hidden
          />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t.tools.searchPlaceholder}
            className="h-11 w-full rounded-full border border-line bg-surface-2 ps-10 pe-4 text-sm text-fg outline-none placeholder:text-fg-subtle focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring/40"
          />
        </label>

        {/* Always mounted so screen readers announce the message when it appears. */}
        <p role="status" className="text-sm text-fg-muted">
          {groups.length === 0 && query.trim()
            ? fmt(t.tools.noResults, { query: query.trim() })
            : null}
        </p>

        {/* Categories flow down the columns so all tools fit on one desktop screen. */}
        <div className="gap-x-6 sm:columns-2 lg:columns-3 xl:columns-4">
          {groups.map(({ category, tools }) => (
            <div key={category} className="mb-6 break-inside-avoid">
              <h2 className="mb-2 font-mono text-[11px] font-medium tracking-wider text-fg-subtle uppercase">
                {t.tools.categories[category]}
              </h2>
              <ul className="space-y-2">
                {tools.map((tool) => {
                  const text = toolText(t, tool.slug);
                  const Icon = tool.icon;
                  return (
                    <li key={tool.slug}>
                      <LocaleLink
                        href={toolPath(tool.slug)}
                        title={text.description}
                        className="group flex items-center gap-3 rounded-lg border border-line bg-surface px-3 py-2 transition-colors hover:border-primary/40 hover:bg-surface-2 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                      >
                        <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary-text">
                          <Icon className="size-4" aria-hidden />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="flex items-center gap-1 font-heading text-sm font-semibold text-fg">
                            <span className="truncate">{text.label}</span>
                            <ArrowUpRight
                              className="size-3.5 shrink-0 text-fg-subtle opacity-0 transition-opacity group-hover:opacity-100 rtl:-scale-x-100"
                              aria-hidden
                            />
                          </span>
                          <span className="block truncate text-xs text-fg-muted">
                            {text.description}
                          </span>
                        </span>
                      </LocaleLink>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
