"use client";

import { useAuth } from '@/lib/authContext';
import { BookManager } from '@/components/BookManager';
import { AuthForm } from '@/components/AuthForm';
import { CircularProgress, Box } from '@mui/material';

export default function Home() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    return <AuthForm />;
  }

  return <BookManager />;
}
