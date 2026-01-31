import { NextResponse } from 'next/server';
import { getBooks } from '@/lib/db';
import { Book } from '@/lib/types';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q')?.trim();

  if (!query) {
    return NextResponse.json({ error: 'Missing query parameter: q' }, { status: 400 });
  }

  const normalized = query.toLowerCase();
  const books = await getBooks();
  const results = books.filter((book: Book) => {
    const titleMatch = book.title?.toLowerCase().includes(normalized);
    const authorMatch = Array.isArray(book.authors)
      ? book.authors.some((author) => author.toLowerCase().includes(normalized))
      : false;
    return titleMatch || authorMatch;
  });

  return NextResponse.json({ results });
}
