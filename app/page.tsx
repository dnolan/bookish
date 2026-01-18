"use client";

import { initializeApp } from "firebase/app";
import { firebaseConfig } from "../lib/firebase.jsx";
import { getFirestore, collection, addDoc } from "firebase/firestore";



import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";


export default function Home() {

  const addDocument = async () => {

    console.log("Adding document...");
    const app = initializeApp(await firebaseConfig());
    const db = getFirestore(app);

    const bookName = (document.getElementById("bookName") as HTMLInputElement).value;
    console.log("Book Name: ", bookName);

    try {
      const docRef = await addDoc(collection(db, "books"), {
        bookName: bookName
      });

      console.log("Document written with ID: ", docRef.id);
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  };

  return (
    <div>
      <p>Hi There!</p>

      <TextField id="bookName"></TextField>

      <Button onClick={() => addDocument()} variant="contained">Add</Button>
    </div>
  );
}
