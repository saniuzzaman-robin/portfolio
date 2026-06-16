'use client';

import { useState } from 'react';

export function useFavoriteTools() {
  const [favorites, setFavorites] = useState<string[]>(() => {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem('favorite-tools');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return [];
      }
    }
    return [];
  });
  const isLoaded = typeof window !== 'undefined';

  const toggleFavorite = (toolId: string) => {
    setFavorites((prev) => {
      const newFavorites = prev.includes(toolId)
        ? prev.filter((id) => id !== toolId)
        : [...prev, toolId];
      localStorage.setItem('favorite-tools', JSON.stringify(newFavorites));
      return newFavorites;
    });
  };

  const isFavorite = (toolId: string) => favorites.includes(toolId);

  return { favorites, toggleFavorite, isFavorite, isLoaded };
}
