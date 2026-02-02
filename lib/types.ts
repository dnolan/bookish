type Book = {
  id: string;
  title: string;
  datePublished: string;
  dateAdded: string;
  authors: Array<string>;
  genres: Array<string>;
  description: string;
  coverImageUrl: string;
  pageCount: number;
  isbn10?: string;
  rating?: number;
}

type BookFormData = Omit<Book, 'id'> & { id?: string };

type BookCollectionSelection = {
  existingBookId: string;
  rating?: number;
};

type BookDialogSubmit = BookFormData | BookCollectionSelection;

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
  rating?: number;
}

export type { Book, Author, User, UserBookSummary, BookFormData, BookCollectionSelection, BookDialogSubmit };