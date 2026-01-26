
import { initializeApp } from "firebase/app";
import { firebaseConfig } from "./firebase";
import { getFirestore, collection, addDoc, getDoc, updateDoc, doc, getDocs, query, where } from "firebase/firestore";
import { Book, Author } from "./types.js";


const bookCollection = "books";
const authorCollection = "authors";
 async function initDb() {
  const app = initializeApp(await firebaseConfig());
  return getFirestore(app);
}

async function addBook(book: Book) {
  const db = await initDb();
  try {
    // First, add the authors to the authors collection
    if (book.authors && book.authors.length > 0) {
      await addAuthors(book.authors);
    }
    
    // Then add the book
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

async function getAuthorNames(): Promise<string[]> {
  const db = await initDb();
  const querySnapshot = await getDocs(collection(db, authorCollection));
  const authors: string[] = [];
  
  querySnapshot.forEach((doc) => {
    const author = doc.data() as Author;
    authors.push(author.name);
  });
  
  return authors.sort();
}

async function addAuthor(authorName: string): Promise<string> {
  const db = await initDb();
  
  // Check if author already exists
  const q = query(collection(db, authorCollection), where("name", "==", authorName));
  const querySnapshot = await getDocs(q);
  
  if (!querySnapshot.empty) {
    // Author already exists, return existing ID
    return querySnapshot.docs[0].id;
  }
  
  // Add new author
  try {
    const docRef = await addDoc(collection(db, authorCollection), {
      name: authorName,
      dateAdded: new Date().toISOString()
    });
    console.log("Author written with ID: ", docRef.id);
    return docRef.id;
  } catch (e) {
    console.error("Error adding author: ", e);
    throw e;
  }
}

async function addAuthors(authorNames: string[]): Promise<void> {
  const promises = authorNames.map(name => {
    if (name.trim()) {
      return addAuthor(name.trim());
    }
  });
  
  await Promise.all(promises.filter(Boolean));
}

export { addBook, getBook, updateBook, getBooks, getAuthorNames, addAuthor, addAuthors };