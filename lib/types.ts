type Book = {
  id: string;
  title: string;
  datePublished: String;
  dateAdded: String;
  authors: Array<string>;
  genres: Array<string>;
  description: string;
  coverImageUrl: string;
  pageCount: number;
}

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

export type { Book, Author, User, UserBookSummary };