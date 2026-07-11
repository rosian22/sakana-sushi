import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container, Typography, Paper, Stack, Chip, Button, Skeleton, Alert, Divider, Box,
} from '@mui/material';
import { api, fmtPrice } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import { STATUS_LABELS } from './OrderConfirmation.jsx';
import { scriptFont, glass } from '../theme.js';

const STATUS_COLOR = {
  Pending: 'default',
  Confirmed: 'info',
  Preparing: 'warning',
  OutForDelivery: 'secondary',
  Delivered: 'success',
  Cancelled: 'error',
};

export default function Account() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/orders/mine').then(setOrders).catch((e) => setError(e.message));
  }, []);

  return (
    <Container maxWidth="md" sx={{ pt: 12, pb: 8 }}>
      <Typography sx={{ fontFamily: scriptFont, color: '#E8654F', fontSize: 26, lineHeight: 1.2 }}>
        Your table
      </Typography>
      <Typography variant="h3" sx={{ fontSize: { xs: 32, md: 44 }, mb: 1, mt: 0.5 }}>
        Hi,{' '}
        <Box component="span" sx={{ color: 'primary.main', fontStyle: 'italic' }}>
          {user?.name?.split(' ')[0]}
        </Box>
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 4 }}>{user?.email}</Typography>

      <Typography variant="h5" sx={{ mb: 2 }}>Order history</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {orders === null && <Skeleton variant="rounded" height={120} />}

      {orders?.length === 0 && (
        <Paper sx={{ ...glass, p: 4, textAlign: 'center' }}>
          <Typography color="text.secondary" sx={{ mb: 2 }}>No orders yet.</Typography>
          <Button variant="contained" onClick={() => navigate('/menu')}>Order your first sushi</Button>
        </Paper>
      )}

      <Stack spacing={2}>
        {orders?.map((order) => (
          <Paper
            key={order.id}
            sx={{ ...glass, p: 2.5, cursor: 'pointer', '&:hover': { borderColor: 'primary.main' } }}
            variant="outlined"
            onClick={() => navigate(`/order/${order.id}`)}
          >
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              justifyContent="space-between"
              alignItems={{ sm: 'center' }}
              spacing={1}
            >
              <Stack>
                <Typography fontWeight={700}>
                  #{order.id.slice(-6).toUpperCase()} · {fmtPrice(order.total)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {new Date(order.createdAt).toLocaleString()} ·{' '}
                  {order.items.reduce((n, i) => n + i.quantity, 0)} items
                </Typography>
              </Stack>
              <Chip
                label={STATUS_LABELS[order.status] || order.status}
                color={STATUS_COLOR[order.status] || 'default'}
                size="small"
              />
            </Stack>
            <Divider sx={{ my: 1.5 }} />
            <Typography variant="body2" color="text.secondary" noWrap>
              {order.items.map((i) => `${i.quantity}× ${i.name}`).join(', ')}
            </Typography>
          </Paper>
        ))}
      </Stack>
    </Container>
  );
}
