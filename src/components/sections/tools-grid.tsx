'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { DEV_TOOLS } from '@/lib/data/tools';
import { av, ava } from '@/lib/accent';
import { Search, X, Star } from 'lucide-react';
import { useFavoriteTools } from '@/hooks/use-favorite-tools';

export function ToolsGrid() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const { favorites, toggleFavorite, isFavorite, isLoaded } = useFavoriteTools();

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    DEV_TOOLS.forEach((tool) => tool.tags.forEach((tag) => tags.add(tag)));
    return Array.from(tags).sort();
  }, []);

  const filteredTools = useMemo(() => {
    return DEV_TOOLS.filter((tool) => {
      const matchesSearch =
        searchQuery === '' ||
        tool.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesTag = !selectedTag || tool.tags.includes(selectedTag);
      const matchesFavorites = !showFavoritesOnly || favorites.includes(tool.id);

      return matchesSearch && matchesTag && matchesFavorites;
    });
  }, [searchQuery, selectedTag, showFavoritesOnly, favorites]);

  return (
    <>
      {/* Section Header */}
      <div className="mb-10">
        <h2 className="text-midnight-950 mb-3 text-2xl font-bold md:text-3xl">
          All Developer Tools
        </h2>
        <p className="text-midnight-500 max-w-3xl text-sm leading-relaxed md:text-base">
          Browse our complete collection of {DEV_TOOLS.length} free, open-source developer
          utilities. Each tool processes your data locally in the browser — no server uploads, no
          tracking, complete privacy.
        </p>
      </div>

      {/* Search and Filter */}
      <div className="mb-10 space-y-4">
        {/* Search bar */}
        <div className="relative">
          <Search className="text-midnight-500 pointer-events-none absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, description, or tag..."
            className="input w-full px-10! py-4 md:text-base"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-midnight-400 hover:text-midnight-700 absolute top-1/2 right-4 -translate-y-1/2 transition-colors"
              aria-label="Clear search"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Tag filter */}
        <div>
          <p className="text-midnight-500 mb-3 text-xs font-medium tracking-wider uppercase">
            Filter by Category
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => {
                setSelectedTag(null);
                setShowFavoritesOnly(false);
              }}
              className={`cursor-pointer rounded-full px-4 py-2 text-[10px] font-bold tracking-widest uppercase transition-all ${
                !selectedTag && !showFavoritesOnly
                  ? 'bg-aurora-green text-midnight-950 shadow-lg'
                  : 'glass text-midnight-500 hover:text-midnight-950'
              }`}
            >
              All Tools
            </button>
            {isLoaded && favorites.length > 0 && (
              <button
                onClick={() => {
                  setShowFavoritesOnly(!showFavoritesOnly);
                  setSelectedTag(null);
                }}
                className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-[10px] font-bold tracking-widest uppercase transition-all ${
                  showFavoritesOnly
                    ? 'text-midnight-950 bg-yellow-500 shadow-lg'
                    : 'glass text-midnight-500 hover:text-midnight-900'
                }`}
              >
                <Star className="h-3 w-3" fill={showFavoritesOnly ? 'currentColor' : 'none'} />
                Favorites ({favorites.length})
              </button>
            )}
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => {
                  setSelectedTag(tag === selectedTag ? null : tag);
                  setShowFavoritesOnly(false);
                }}
                className={`cursor-pointer rounded-full px-4 py-2 text-[10px] font-bold tracking-widest uppercase transition-all ${
                  selectedTag === tag
                    ? 'bg-aurora-green text-midnight-950 shadow-lg'
                    : 'glass text-midnight-500 hover:text-midnight-950'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Results count */}
        <div className="glass flex items-center justify-between rounded-2xl px-5 py-3">
          <p className="text-midnight-950 text-sm font-medium">
            <span className="text-aurora-green font-bold">{filteredTools.length}</span>{' '}
            {filteredTools.length === 1 ? 'tool' : 'tools'}
            {(searchQuery || selectedTag || showFavoritesOnly) && ' found'}
          </p>
          {(searchQuery || selectedTag || showFavoritesOnly) && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedTag(null);
                setShowFavoritesOnly(false);
              }}
              className="text-midnight-500 hover:text-aurora-green text-xs font-medium transition-colors"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Tools grid */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {filteredTools.length === 0 ? (
          <div className="col-span-full py-20 text-center">
            <div className="glass mx-auto max-w-md rounded-2xl p-8">
              <p className="text-midnight-950 mb-2 text-lg font-semibold">No tools found</p>
              <p className="text-midnight-500 mb-4 text-sm">
                Try adjusting your search or filter criteria
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedTag(null);
                  setShowFavoritesOnly(false);
                }}
                className="btn-primary mx-auto rounded-full px-6 py-2 text-sm font-semibold"
              >
                View All Tools
              </button>
            </div>
          </div>
        ) : (
          filteredTools.map((tool) => {
            const Icon = tool.icon;
            const accent = av(tool.accent);
            const accentA = (a: number) => ava(tool.accent, a);
            return (
              <Link key={tool.id} href={tool.href} className="group block">
                <div
                  className="glass relative flex h-full overflow-hidden rounded-2xl transition-all duration-400 hover:scale-[1.03] hover:shadow-xl"
                  style={{ borderLeft: `3px solid ${accent}` }}
                >
                  <div className="relative flex flex-1 flex-col overflow-hidden p-6">
                    {/* Favorite star */}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        toggleFavorite(tool.id);
                      }}
                      className="text-midnight-500 absolute top-4 right-4 z-20 transition-all hover:scale-110 hover:text-yellow-500"
                      aria-label={
                        isFavorite(tool.id) ? 'Remove from favorites' : 'Add to favorites'
                      }
                    >
                      <Star
                        className="h-4 w-4"
                        fill={isFavorite(tool.id) ? 'currentColor' : 'none'}
                        strokeWidth={1.5}
                      />
                    </button>

                    {/* Icon */}
                    <div
                      className="relative z-10 mb-5 flex h-11 w-11 items-center justify-center rounded-xl transition-all duration-300 group-hover:scale-110 group-hover:rotate-3"
                      style={{ background: accentA(0.1) }}
                    >
                      <Icon className="h-5 w-5" style={{ color: accent }} strokeWidth={1.8} />
                    </div>

                    {/* Title */}
                    <h2 className="text-midnight-950 group-hover:text-aurora-green relative z-10 mb-1 text-lg font-bold transition-colors">
                      {tool.title}
                    </h2>
                    <p
                      className="relative z-10 mb-4 text-[10px] font-bold tracking-widest uppercase"
                      style={{ color: accent }}
                    >
                      {tool.subtitle}
                    </p>
                    <p className="text-midnight-950 relative z-10 mb-5 flex-1 text-sm leading-relaxed">
                      {tool.description}
                    </p>

                    {/* Tags */}
                    <div className="relative z-10 flex flex-wrap gap-1.5">
                      {tool.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full px-2 py-1 text-[9px] font-bold tracking-wide uppercase"
                          style={{
                            color: accent,
                            background: accentA(0.08),
                            border: `1px solid ${accentA(0.2)}`,
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                      {tool.tags.length > 3 && (
                        <span
                          className="rounded-full px-2 py-1 text-[9px] font-bold tracking-wide uppercase"
                          style={{
                            color: accentA(0.7),
                            background: accentA(0.05),
                            border: `1px solid ${accentA(0.12)}`,
                          }}
                        >
                          +{tool.tags.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })
        )}
      </div>
    </>
  );
}
