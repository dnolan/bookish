import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Autocomplete,
  Chip,
  CircularProgress,
} from '@mui/material';
import { Book, BookDialogSubmit, BookFormData } from '@/lib/types';

interface BookDialogProps {
  open: boolean;
  book?: Book | null;
  authors: string[];
  genres: string[];
  onClose: () => void;
  onSubmit: (submission: BookDialogSubmit) => Promise<void>;
}

export function BookDialog({ 
  open, 
  book, 
  authors, 
  genres,
  onClose, 
  onSubmit 
}: BookDialogProps) {
  const isAbortError = (error: unknown) =>
    typeof error === 'object' &&
    error !== null &&
    'name' in error &&
    (error as { name?: string }).name === 'AbortError';
  type OpenLibraryResult = {
    key: string;
    title: string;
    authors: string[];
    firstPublishYear?: number;
    isbn10?: string | null;
    coverUrl?: string | null;
  };

  type CollectionResult = {
    source: 'collection';
    book: Book;
  };

  type SearchResult = OpenLibraryResult | CollectionResult;

  const [bookTitleInput, setBookTitleInput] = useState('');
  const [bookTitleValue, setBookTitleValue] = useState<SearchResult | string | null>(null);
  const [titleOptions, setTitleOptions] = useState<SearchResult[]>([]);
  const [titleLoading, setTitleLoading] = useState(false);
  const [datePublishedValue, setDatePublishedValue] = useState('');
  const [selectedOpenLibraryKey, setSelectedOpenLibraryKey] = useState<string | null>(null);
  const [selectedCollectionBookId, setSelectedCollectionBookId] = useState<string | null>(null);
  const [isbn10Value, setIsbn10Value] = useState('');
  const [isbn10Loading, setIsbn10Loading] = useState(false);
  const [selectedAuthors, setSelectedAuthors] = useState<string[]>([]);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [genreSuggestionLoading, setGenreSuggestionLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [bookSelected, setBookSelected] = useState(false);
  const isEditMode = !!book;

  useEffect(() => {
    if (book) {
      setBookTitleInput(book.title || '');
      setBookTitleValue(book.title || null);
      setDatePublishedValue((book.datePublished as string) || '');
      setIsbn10Value(book.isbn10 || '');
      setSelectedOpenLibraryKey(null);
      setSelectedCollectionBookId(book.id || null);
      setSelectedAuthors(book.authors || []);
      setSelectedGenres(book.genres || []);
      setBookSelected(false);
    } else {
      setBookTitleInput('');
      setBookTitleValue(null);
      setDatePublishedValue('');
      setIsbn10Value('');
      setSelectedOpenLibraryKey(null);
      setSelectedCollectionBookId(null);
      setSelectedAuthors([]);
      setSelectedGenres([]);
      setBookSelected(false);
    }
  }, [book]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const query = bookTitleInput.trim();
    if (query.length < 2) {
      setTitleOptions([]);
      setTitleLoading(false);
      return;
    }

    const controller = new AbortController();
    setTitleLoading(true);

    const timer = setTimeout(async () => {
      try {
        const collectionResponse = await fetch(`/api/books/search?q=${encodeURIComponent(query)}`, {
          signal: controller.signal,
        });
        if (!collectionResponse.ok) {
          throw new Error('Collection search request failed');
        }
        const collectionData = await collectionResponse.json();
        const collectionResults = Array.isArray(collectionData?.results)
          ? collectionData.results.map((result: Book) => ({ source: 'collection', book: result } as CollectionResult))
          : [];

        if (collectionResults.length > 0) {
          setTitleOptions(collectionResults);
          return;
        }

        const response = await fetch(`/api/openlibrary/search?q=${encodeURIComponent(query)}` , {
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error('Search request failed');
        }
        const data = await response.json();
        setTitleOptions(Array.isArray(data?.results) ? data.results : []);
      } catch (error: unknown) {
        if (!isAbortError(error)) {
          console.error('Open Library search failed:', error);
        }
      } finally {
        setTitleLoading(false);
      }
    }, 300);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [bookTitleInput, open]);

  useEffect(() => {
    if (!selectedOpenLibraryKey) {
      setIsbn10Value('');
      return;
    }

    const controller = new AbortController();
    setIsbn10Loading(true);

    const loadIsbn = async () => {
      try {
        const response = await fetch(
          `/api/openlibrary/details?key=${encodeURIComponent(selectedOpenLibraryKey)}`,
          { signal: controller.signal }
        );
        if (!response.ok) {
          throw new Error('Detail request failed');
        }
        const data = await response.json();
        setIsbn10Value(data?.isbn10 || '');
      } catch (error: unknown) {
        if (!isAbortError(error)) {
          console.error('Open Library detail failed:', error);
        }
      } finally {
        setIsbn10Loading(false);
      }
    };

    loadIsbn();

    return () => {
      controller.abort();
    };
  }, [selectedOpenLibraryKey]);

  useEffect(() => {
    if (!bookSelected) {
      return;
    }

    const controller = new AbortController();
    setGenreSuggestionLoading(true);

    const loadGenres = async () => {
      try {
        const response = await fetch('/api/suggest-genres', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: bookTitleInput,
            authors: selectedAuthors,
          }),
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error('Genre suggestion request failed');
        }

        const data = await response.json();
        const suggestedGenres = Array.isArray(data?.genres) ? data.genres : [];
        setSelectedGenres(suggestedGenres);
      } catch (error: unknown) {
        if (!isAbortError(error)) {
          console.error('Genre suggestion failed:', error);
        }
      } finally {
        setGenreSuggestionLoading(false);
      }
    };

    loadGenres();

    return () => {
      controller.abort();
    };
  }, [bookSelected]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.target as HTMLFormElement);
    const bookName = formData.get('bookName') as string;
    const datePublished = formData.get('datePublished') as string;

    try {
      if (!isEditMode && selectedCollectionBookId) {
        await onSubmit({ existingBookId: selectedCollectionBookId });
      } else if (isEditMode && book) {
        await onSubmit({
          id: book.id,
          title: bookName,
          datePublished,
          authors: selectedAuthors,
          genres: selectedGenres,
          isbn10: isbn10Value,
          // Keep existing values for other fields
          dateAdded: book.dateAdded,
          description: book.description,
          coverImageUrl: book.coverImageUrl,
          pageCount: book.pageCount,
        });
      } else {
        await onSubmit({
          title: bookName,
          datePublished,
          authors: selectedAuthors,
          genres: selectedGenres,
          isbn10: isbn10Value,
          dateAdded: new Date().toISOString(),
          description: '',
          coverImageUrl: '',
          pageCount: 0,
        });
      }

      handleClose();
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setBookTitleInput('');
    setBookTitleValue(null);
    setTitleOptions([]);
    setDatePublishedValue('');
    setSelectedOpenLibraryKey(null);
    setSelectedCollectionBookId(null);
    setIsbn10Value('');
    setSelectedAuthors([]);
    setSelectedGenres([]);
    setBookSelected(false);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {isEditMode ? 'Edit Book' : 'Add New Book'}
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Autocomplete
            freeSolo
            options={titleOptions}
            filterOptions={(options) => options}
            getOptionLabel={(option) => {
              if (typeof option === 'string') return option;
              if ('source' in option && option.source === 'collection') {
                return option.book.title;
              }
              return option.title;
            }}
            value={bookTitleValue}
            inputValue={bookTitleInput}
            loading={titleLoading}
            onInputChange={(_, newInputValue) => {
              setBookTitleInput(newInputValue);
              if (!newInputValue) {
                setBookTitleValue(null);
                setSelectedCollectionBookId(null);
              }
            }}
            onChange={(_, newValue) => {
              setBookTitleValue(newValue);
              setSelectedCollectionBookId(null);
              if (typeof newValue === 'string') {
                setBookTitleInput(newValue);
                setSelectedOpenLibraryKey(null);
                setBookSelected(false);
                return;
              }
              if (!newValue) return;

              if ('source' in newValue && newValue.source === 'collection') {
                const selectedBook = newValue.book;
                setBookTitleInput(selectedBook.title);
                setSelectedAuthors(selectedBook.authors || []);
                setSelectedGenres(selectedBook.genres || []);
                setDatePublishedValue(selectedBook.datePublished || '');
                setIsbn10Value(selectedBook.isbn10 || '');
                setSelectedOpenLibraryKey(null);
                setSelectedCollectionBookId(selectedBook.id);
                setBookSelected(false);
                return;
              }

              if ('title' in newValue) {
                setBookTitleInput(newValue.title);
                if (newValue.authors?.length) {
                  setSelectedAuthors(Array.from(new Set(newValue.authors)));
                }
                if (newValue.firstPublishYear) {
                  setDatePublishedValue(`${newValue.firstPublishYear}-01-01`);
                }
                setSelectedOpenLibraryKey(newValue.key);
                setBookSelected(true);
              }
            }}
            renderOption={(props, option) => (
              <li {...props}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  {'source' in option && option.source === 'collection' ? (
                    option.book.coverImageUrl ? (
                      <img
                        src={option.book.coverImageUrl}
                        alt=""
                        width={32}
                        height={48}
                        style={{ objectFit: 'cover', borderRadius: 4 }}
                        loading="lazy"
                      />
                    ) : null
                  ) : option.coverUrl ? (
                    <img
                      src={option.coverUrl}
                      alt=""
                      width={32}
                      height={48}
                      style={{ objectFit: 'cover', borderRadius: 4 }}
                      loading="lazy"
                    />
                  ) : null}
                  <div>
                    {'source' in option && option.source === 'collection' ? (
                      <>
                        <div>{option.book.title}</div>
                        {option.book.authors?.length ? (
                          <div style={{ fontSize: 12, opacity: 0.7 }}>
                            {option.book.authors.join(', ')}
                          </div>
                        ) : null}
                        <div style={{ fontSize: 11, opacity: 0.6 }}>In collection</div>
                      </>
                    ) : (
                      <>
                        <div>{option.title}</div>
                        {option.authors?.length ? (
                          <div style={{ fontSize: 12, opacity: 0.7 }}>
                            {option.authors.join(', ')}
                            {option.firstPublishYear ? ` • ${option.firstPublishYear}` : ''}
                          </div>
                        ) : null}
                        <div style={{ fontSize: 11, opacity: 0.6 }}>Open Library</div>
                      </>
                    )}
                  </div>
                </div>
              </li>
            )}
            renderInput={(params) => (
              <TextField
                {...params}
                name="bookName"
                label="Search for a book"
                fullWidth
                margin="normal"
                required
                helperText="Search your collection first, then Open Library"
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {titleLoading ? <CircularProgress color="inherit" size={18} /> : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
          />

          <TextField 
            name="datePublished" 
            label="Date Published" 
            fullWidth 
            margin="normal" 
            type="date" 
            InputLabelProps={{ shrink: true }}
            value={datePublishedValue}
            onChange={(event) => setDatePublishedValue(event.target.value)}
            disabled={bookSelected && genreSuggestionLoading}
          />

          <TextField 
            name="isbn10" 
            label="ISBN-10" 
            fullWidth 
            margin="normal" 
            value={isbn10Value}
            onChange={(event) => setIsbn10Value(event.target.value)}
            helperText={isbn10Loading ? 'Looking up ISBN-10…' : 'Auto-filled from Open Library'}
            disabled={bookSelected && genreSuggestionLoading}
          />
          
          <Autocomplete
            multiple
            freeSolo
            options={authors}
            value={selectedAuthors}
            onChange={(_, newValue) => {
              setSelectedAuthors(newValue);
            }}
            disabled={bookSelected && genreSuggestionLoading}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip
                  variant="outlined"
                  label={option}
                  {...getTagProps({ index })}
                />
              ))
            }
            renderInput={(params) => (
              <TextField
                {...params}
                label="Authors"
                placeholder="Select or add authors"
                margin="normal"
                fullWidth
              />
            )}
            sx={{ mt: 2 }}
          />

          <Autocomplete
            multiple
            freeSolo
            options={genres}
            value={selectedGenres}
            onChange={(_, newValue) => {
              setSelectedGenres(newValue);
            }}
            disabled={bookSelected && genreSuggestionLoading}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip
                  variant="outlined"
                  label={option}
                  {...getTagProps({ index })}
                />
              ))
            }
            renderInput={(params) => (
              <TextField
                {...params}
                label="Genres"
                placeholder={genreSuggestionLoading ? "Loading suggestions from AI…" : "Select or add genres"}
                margin="normal"
                fullWidth
              />
            )}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={loading || genreSuggestionLoading}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={loading || genreSuggestionLoading}>
            {genreSuggestionLoading ? 'Loading genres…' : loading ? 'Saving...' : isEditMode ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}