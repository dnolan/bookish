import { useState, useEffect } from 'react';
import { Button, AppBar, Toolbar, Typography, Box } from '@mui/material';
import { Book, BookDialogSubmit, BookFormData } from '@/lib/types';
import { BookTable } from '@/components/BookTable';
import { BookDialog } from '@/components/BookDialog';
import { useBooks } from '@/hooks/useBooks';
import { useAuthors } from '@/hooks/useAuthors';
import { useGenres } from '@/hooks/useGenres';
import { useAuth } from '@/lib/authContext';

export function BookManager() {
  const { user, logout } = useAuth();
  const { books, loading: booksLoading, createBook, addExistingBookToCollection, updateBook, deleteBook, fetchBooks } = useBooks();
  const { authors, fetchAuthors } = useAuthors();
  const { genres, fetchGenres } = useGenres();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentBook, setCurrentBook] = useState<Book | null>(null);

  useEffect(() => {
    if (user?.uid) {
      fetchBooks();
      fetchAuthors();
      fetchGenres();
    }
  }, [user?.uid]);

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

  const handleSubmit = async (submission: BookDialogSubmit) => {
    if ('existingBookId' in submission) {
      await addExistingBookToCollection(submission.existingBookId, submission.rating);
    } else if (currentBook) {
      await updateBook(currentBook.id, submission as BookFormData);
    } else {
      await createBook(submission as BookFormData);
    }
    await fetchAuthors(); // Refresh authors list
    await fetchGenres(); // Refresh genres list
  };

  const handleDelete = async (book: Book) => {
    await deleteBook(book.id);
    await fetchAuthors(); // Refresh authors list
    await fetchGenres(); // Refresh genres list
  };

  return (
    <div>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Bookish
          </Typography>
          <Button color="inherit" onClick={logout}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Box sx={{ p: 3 }}>
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
          genres={genres}
          onClose={handleCloseDialog}
          onSubmit={handleSubmit}
        />
      </Box>
    </div>
  );
}