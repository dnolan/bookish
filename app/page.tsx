"use client";

import { Book } from "@/lib/types";
import { addBook, getBooks } from "../lib/db";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import { useEffect, useState } from "react";


export default function Home() {

  const [books, setBooks] = useState<Book[]>([]);

  useEffect( () => {
    async function fetchBooks() {
      const fetchedBooks = await getBooks();
      setBooks(fetchedBooks);
    }
    fetchBooks();
    console.log("Home component mounted");
  }, []);

  const addDocument = async () => {

    console.log("Adding document...");
    
    const bookName = (document.getElementById("bookName") as HTMLInputElement).value;
    console.log("Book Name: ", bookName);

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
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  };

  return (
    <div>
      <p>Hi There!</p>

      <TextField id="bookName"></TextField>

      <Button onClick={() => addDocument()} variant="contained">Add</Button>

      <ul>
        {books.map((book) => (
          <li key={book.id}>{book.id} {book.title}</li>
        ))}
      </ul>
    </div>
  );
}
