import { useState } from 'react';
import { Book } from '@/lib/types';
import { addBook, updateBook, getBooks, getAuthorNames } from '@/lib/db';

export function useBooks() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBooks = async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchedBooks = await getBooks();
      setBooks(fetchedBooks);
    } catch (err) {
      setError('Failed to fetch books');
      console.error('Error fetching books:', err);
    } finally {
      setLoading(false);
    }
  };

  const createBook = async (bookData: Omit<Book, 'id'>) => {
    setError(null);
    try {
      await addBook(bookData);
      await fetchBooks(); // Refresh the list
    } catch (err) {
      setError('Failed to add book');
      throw err;
    }
  };

  const updateBookData = async (id: string, bookData: Partial<Book>) => {
    setError(null);
    try {
      await updateBook(id, bookData);
      await fetchBooks(); // Refresh the list
    } catch (err) {
      setError('Failed to update book');
      throw err;
    }
  };

  const removeBook = async (id: string) => {
    setError(null);
    try {
      const { deleteBook } = await import('@/lib/db');
      await deleteBook(id);
      await fetchBooks(); // Refresh the list
    } catch (err) {
      setError('Failed to delete book');
      throw err;
    }
  };

  return {
    books,
    loading,
    error,
    fetchBooks,
    createBook,
    updateBook: updateBookData,
    deleteBook: removeBook,
  };
}