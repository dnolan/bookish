"use client";

import { Book } from "@/lib/types";
import { addBook, getBooks, getAuthorNames, updateBook } from "../lib/db";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Autocomplete from '@mui/material/Autocomplete';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import { useEffect, useState } from "react";

export default function Home() {

  const [books, setBooks] = useState<Book[]>([]);
  const [authors, setAuthors] = useState<string[]>([]);
  const [selectedAuthors, setSelectedAuthors] = useState<string[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentBook, setCurrentBook] = useState<Book | null>(null);

  useEffect(() => {
    async function fetchData() {
      const [fetchedBooks, fetchedAuthors] = await Promise.all([
        getBooks(),
        getAuthorNames()
      ]);
      setBooks(fetchedBooks);
      setAuthors(fetchedAuthors);
    }
    fetchData();
  }, []);

  const handleOpenAddDialog = () => {
    setIsEditMode(false);
    setCurrentBook(null);
    setSelectedAuthors([]);
    setDialogOpen(true);
  };

  const handleOpenEditDialog = (book: Book) => {
    setIsEditMode(true);
    setCurrentBook(book);
    setSelectedAuthors(book.authors || []);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setCurrentBook(null);
    setSelectedAuthors([]);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {

    e.preventDefault();
    console.log(isEditMode ? "Updating document..." : "Adding document...");


    const formData = new FormData(e.target as HTMLFormElement);
    const bookName = formData.get('bookName');
    const datePublished = formData.get('datePublished');

    try {
      if (isEditMode && currentBook) {
        // Update existing book
        await updateBook(currentBook.id, {
          title: bookName as string,
          datePublished: datePublished as string,
          authors: selectedAuthors,
          // Keep existing values for other fields
          dateAdded: currentBook.dateAdded,
          genres: currentBook.genres,
          description: currentBook.description,
          coverImageUrl: currentBook.coverImageUrl,
          pageCount: currentBook.pageCount
        });
        console.log("Document updated with ID: ", currentBook.id);
      } else {
        // Add new book
        const docRef = await addBook({
          id: "",
          title: bookName as string,
          datePublished: datePublished as string,
          dateAdded: new Date().toISOString(),
          authors: selectedAuthors,
          genres: [],
          description: "",
          coverImageUrl: "",
          pageCount: 0
        });
        console.log("Document added with ID: ", docRef);
      }
      
      // Refresh the data after adding a new book
      const [fetchedBooks, fetchedAuthors] = await Promise.all([
        getBooks(),
        getAuthorNames()
      ]);
      
      setBooks(fetchedBooks);
      setAuthors(fetchedAuthors);
      
      // Clear the form and close dialog
      (e.target as HTMLFormElement).reset();
      setSelectedAuthors([]);
      handleCloseDialog();
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>My Book Library</h1>
        <Button variant="contained" onClick={handleOpenAddDialog}>
          Add Book
        </Button>
      </div>

      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {isEditMode ? 'Edit Book' : 'Add New Book'}
        </DialogTitle>
        <form onSubmit={(e) => handleSubmit(e)}>
          <DialogContent>
            <TextField 
              name="bookName" 
              label="Book Title" 
              fullWidth 
              margin="normal"
              required
              defaultValue={currentBook?.title || ''}
            />

            <TextField 
              name="datePublished" 
              label="Date Published" 
              fullWidth 
              margin="normal" 
              type="date" 
              InputLabelProps={{ shrink: true }}
              defaultValue={currentBook?.datePublished || ''}
            />
            
            <Autocomplete
              multiple
              freeSolo
              options={authors}
              value={selectedAuthors}
              onChange={(event, newValue) => {
                setSelectedAuthors(newValue);
              }}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip variant="outlined" label={option} {...getTagProps({ index })} />
                ))
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Authors"
                  placeholder="Select or add authors"
                  margin="normal"
                  fullWidth
                />
              )}
              sx={{ mt: 2 }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button type="submit" variant="contained">
              {isEditMode ? 'Update' : 'Add'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Authors</TableCell>
              <TableCell>Date Added</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {books.map((book) => (
              <TableRow key={book.id}>
                <TableCell>{book.title}</TableCell>
                <TableCell>
                  {book.authors && book.authors.length > 0 ? (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      {book.authors.map((author, index) => (
                        <Chip key={index} label={author} size="small" variant="outlined" />
                      ))}
                    </div>
                  ) : (
                    <em>No authors</em>
                  )}
                </TableCell>
                <TableCell>{book.dateAdded}</TableCell>
                <TableCell>
                  <Button 
                    variant="contained" 
                    size="small" 
                    onClick={() => handleOpenEditDialog(book)}
                  >
                    Edit
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}
