import { initializeApp } from "firebase/app";
import { firebaseConfig } from "./firebase";
import { getFirestore, collection, addDoc, getDoc, updateDoc, deleteDoc, doc, getDocs, query, where, documentId } from "firebase/firestore";
import { Book, Author, UserBookSummary } from "./types.js";
const bookCollection = "books";
const authorCollection = "authors";
import defaultGenres from "./defaultGenres.json";
const genreCollection = "genres";
const userCollectionCollection = "userCollections";

 async function initDb() {
  const app = initializeApp(await firebaseConfig());
  return getFirestore(app);
}

async function addBook(book: Omit<Book, 'id'>) {
  const db = await initDb();
  try {
    // First, add the authors to the authors collection
    if (book.authors && book.authors.length > 0) {
      await addAuthors(book.authors);
    }
    
    // Add genres to the genres collection
    if (book.genres && book.genres.length > 0) {
      await addGenres(book.genres);
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

async function addBookToCollection(userId: string, bookId: string): Promise<string> {
  const db = await initDb();
  const entry: UserBookSummary = {
    userId,
    bookId,
    dateAddedToReadingList: new Date().toISOString(),
  };

  const docRef = await addDoc(collection(db, userCollectionCollection), entry);
  return docRef.id;
}

async function removeBookFromCollection(userId: string, bookId: string): Promise<void> {
  const db = await initDb();
  const q = query(
    collection(db, userCollectionCollection),
    where("userId", "==", userId),
    where("bookId", "==", bookId)
  );
  const querySnapshot = await getDocs(q);
  const deletions = querySnapshot.docs.map((docSnap) => deleteDoc(docSnap.ref));
  await Promise.all(deletions);
}

async function getCollectionBookIds(userId: string): Promise<string[]> {
  const db = await initDb();
  const q = query(collection(db, userCollectionCollection), where("userId", "==", userId));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs
    .map((docSnap) => docSnap.data() as UserBookSummary)
    .map((entry) => entry.bookId)
    .filter(Boolean);
}

async function getBooksForUserCollection(userId: string): Promise<Book[]> {
  const db = await initDb();
  const bookIds = await getCollectionBookIds(userId);
  if (bookIds.length === 0) {
    return [];
  }

  const books: Book[] = [];
  const chunks: string[][] = [];
  for (let i = 0; i < bookIds.length; i += 10) {
    chunks.push(bookIds.slice(i, i + 10));
  }

  for (const chunk of chunks) {
    const q = query(collection(db, bookCollection), where(documentId(), "in", chunk));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((docSnap) => {
      books.push({ ...docSnap.data() as Book, id: docSnap.id });
    });
  }

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

async function deleteBook(bookId: string): Promise<void> {
  const db = await initDb();
  const docRef = doc(collection(db, bookCollection), bookId);

  try {
    await deleteDoc(docRef);
    console.log("Document deleted with ID: ", bookId);
  } catch (e) {
    console.error("Error deleting document: ", e);
    throw e;
  }
}

async function getGenreNames(): Promise<string[]> {
  const db = await initDb();
  const querySnapshot = await getDocs(collection(db, genreCollection));
  
  // If collection is empty, populate with default genres
  if (querySnapshot.empty) {
    console.log("Genre collection is empty, populating with default genres...");
    await addGenres(defaultGenres);
    // Fetch again after populating
    const newQuerySnapshot = await getDocs(collection(db, genreCollection));
    const genres: string[] = [];
    newQuerySnapshot.forEach((doc) => {
      const genre = doc.data() as { name: string; dateAdded: string };
      genres.push(genre.name);
    });
    return genres.sort();
  }
  
  const genres: string[] = [];
  querySnapshot.forEach((doc) => {
    const genre = doc.data() as { name: string; dateAdded: string };
    genres.push(genre.name);
  });
  
  return genres.sort();
}

async function addGenre(genreName: string): Promise<string> {
  const db = await initDb();
  
  // Check if genre already exists
  const q = query(collection(db, genreCollection), where("name", "==", genreName));
  const querySnapshot = await getDocs(q);
  
  if (!querySnapshot.empty) {
    // Genre already exists, return existing ID
    return querySnapshot.docs[0].id;
  } 
  
  // Add new genre
  try {
    const docRef = await addDoc(collection(db, genreCollection), {
      name: genreName,
      dateAdded: new Date().toISOString()
    });
    console.log("Genre written with ID: ", docRef.id);
    return docRef.id;
  } catch (e) {
    console.error("Error adding genre: ", e);
    throw e;
  }
}

async function addGenres(genreNames: string[]): Promise<void> {
  const promises = genreNames.map(name => {
    if (name.trim()) {
      return addGenre(name.trim());
    }
  });
  
  await Promise.all(promises.filter(Boolean));
}

export { addBook, getBook, updateBook, deleteBook, getBooks, addBookToCollection, removeBookFromCollection, getBooksForUserCollection, getAuthorNames, addAuthor, addAuthors, getGenreNames, addGenre, addGenres };