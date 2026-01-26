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
} from '@mui/material';
import { Book } from '@/lib/types';

interface BookDialogProps {
  open: boolean;
  book?: Book | null;
  authors: string[];
  onClose: () => void;
  onSubmit: (bookData: any) => Promise<void>;
}

export function BookDialog({ 
  open, 
  book, 
  authors, 
  onClose, 
  onSubmit 
}: BookDialogProps) {
  const [selectedAuthors, setSelectedAuthors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const isEditMode = !!book;

  useEffect(() => {
    if (book) {
      setSelectedAuthors(book.authors || []);
    } else {
      setSelectedAuthors([]);
    }
  }, [book]);

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
          // Keep existing values for other fields
          dateAdded: book.dateAdded,
          genres: book.genres,
          description: book.description,
          coverImageUrl: book.coverImageUrl,
          pageCount: book.pageCount,
        });
      } else {
        await onSubmit({
          title: bookName,
          datePublished,
          authors: selectedAuthors,
          dateAdded: new Date().toISOString(),
          genres: [],
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
    setSelectedAuthors([]);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {isEditMode ? 'Edit Book' : 'Add New Book'}
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <TextField 
            name="bookName" 
            label="Book Title" 
            fullWidth 
            margin="normal"
            required
            defaultValue={book?.title || ''}
          />

          <TextField 
            name="datePublished" 
            label="Date Published" 
            fullWidth 
            margin="normal" 
            type="date" 
            InputLabelProps={{ shrink: true }}
            defaultValue={book?.datePublished || ''}
          />
          
          <Autocomplete
            multiple
            freeSolo
            options={authors}
            value={selectedAuthors}
            onChange={(event, newValue) => {
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