import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';

/**
 * React hook that manages the list of turfs and related loading/error state backed by Supabase.
 *
 * Exposes current turf data and utilities to update or reload it.
 *
 * @returns {{turfs: any[], setTurfs: function, loading: boolean, error: string|null, fetchTurfs: function}} An object containing:
 *  - `turfs`: the current array of turf records.
 *  - `setTurfs`: setter to replace the `turfs` array.
 *  - `loading`: `true` while a fetch is in progress, otherwise `false`.
 *  - `error`: a user-facing error message when a fetch has failed, or `null`.
 *  - `fetchTurfs`: function that fetches turfs from Supabase and updates `turfs`, `loading`, and `error`.
 */
export function useTurfs() {
  const [turfs, setTurfs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTurfs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase.from('turfs').select('*');
      if (err) throw err;
      setTurfs(data || []);
    } catch (err) {
      console.error('Error fetching turfs:', err);
      if (err.message === 'Failed to fetch') {
        setError('Could not connect to Supabase. Please check your internet connection or Supabase project status.');
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    turfs,
    setTurfs,
    loading,
    error,
    fetchTurfs
  };
}
