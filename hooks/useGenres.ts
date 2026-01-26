import { useState } from 'react';
import { getGenreNames } from '@/lib/db';

export function useGenres() {
  const [genres, setGenres] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchGenres = async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchedGenres = await getGenreNames();
      setGenres(fetchedGenres);
    } catch (err) {
      setError('Failed to fetch genres');
      console.error('Error fetching genres:', err);
    } finally {
      setLoading(false);
    }
  };

  return {
    genres,
    loading,
    error,
    fetchGenres,
  };
}