import { NextResponse } from 'next/server';

const OPEN_LIBRARY_BASE_URL = 'https://openlibrary.org';

async function fetchJson(url: string) {
  const response = await fetch(url, { next: { revalidate: 60 } });
  if (!response.ok) {
    throw new Error(`Open Library request failed: ${response.status}`);
  }
  return response.json();
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const key = searchParams.get('key')?.trim();

  if (!key) {
    return NextResponse.json({ error: 'Missing query parameter: key' }, { status: 400 });
  }

  const normalizedKey = key.startsWith('/') ? key : `/${key}`;

  try {
    let isbn10: string | null = null;

    if (normalizedKey.startsWith('/books/')) {
      const bookData = await fetchJson(`${OPEN_LIBRARY_BASE_URL}${normalizedKey}.json`);
      if (Array.isArray(bookData?.isbn_10) && bookData.isbn_10.length > 0) {
        isbn10 = bookData.isbn_10[0];
      }
    } else if (normalizedKey.startsWith('/works/')) {
      const editionsData = await fetchJson(
        `${OPEN_LIBRARY_BASE_URL}${normalizedKey}/editions.json?limit=10`
      );
      const entries = Array.isArray(editionsData?.entries) ? editionsData.entries : [];
      for (const entry of entries) {
        if (Array.isArray(entry?.isbn_10) && entry.isbn_10.length > 0) {
          isbn10 = entry.isbn_10[0];
          break;
        }
      }
    } else {
      return NextResponse.json({ error: 'Unsupported key type' }, { status: 400 });
    }

    return NextResponse.json({ isbn10 });
  } catch (error) {
    console.error('Open Library detail request failed:', error);
    return NextResponse.json({ error: 'Open Library request failed' }, { status: 502 });
  }
}
