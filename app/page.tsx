"use client";

import { Book } from "@/lib/types";
import { addBook, getBooks } from "../lib/db";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { useEffect, useState } from "react";
import { Tab } from "@mui/material";


export default function Home() {

  const [books, setBooks] = useState<Book[]>([]);

  useEffect(() => {
    async function fetchBooks() {
      const fetchedBooks = await getBooks();
      setBooks(fetchedBooks);
    }
    fetchBooks();
  }, []);

  const addDocument = async (e: React.FormEvent<HTMLFormElement>) => {

    e.preventDefault();
    console.log("Adding document...");


    const formData = new FormData(e.target as HTMLFormElement);
    const bookName = formData.get('bookName');

    try {
      const docRef = await addBook({
        id: "",
        title: bookName,
        datePublished: "",
        dateAdded: new Date().toISOString(),
        authors: [],
        genres: [],
        description: "",
        coverImageUrl: "",
        pageCount: 0
      });

      console.log("Document written with ID: ", docRef);
      
      // Refresh the book list after adding a new book
      const fetchedBooks = await getBooks();
      setBooks(fetchedBooks);
      
      // Clear the form
      (e.target as HTMLFormElement).reset();
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  };

  return (
    <div>
      <p>Hi There!</p>

      <form onSubmit={(e) => addDocument(e)}>

        <TextField name="bookName"></TextField>

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
