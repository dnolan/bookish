
import { initializeApp } from "firebase/app";
import { firebaseConfig } from "./firebase";
import { getFirestore, collection, addDoc, getDoc, updateDoc, doc, getDocs } from "firebase/firestore";
import { Book } from "./types.js";


const bookCollection = "books";
 async function initDb() {
  const app = initializeApp(await firebaseConfig());
  return getFirestore(app);
}

async function addBook(book: Book) {
  const db = await initDb();
  try {
    const docRef = await addDoc(collection(db, bookCollection), book);
    console.log("Document written with ID: ", docRef.id);
    return docRef.id;
  } catch (e) {
    console.error("Error adding document: ", e);
    throw e;
  }
}

async function getBook(bookId: string): Promise<Book | null> {
  const db = await initDb();
  const docRef = collection(db, bookCollection);
  const docSnap = await getDoc(doc(docRef, bookId));

  if (docSnap.exists()) {
    return docSnap.data() as Book;
  } else {
    console.log("No such document!");
    return null;
  }
}

async function updateBook(bookId: string, updatedData: Partial<Book>) {
  const db = await initDb();
  const docRef = doc(collection(db, bookCollection), bookId);

  try {
    await updateDoc(docRef, updatedData);
    console.log("Document updated with ID: ", bookId);
  } catch (e) {
    console.error("Error updating document: ", e);
    throw e;
  }
}

async function getBooks(): Promise<Book[]> {
  const db = await initDb();
  const querySnapshot = await getDocs(collection(db, bookCollection));
  const books: Book[] = [];
  querySnapshot.forEach((doc) => {
    books.push({ ...doc.data() as Book, id: doc.id });
  });
  return books;
}

export { addBook, getBook, updateBook, getBooks };