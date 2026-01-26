import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
} from '@mui/material';
import { Book } from '@/lib/types';

interface BookTableProps {
  books: Book[];
  onEdit: (book: Book) => void;
  onDelete: (book: Book) => void;
  loading?: boolean;
}

export function BookTable({ books, onEdit, onDelete, loading }: BookTableProps) {
  const handleDelete = async (book: Book) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${book.title}"? This action cannot be undone.`
    );
    
    if (confirmed) {
      try {
        await onDelete(book);
      } catch (error) {
        alert('Failed to delete the book. Please try again.');
      }
    }
  };

  if (loading) {
    return <div>Loading books...</div>;
  }

  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Title</TableCell>
            <TableCell>Authors</TableCell>
            <TableCell>Genres</TableCell>
            <TableCell>Date Added</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {books.map((book) => (
            <TableRow key={book.id}>
              <TableCell>{book.title}</TableCell>
              <TableCell>
                {book.authors && book.authors.length > 0 ? (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                    {book.authors.map((author, index) => (
                      <Chip 
                        key={index} 
                        label={author} 
                        size="small" 
                        variant="outlined" 
                      />
                    ))}
                  </div>
                ) : (
                  <em>No authors</em>
                )}
              </TableCell>
              <TableCell>
                {book.genres && book.genres.length > 0 ? (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                    {book.genres.map((genre, index) => (
                      <Chip 
                        key={index} 
                        label={genre} 
                        size="small" 
                        variant="outlined"
                        color="primary"
                      />
                    ))}
                  </div>
                ) : (
                  <em>No genres</em>
                )}
              </TableCell>
              <TableCell>{book.dateAdded}</TableCell>
              <TableCell>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <Button 
                    variant="contained" 
                    size="small" 
                    onClick={() => onEdit(book)}
                  >
                    Edit
                  </Button>
                  <Button 
                    variant="outlined" 
                    size="small" 
                    color="error"
                    onClick={() => handleDelete(book)}
                  >
                    Delete
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}