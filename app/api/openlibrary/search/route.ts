import { NextResponse } from 'next/server';

const OPEN_LIBRARY_SEARCH_URL = 'https://openlibrary.org/search.json';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q')?.trim();

  if (!query) {
    return NextResponse.json({ error: 'Missing query parameter: q' }, { status: 400 });
  }

  const url = new URL(OPEN_LIBRARY_SEARCH_URL);
  url.searchParams.set('q', query);
  url.searchParams.set('limit', '10');

  const response = await fetch(url.toString(), {
    next: { revalidate: 60 },
  });

  if (!response.ok) {
    return NextResponse.json({ error: 'Open Library request failed' }, { status: 502 });
  }

  type OpenLibraryDoc = {
    key?: string;
    title?: string;
    author_name?: string[];
    first_publish_year?: number;
    isbn?: string[];
  };

  const data: unknown = await response.json();
  const docs =
    typeof data === 'object' &&
    data !== null &&
    'docs' in data &&
    Array.isArray((data as { docs?: unknown }).docs)
      ? ((data as { docs: OpenLibraryDoc[] }).docs ?? [])
      : [];

  const results = docs.map((doc: OpenLibraryDoc) => {
    const isbns = Array.isArray(doc.isbn) ? doc.isbn : [];
    const isbn10 = isbns.find((isbn) => typeof isbn === 'string' && isbn.length === 10) || null;
    const coverUrl = isbn10 ? `https://covers.openlibrary.org/b/isbn/${isbn10}-S.jpg` : null;

    return {
      key: doc.key ?? '',
      title: doc.title ?? '',
      authors: Array.isArray(doc.author_name) ? doc.author_name : [],
      firstPublishYear: doc.first_publish_year,
      isbn10,
      coverUrl,
    };
  });

  return NextResponse.json({ results });
}
