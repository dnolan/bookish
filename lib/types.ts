type Book = {
  id: string;
  userId: string;
  title: string;
  datePublished: string;
  dateAdded: string;
  authors: Array<string>;
  genres: Array<string>;
  description: string;
  coverImageUrl: string;
  pageCount: number;
  isbn10?: string;
}

type BookFormData = Omit<Book, 'id' | 'userId'> & { id?: string };

type Author = {
  id: string;
  name: string;
  dateAdded: string;
}

type User = {
  id: string;
  name: string;
  email: string;
  favoriteGenres: Array<string>;
  readingList: Array<Book>;
}

type UserBookSummary = {
  userId: string;
  bookId: string;
  dateAddedToReadingList: string; 
}

export type { Book, Author, User, UserBookSummary, BookFormData };