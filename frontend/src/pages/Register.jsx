import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Container, Paper, Typography, TextField, Button, Alert, Stack, Link, Box,
} from '@mui/material';
import { useAuth } from '../context/AuthContext.jsx';
import { scriptFont, glass } from '../theme.js';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await register(form.name, form.email, form.password, form.phone || null);
      navigate('/');
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
          Join us
        </Typography>
        <Typography variant="h4" sx={{ mb: 1, mt: 0.5 }}>
          Create{' '}
          <Box component="span" sx={{ color: 'primary.main', fontStyle: 'italic' }}>account</Box>
        </Typography>
        <Typography color="text.secondary" variant="body2" sx={{ mb: 3 }}>
          Save your details and see your order history.
        </Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <form onSubmit={submit}>
          <Stack spacing={2}>
            <TextField label="Name" required value={form.name} onChange={set('name')} autoComplete="name" />
            <TextField label="Email" type="email" required value={form.email} onChange={set('email')} autoComplete="email" />
            <TextField label="Phone (optional)" value={form.phone} onChange={set('phone')} autoComplete="tel" />
            <TextField
              label="Password" type="password" required value={form.password}
              onChange={set('password')} autoComplete="new-password"
              helperText="At least 8 characters"
            />
            <Button type="submit" variant="contained" size="large" disabled={busy}>
              {busy ? 'Creating…' : 'Create account'}
            </Button>
          </Stack>
        </form>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 3 }}>
          Already registered? <Link component={RouterLink} to="/login">Sign in</Link>
        </Typography>
      </Paper>
    </Container>
  );
}
