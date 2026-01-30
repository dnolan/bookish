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
import { Book } from '@/lib/types';

interface BookDialogProps {
  open: boolean;
  book?: Book | null;
  authors: string[];
  genres: string[];
  onClose: () => void;
  onSubmit: (bookData: any) => Promise<void>;
}

export function BookDialog({ 
  open, 
  book, 
  authors, 
  genres,
  onClose, 
  onSubmit 
}: BookDialogProps) {
  type OpenLibraryResult = {
    key: string;
    title: string;
    authors: string[];
    firstPublishYear?: number;
    isbn10?: string | null;
    coverUrl?: string | null;
  };

  const [bookTitleInput, setBookTitleInput] = useState('');
  const [bookTitleValue, setBookTitleValue] = useState<OpenLibraryResult | string | null>(null);
  const [titleOptions, setTitleOptions] = useState<OpenLibraryResult[]>([]);
  const [titleLoading, setTitleLoading] = useState(false);
  const [datePublishedValue, setDatePublishedValue] = useState('');
  const [selectedOpenLibraryKey, setSelectedOpenLibraryKey] = useState<string | null>(null);
  const [isbn10Value, setIsbn10Value] = useState('');
  const [isbn10Loading, setIsbn10Loading] = useState(false);
  const [selectedAuthors, setSelectedAuthors] = useState<string[]>([]);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const isEditMode = !!book;

  useEffect(() => {
    if (book) {
      setBookTitleInput(book.title || '');
      setBookTitleValue(book.title || null);
      setDatePublishedValue((book.datePublished as string) || '');
      setIsbn10Value(book.isbn10 || '');
      setSelectedOpenLibraryKey(null);
      setSelectedAuthors(book.authors || []);
      setSelectedGenres(book.genres || []);
    } else {
      setBookTitleInput('');
      setBookTitleValue(null);
      setDatePublishedValue('');
      setIsbn10Value('');
      setSelectedOpenLibraryKey(null);
      setSelectedAuthors([]);
      setSelectedGenres([]);
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
        const response = await fetch(`/api/openlibrary/search?q=${encodeURIComponent(query)}` , {
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error('Search request failed');
        }
        const data = await response.json();
        setTitleOptions(Array.isArray(data?.results) ? data.results : []);
      } catch (error: any) {
        if (error?.name !== 'AbortError') {
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
      } catch (error: any) {
        if (error?.name !== 'AbortError') {
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.target as HTMLFormElement);
    const bookName = formData.get('bookName') as string;
    const datePublished = formData.get('datePublished') as string;

    try {
      if (isEditMode && book) {
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
    setIsbn10Value('');
    setSelectedAuthors([]);
    setSelectedGenres([]);
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
            getOptionLabel={(option) =>
              typeof option === 'string' ? option : option.title
            }
            value={bookTitleValue}
            inputValue={bookTitleInput}
            loading={titleLoading}
            onInputChange={(_, newInputValue) => {
              setBookTitleInput(newInputValue);
              if (!newInputValue) {
                setBookTitleValue(null);
              }
            }}
            onChange={(_, newValue) => {
              setBookTitleValue(newValue);
              if (typeof newValue === 'string') {
                setBookTitleInput(newValue);
                setSelectedOpenLibraryKey(null);
                return;
              }
              if (newValue) {
                setBookTitleInput(newValue.title);
                if (newValue.authors?.length) {
                  setSelectedAuthors(Array.from(new Set(newValue.authors)));
                }
                if (newValue.firstPublishYear) {
                  setDatePublishedValue(`${newValue.firstPublishYear}-01-01`);
                }
                setSelectedOpenLibraryKey(newValue.key);
              }
            }}
            renderOption={(props, option) => (
              <li {...props}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  {option.coverUrl ? (
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
                    <div>{option.title}</div>
                    {option.authors?.length ? (
                      <div style={{ fontSize: 12, opacity: 0.7 }}>
                        {option.authors.join(', ')}
                        {option.firstPublishYear ? ` • ${option.firstPublishYear}` : ''}
                      </div>
                    ) : null}
                  </div>
                </div>
              </li>
            )}
            renderInput={(params) => (
              <TextField
                {...params}
                name="bookName"
                label="Book Title"
                fullWidth
                margin="normal"
                required
                helperText="Start typing to search Open Library"
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
          />

          <TextField 
            name="isbn10" 
            label="ISBN-10" 
            fullWidth 
            margin="normal" 
            value={isbn10Value}
            onChange={(event) => setIsbn10Value(event.target.value)}
            helperText={isbn10Loading ? 'Looking up ISBN-10…' : 'Auto-filled from Open Library'}
          />
          
          <Autocomplete
            multiple
            freeSolo
            options={authors}
            value={selectedAuthors}
            onChange={(_, newValue) => {
              setSelectedAuthors(newValue);
            }}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip variant="outlined" label={option} {...getTagProps({ index })} />
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
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip variant="outlined" label={option} {...getTagProps({ index })} />
              ))
            }
            renderInput={(params) => (
              <TextField
                {...params}
                label="Genres"
                placeholder="Select or add genres"
                margin="normal"
                fullWidth
              />
            )}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? 'Saving...' : isEditMode ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}