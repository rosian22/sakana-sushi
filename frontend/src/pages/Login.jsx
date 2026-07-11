import { useState } from 'react';
import { useNavigate, Link as RouterLink, useLocation } from 'react-router-dom';
import {
  Container, Paper, Typography, TextField, Button, Alert, Stack, Link, Box,
} from '@mui/material';
import { useAuth } from '../context/AuthContext.jsx';
import { scriptFont, glass } from '../theme.js';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await login(email, password);
      navigate(location.state?.from || '/');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Container maxWidth="xs" sx={{ pt: 14, pb: 8 }}>
      <Paper sx={{ ...glass, p: 4 }}>
        <Typography sx={{ fontFamily: scriptFont, color: '#E8654F', fontSize: 26, lineHeight: 1.2 }}>
          Welcome back
        </Typography>
        <Typography variant="h4" sx={{ mb: 1, mt: 0.5 }}>
          Sign{' '}
          <Box component="span" sx={{ color: 'primary.main', fontStyle: 'italic' }}>in</Box>
        </Typography>
        <Typography color="text.secondary" variant="body2" sx={{ mb: 3 }}>
          Sign in to track orders and check out faster.
        </Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <form onSubmit={submit}>
          <Stack spacing={2}>
            <TextField
              label="Email" type="email" required value={email}
              onChange={(e) => setEmail(e.target.value)} autoComplete="email"
            />
            <TextField
              label="Password" type="password" required value={password}
              onChange={(e) => setPassword(e.target.value)} autoComplete="current-password"
            />
            <Button type="submit" variant="contained" size="large" disabled={busy}>
              {busy ? 'Signing in…' : 'Sign in'}
            </Button>
          </Stack>
        </form>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 3 }}>
          No account yet?{' '}
          <Link component={RouterLink} to="/register">Create one</Link>
          {' '}— or just order as a guest from the menu.
        </Typography>
      </Paper>
    </Container>
  );
}
