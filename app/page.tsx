"use client";

import { Book } from "@/lib/types";
import { addBook, getBooks, getAuthorNames } from "../lib/db";
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
import { useEffect, useState } from "react";

export default function Home() {

  const [books, setBooks] = useState<Book[]>([]);
  const [authors, setAuthors] = useState<string[]>([]);
  const [selectedAuthors, setSelectedAuthors] = useState<string[]>([]);

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

  const addDocument = async (e: React.FormEvent<HTMLFormElement>) => {

    e.preventDefault();
    console.log("Adding document...");


    const formData = new FormData(e.target as HTMLFormElement);
    const bookName = formData.get('bookName');
    const datePublished = formData.get('datePublished');

    if (!bookName) {

    }

    try {
      const docRef = await addBook({
        id: "",
        title: bookName,
        datePublished: datePublished as string,
        dateAdded: new Date().toISOString(),
        authors: selectedAuthors,
        genres: [],
        description: "",
        coverImageUrl: "",
        pageCount: 0
      });
      
      // Refresh the data after adding a new book
      const [fetchedBooks, fetchedAuthors] = await Promise.all([
        getBooks(),
        getAuthorNames()
      ]);
      
      setBooks(fetchedBooks);
      setAuthors(fetchedAuthors);
      
      // Clear the form
      (e.target as HTMLFormElement).reset();
      setSelectedAuthors([]);
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  };

  return (
    <div>
      <p>Hi There!</p>

      <form onSubmit={(e) => addDocument(e)}>
        <TextField 
          name="bookName" 
          label="Book Title" 
          fullWidth 
          margin="normal"
          required
        />

        <TextField name="datePublished" 
          label="Date Published" fullWidth margin="normal" type="date" 
          InputLabelProps={{ shrink: true }} />
        
        <Autocomplete
          multiple
          freeSolo
          options={authors}
          value={selectedAuthors}
          onChange={(event, newValue) => {
            setSelectedAuthors(newValue);
          }}
          renderValue={(value, getTagProps) =>
            value.map((option, index) => {
              let tagProps = getTagProps({ index });
              return <Chip variant="outlined" label={option} {...tagProps} />;
            })
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
          sx={{ mb: 2 }}
        />

        <Button type="submit" variant="contained">Add</Button>
      </form>

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Date Added</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {books.map((book) => (
              <TableRow key={book.id}>
                <TableCell>{book.title}</TableCell>
                <TableCell>{book.dateAdded}</TableCell>
                <TableCell><Button variant="contained" size="small">Edit</Button></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}
