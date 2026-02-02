import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Container,
  Paper,
  Typography,
  Alert,
  Tabs,
  Tab,
} from '@mui/material';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { getAuth } from 'firebase/auth';
import { initializeApp } from 'firebase/app';
import { firebaseConfig } from '@/lib/firebase';

interface AuthFormProps {
  onAuthSuccess?: () => void;
}

export function AuthForm({ onAuthSuccess }: AuthFormProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showResetPassword, setShowResetPassword] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      const config = await firebaseConfig();
      const app = initializeApp(config);
      const auth = getAuth(app);

      if (mode === 'register') {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }

      setEmail('');
      setPassword('');
      onAuthSuccess?.();
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : typeof err === 'string'
            ? err
            : 'Authentication failed';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      const config = await firebaseConfig();
      const app = initializeApp(config);
      const auth = getAuth(app);

      await sendPasswordResetEmail(auth, email);
      setSuccessMessage('Password reset email sent! Check your inbox.');
      setEmail('');
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : typeof err === 'string'
            ? err
            : 'Failed to send reset email';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            width: '100%',
            borderRadius: 2,
          }}
        >
          <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ mb: 3 }}>
            Bookish
          </Typography>

          {!showResetPassword && (
            <Tabs
              value={mode}
              onChange={(_, newValue) => {
                setMode(newValue);
                setError(null);
                setSuccessMessage(null);
              }}
              variant="fullWidth"
              sx={{ mb: 3 }}
            >
              <Tab label="Login" value="login" />
              <Tab label="Register" value="register" />
            </Tabs>
          )}

          {showResetPassword && (
            <Typography variant="h6" align="center" sx={{ mb: 3 }}>
              Reset Password
            </Typography>
          )}

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {successMessage && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {successMessage}
            </Alert>
          )}

          {showResetPassword ? (
            <form onSubmit={handleResetPassword}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                margin="normal"
                required
                disabled={loading}
              />
              <Button
                fullWidth
                variant="contained"
                type="submit"
                sx={{ mt: 3 }}
                disabled={loading}
              >
                {loading ? 'Sending...' : 'Send Reset Email'}
              </Button>
              <Button
                fullWidth
                variant="text"
                sx={{ mt: 2 }}
                onClick={() => {
                  setShowResetPassword(false);
                  setError(null);
                  setSuccessMessage(null);
                  setEmail('');
                }}
                disabled={loading}
              >
                Back to Login
              </Button>
            </form>
          ) : (
            <>
              <form onSubmit={handleAuth}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  margin="normal"
                  required
                  disabled={loading}
                />
                <TextField
                  fullWidth
                  label="Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  margin="normal"
                  required
                  disabled={loading}
                />
                <Button
                  fullWidth
                  variant="contained"
                  type="submit"
                  sx={{ mt: 3 }}
                  disabled={loading}
                >
                  {loading ? 'Loading...' : mode === 'login' ? 'Login' : 'Register'}
                </Button>
              </form>

              {mode === 'login' && (
                <Button
                  fullWidth
                  variant="text"
                  sx={{ mt: 2 }}
                  onClick={() => {
                    setShowResetPassword(true);
                    setError(null);
                    setSuccessMessage(null);
                  }}
                  disabled={loading}
                >
                  Forgot Password?
                </Button>
              )}

              <Typography variant="body2" color="textSecondary" align="center" sx={{ mt: 2 }}>
                {mode === 'login'
                  ? "Don't have an account? Switch to Register"
                  : 'Already have an account? Switch to Login'}
              </Typography>
            </>
          )}
        </Paper>
      </Box>
    </Container>
  );
}
