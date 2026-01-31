import { useState } from 'react';
import { Book, BookFormData } from '@/lib/types';
import { addBook, updateBook, addBookToCollection, removeBookFromCollection, getBooksForUserCollection } from '@/lib/db';
import { useAuth } from '@/lib/authContext';

export function useBooks() {
  const { user } = useAuth();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBooks = async () => {
    if (!user?.uid) return;
    
    setLoading(true);
    setError(null);
    try {
      const fetchedBooks = await getBooksForUserCollection(user.uid);
      setBooks(fetchedBooks);
    } catch (err) {
      setError('Failed to fetch books');
      console.error('Error fetching books:', err);
    } finally {
      setLoading(false);
    }
  };

  const createBook = async (bookData: BookFormData) => {
    if (!user?.uid) throw new Error('User not authenticated');
    
    setError(null);
    try {
      const bookId = await addBook(bookData as Omit<Book, 'id'>);
      await addBookToCollection(user.uid, bookId);
      await fetchBooks(); // Refresh the list
    } catch (err) {
      setError('Failed to add book');
      throw err;
    }
  };

  const addExistingBookToCollection = async (bookId: string) => {
    if (!user?.uid) throw new Error('User not authenticated');

    setError(null);
    try {
      await addBookToCollection(user.uid, bookId);
      await fetchBooks();
    } catch (err) {
      setError('Failed to add book to collection');
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
      if (!user?.uid) throw new Error('User not authenticated');
      await removeBookFromCollection(user.uid, id);
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
    addExistingBookToCollection,
    updateBook: updateBookData,
    deleteBook: removeBook,
  };
}