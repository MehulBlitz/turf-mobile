import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';

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
