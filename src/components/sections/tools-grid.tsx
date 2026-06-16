'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import type { CSSProperties } from 'react';
import { DEV_TOOLS } from '@/lib/data/tools';
import { av, ava } from '@/lib/accent';
import { Search, X, Star } from 'lucide-react';
import { useFavoriteTools } from '@/hooks/use-favorite-tools';

export function ToolsGrid() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const { favorites, toggleFavorite, isFavorite, isLoaded } = useFavoriteTools();

  // Get all unique tags
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    DEV_TOOLS.forEach((tool) => tool.tags.forEach((tag) => tags.add(tag)));
    return Array.from(tags).sort();
  }, []);

  // Filter tools based on search and tag
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
        <h2 className="font-poppins text-neutral-90 mb-3 text-2xl font-bold md:text-3xl">
          All Developer Tools
        </h2>
        <p className="text-neutral-60 max-w-3xl text-sm leading-relaxed md:text-base">
          Browse our complete collection of {DEV_TOOLS.length} free, open-source developer
          utilities. Each tool processes your data locally in the browser — no server uploads, no
          tracking, complete privacy.
        </p>
      </div>

      {/* Search and Filter */}
      <div className="mb-10 space-y-4">
        {/* Search bar */}
        <div className="relative">
          <Search className="text-neutral-60 pointer-events-none absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, description, or tag..."
            className="bg-neutral-10 border-neutral-20 text-neutral-90 placeholder:text-neutral-60 focus:border-primary-50/50 focus:ring-primary-50/20 w-full rounded-sm border py-4 pr-12 pl-12 text-sm shadow-sm transition-all focus:ring-2 focus:outline-none md:text-base"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-neutral-60 hover:text-neutral-90 absolute top-1/2 right-4 -translate-y-1/2 transition-colors"
              aria-label="Clear search"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Tag filter */}
        <div>
          <p className="text-neutral-70 mb-3 text-xs font-medium tracking-wider uppercase">
            Filter by Category
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => {
                setSelectedTag(null);
                setShowFavoritesOnly(false);
              }}
              className={`font-poppins rounded-sm px-4 py-2 text-[10px] font-bold tracking-widest uppercase transition-all ${
                !selectedTag && !showFavoritesOnly
                  ? 'bg-primary-50 text-black shadow-lg'
                  : 'bg-neutral-10 text-neutral-60 hover:text-neutral-90 border border-white/10 hover:border-white/20'
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
                className={`font-poppins flex items-center gap-1.5 rounded-sm px-4 py-2 text-[10px] font-bold tracking-widest uppercase transition-all ${
                  showFavoritesOnly
                    ? 'bg-yellow-500 text-black shadow-lg'
                    : 'bg-neutral-10 text-neutral-60 hover:text-neutral-90 border border-white/10 hover:border-white/20'
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
                className={`font-poppins rounded-sm px-4 py-2 text-[10px] font-bold tracking-widest uppercase transition-all ${
                  selectedTag === tag
                    ? 'bg-primary-50 text-black shadow-lg'
                    : 'bg-neutral-10 text-neutral-60 hover:text-neutral-90 border border-white/10 hover:border-white/20'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Results count */}
        <div className="glass flex items-center justify-between rounded-sm border border-white/8 px-5 py-3">
          <p className="text-neutral-70 text-sm font-medium">
            <span className="text-primary-50 font-bold">{filteredTools.length}</span>{' '}
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
              className="text-neutral-60 hover:text-primary-50 text-xs font-medium transition-colors"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Tools grid */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {filteredTools.length === 0 ? (
          <div className="text-neutral-60 col-span-full py-20 text-center">
            <div className="glass mx-auto max-w-md rounded-sm border border-white/8 p-8">
              <p className="text-neutral-90 mb-2 text-lg font-semibold">No tools found</p>
              <p className="text-neutral-60 mb-4 text-sm">
                Try adjusting your search or filter criteria
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedTag(null);
                  setShowFavoritesOnly(false);
                }}
                className="bg-primary-50 hover:bg-primary-60 mx-auto rounded-sm px-6 py-2 text-sm font-semibold text-black transition-colors"
              >
                View All Tools
              </button>
            </div>
          </div>
        ) : (
          filteredTools.map((tool, index) => {
            const Icon = tool.icon;
            const accent = av(tool.accent);
            const accentA = (a: number) => ava(tool.accent, a);
            return (
              <Link key={tool.id} href={tool.href} className="group block">
                <div
                  className="glass card-shine animate-scale-in relative flex h-full overflow-hidden rounded-sm border-(--tb) transition-all duration-400 hover:scale-[1.03] hover:border-(--tb-h) hover:shadow-(--ts)"
                  style={
                    {
                      '--tb': accentA(0.16),
                      '--tb-h': accentA(0.5),
                      '--ts': `0 4px 24px ${accentA(0.16)}`,
                      animationDelay: `${index * 40}ms`,
                      animationFillMode: 'both',
                    } as CSSProperties
                  }
                >
                  {/* Left bookmark bar */}
                  <div
                    className="w-0.5 shrink-0 transition-all duration-300 group-hover:w-1.5"
                    style={{
                      background: `linear-gradient(to bottom, ${accent}, ${accentA(0.2)})`,
                    }}
                  />

                  <div className="relative flex flex-1 flex-col overflow-hidden p-6">
                    {/* Holographic hover */}
                    <div className="holographic pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                    {/* Favorite star */}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        toggleFavorite(tool.id);
                      }}
                      className="text-neutral-60 absolute top-4 right-4 z-20 transition-all hover:scale-110 hover:text-yellow-500"
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
                      className="relative z-10 mb-5 flex h-11 w-11 items-center justify-center rounded-sm border transition-all duration-300 group-hover:scale-110 group-hover:rotate-3"
                      style={{
                        borderColor: accentA(0.35),
                        background: accentA(0.1),
                        color: accent,
                      }}
                    >
                      <Icon className="h-5 w-5" strokeWidth={1.8} />
                    </div>

                    {/* Title */}
                    <h2 className="font-poppins text-neutral-90 relative z-10 mb-1 text-lg font-bold transition-colors group-hover:text-neutral-100">
                      {tool.title}
                    </h2>
                    <p
                      className="font-poppins relative z-10 mb-4 text-[10px] font-bold tracking-widest uppercase"
                      style={{ color: accent }}
                    >
                      {tool.subtitle}
                    </p>
                    <p className="text-neutral-60 relative z-10 mb-5 flex-1 text-sm leading-relaxed">
                      {tool.description}
                    </p>

                    {/* Tags */}
                    <div className="relative z-10 flex flex-wrap gap-1.5">
                      {tool.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="font-poppins rounded-sm px-2 py-1 text-[9px] font-bold tracking-wide uppercase"
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
                          className="font-poppins rounded-sm px-2 py-1 text-[9px] font-bold tracking-wide uppercase"
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

                  {/* Bottom sweep */}
                  <div
                    className="absolute bottom-0 left-0 h-0.5 w-0 transition-all duration-700 group-hover:w-full"
                    style={{
                      background: `linear-gradient(to right, ${accent}, ${accentA(0.3)}, transparent)`,
                    }}
                  />
                </div>
              </Link>
            );
          })
        )}
      </div>
    </>
  );
}
