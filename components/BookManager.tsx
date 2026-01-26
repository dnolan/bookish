import React, { useState, useEffect } from 'react';
import { Button } from '@mui/material';
import { Book } from '@/lib/types';
import { BookTable } from '@/components/BookTable';
import { BookDialog } from '@/components/BookDialog';
import { useBooks } from '@/hooks/useBooks';
import { useAuthors } from '@/hooks/useAuthors';

export function BookManager() {
  const { books, loading: booksLoading, createBook, updateBook, deleteBook, fetchBooks } = useBooks();
  const { authors, fetchAuthors } = useAuthors();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentBook, setCurrentBook] = useState<Book | null>(null);

  useEffect(() => {
    fetchBooks();
    fetchAuthors();
  }, []);

  const handleOpenAddDialog = () => {
    setCurrentBook(null);
    setDialogOpen(true);
  };

  const handleOpenEditDialog = (book: Book) => {
    setCurrentBook(book);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setCurrentBook(null);
  };

  const handleSubmit = async (bookData: any) => {
    if (currentBook) {
      await updateBook(currentBook.id, bookData);
    } else {
      await createBook(bookData);
    }
    await fetchAuthors(); // Refresh authors list
  };

  const handleDelete = async (book: Book) => {
    await deleteBook(book.id);
    await fetchAuthors(); // Refresh authors list
  };

  return (
    <div>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '20px' 
      }}>
        <h1>My Book Library</h1>
        <Button variant="contained" onClick={handleOpenAddDialog}>
          Add Book
        </Button>
      </div>

      <BookTable 
        books={books}
        onEdit={handleOpenEditDialog}
        onDelete={handleDelete}
        loading={booksLoading}
      />

      <BookDialog
        open={dialogOpen}
        book={currentBook}
        authors={authors}
        onClose={handleCloseDialog}
        onSubmit={handleSubmit}
      />
    </div>
  );
}