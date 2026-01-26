import { useState } from 'react';
import { getAuthorNames } from '@/lib/db';

export function useAuthors() {
  const [authors, setAuthors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAuthors = async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchedAuthors = await getAuthorNames();
      setAuthors(fetchedAuthors);
    } catch (err) {
      setError('Failed to fetch authors');
      console.error('Error fetching authors:', err);
    } finally {
      setLoading(false);
    }
  };

  return {
    authors,
    loading,
    error,
    fetchAuthors,
  };
}