import { useState, useCallback, useEffect } from 'react';

const FAVORITES_KEY = 'turfbook_favorites';

/**
 * Manage a persistent list of favorite turf IDs stored in localStorage.
 *
 * @returns {{favorites: Array<string|number>, toggleFavorite: function(turfId: string|number): void, isFavorite: function(turfId: string|number): boolean, addFavorite: function(turfId: string|number): void, removeFavorite: function(turfId: string|number): void, clear: function(): void, count: number}} Object containing the current favorites array, helper functions to read and modify it, and the current favorites count.
 */
export function useFavorites() {
  const [favorites, setFavorites] = useState(() => {
    // Initialize state from localStorage on component mount
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(FAVORITES_KEY);
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch (err) {
          console.error('Error loading favorites:', err);
        }
      }
    }
    return [];
  });

  // Save favorites to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  }, [favorites]);

  const toggleFavorite = useCallback((turfId) => {
    setFavorites(prev => {
      if (prev.includes(turfId)) {
        return prev.filter(id => id !== turfId);
      } else {
        return [...prev, turfId];
      }
    });
  }, []);

  const isFavorite = useCallback((turfId) => {
    return favorites.includes(turfId);
  }, [favorites]);

  const addFavorite = useCallback((turfId) => {
    setFavorites(prev => prev.includes(turfId) ? prev : [...prev, turfId]);
  }, []);

  const removeFavorite = useCallback((turfId) => {
    setFavorites(prev => prev.filter(id => id !== turfId));
  }, []);

  const clear = useCallback(() => {
    setFavorites([]);
  }, []);

  return {
    favorites,
    toggleFavorite,
    isFavorite,
    addFavorite,
    removeFavorite,
    clear,
    count: favorites.length
  };
}
