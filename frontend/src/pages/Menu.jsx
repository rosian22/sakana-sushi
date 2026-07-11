import { useEffect, useMemo, useState } from 'react';
import {
  Container, Typography, Grid, Chip, Stack, TextField, InputAdornment, Skeleton, Alert, Box,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ProductCard from '../components/ProductCard.jsx';
import { api } from '../api/client.js';
import { scriptFont, PAPER } from '../theme.js';

export default function Menu() {
  const [products, setProducts] = useState(null);
  const [error, setError] = useState('');
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get('/products').then(setProducts).catch((e) => setError(e.message));
  }, []);

  const categories = useMemo(
    () => ['All', ...new Set((products || []).map((p) => p.category))],
    [products]
  );

  const filtered = useMemo(() => {
    if (!products) return [];
    const q = search.trim().toLowerCase();
    return products.filter(
      (p) =>
        (category === 'All' || p.category === category) &&
        (!q || p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q))
    );
  }, [products, category, search]);

  return (
    <Container maxWidth="lg" sx={{ pt: 12, pb: 6 }}>
      <Typography sx={{ fontFamily: scriptFont, color: '#E8654F', fontSize: 28, lineHeight: 1.2, mb: 0.5 }}>
        The menu
      </Typography>
      <Typography variant="h2" sx={{ fontSize: { xs: 36, md: 56 }, mb: 1 }}>
        Our{' '}
        <Box component="span" sx={{ color: 'primary.main', fontStyle: 'italic' }}>menu</Box>
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 4 }}>
        Everything is prepared fresh after you order.
      </Typography>

      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={2}
        alignItems={{ md: 'center' }}
        sx={{ mb: 4 }}
      >
        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1, flex: 1 }}>
          {categories.map((c) => (
            <Chip
              key={c}
              label={c}
              color={category === c ? 'primary' : 'default'}
              variant={category === c ? 'filled' : 'outlined'}
              onClick={() => setCategory(c)}
              sx={category === c ? undefined : { borderColor: 'rgba(245,241,232,.25)', color: PAPER }}
            />
          ))}
        </Stack>
        <TextField
          size="small"
          placeholder="Search…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ minWidth: { md: 260 } }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment>
            ),
          }}
        />
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <Grid container spacing={3}>
        {products === null
          ? Array.from({ length: 8 }).map((_, i) => (
              <Grid item xs={12} sm={6} md={3} key={i}>
                <Skeleton variant="rounded" height={320} />
              </Grid>
            ))
          : filtered.map((p) => (
              <Grid item xs={12} sm={6} md={3} key={p.id}>
                <ProductCard product={p} />
              </Grid>
            ))}
      </Grid>

      {products && filtered.length === 0 && (
        <Typography color="text.secondary" textAlign="center" sx={{ py: 8 }}>
          Nothing matches your search.
        </Typography>
      )}
    </Container>
  );
}
