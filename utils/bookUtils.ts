import { Book } from '@/lib/types';

export interface BookFormData {
  title: string;
  datePublished: string;
  authors: string[];
  dateAdded: string;
  genres: string[];
  description: string;
  coverImageUrl: string;
  pageCount: number;
}

export function createBookFromFormData(data: BookFormData): Omit<Book, 'id'> {
  return {
    title: data.title,
    datePublished: data.datePublished,
    authors: data.authors,
    dateAdded: data.dateAdded,
    genres: data.genres,
    description: data.description,
    coverImageUrl: data.coverImageUrl,
    pageCount: data.pageCount,
  };
}

export function validateBookData(data: BookFormData): string[] {
  const errors: string[] = [];

  if (!data.title.trim()) {
    errors.push('Title is required');
  }

  return errors;
}