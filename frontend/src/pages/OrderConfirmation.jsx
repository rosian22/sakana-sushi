import { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import {
  Container, Paper, Typography, Stack, Divider, Alert, Button, Chip,
  Stepper, Step, StepLabel, CircularProgress, Box,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { api, fmtPrice } from '../api/client.js';
import { scriptFont, PAPER, glass } from '../theme.js';

export const STATUS_LABELS = {
  Pending: 'Order received',
  Confirmed: 'Confirmed',
  Preparing: 'Preparing',
  OutForDelivery: 'Out for delivery',
  Delivered: 'Delivered',
  Cancelled: 'Cancelled',
};

const FLOW = ['Pending', 'Confirmed', 'Preparing', 'OutForDelivery', 'Delivered'];

const PAYMENT_LABELS = {
  cod: 'Cash on delivery',
  card_delivery: 'Card on delivery',
  stripe: 'Online card payment',
};

export default function OrderConfirmation() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const email = params.get('email');
    const query = email ? `?email=${encodeURIComponent(email)}` : '';
    api.get(`/orders/${id}${query}`)
      .then(setOrder)
      .catch(() => setError('Order not found.'));
  }, [id, params]);

  if (error) {
    return (
      <Container maxWidth="sm" sx={{ pt: 14, textAlign: 'center' }}>
        <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
        <Button variant="contained" onClick={() => navigate('/')}>Back home</Button>
      </Container>
    );
  }
  if (!order) {
    return (
      <Container sx={{ pt: 16, textAlign: 'center' }}><CircularProgress /></Container>
    );
  }

  const cancelled = order.status === 'Cancelled';
  const activeStep = Math.max(FLOW.indexOf(order.status), 0);

  return (
    <Container maxWidth="md" sx={{ pt: 12, pb: 8 }}>
      <Stack alignItems="center" spacing={1} sx={{ mb: 4, textAlign: 'center' }}>
        <CheckCircleIcon color="secondary" sx={{ fontSize: 56 }} />
        <Typography sx={{ fontFamily: scriptFont, color: '#E8654F', fontSize: 26, lineHeight: 1.2 }}>
          Arigatō!
        </Typography>
        <Typography variant="h3" sx={{ fontSize: { xs: 30, md: 42 } }}>
          Thank you,{' '}
          <Box component="span" sx={{ color: 'primary.main', fontStyle: 'italic' }}>
            {order.customerName.split(' ')[0]}
          </Box>
          !
        </Typography>
        <Typography color="text.secondary">
          Order <b>#{order.id.slice(-6).toUpperCase()}</b> · a confirmation was sent to {order.email}
        </Typography>
      </Stack>

      <Paper sx={{ ...glass, p: { xs: 2.5, md: 4 }, mb: 3 }}>
        {cancelled ? (
          <Alert severity="warning">This order has been cancelled.</Alert>
        ) : (
          <Stepper
            activeStep={activeStep}
            alternativeLabel
            sx={{ '& .MuiStepLabel-label': { fontSize: { xs: 11, md: 14 } } }}
          >
            {FLOW.map((s) => (
              <Step key={s} completed={FLOW.indexOf(s) < activeStep || order.status === 'Delivered'}>
                <StepLabel>{STATUS_LABELS[s]}</StepLabel>
              </Step>
            ))}
          </Stepper>
        )}
      </Paper>

      <Paper sx={{ ...glass, p: { xs: 2.5, md: 4 } }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Order details</Typography>
        <Stack spacing={1}>
          {order.items.map((item) => (
            <Stack key={item.productId} direction="row" justifyContent="space-between">
              <Typography variant="body2">{item.quantity} × {item.name}</Typography>
              <Typography variant="body2">{fmtPrice(item.unitPrice * item.quantity)}</Typography>
            </Stack>
          ))}
        </Stack>
        <Divider sx={{ my: 2 }} />
        <Stack direction="row" justifyContent="space-between">
          <Typography color="text.secondary">Subtotal</Typography>
          <Typography>{fmtPrice(order.subtotal)}</Typography>
        </Stack>
        <Stack direction="row" justifyContent="space-between">
          <Typography color="text.secondary">Delivery</Typography>
          <Typography>{order.deliveryFee === 0 ? 'Free' : fmtPrice(order.deliveryFee)}</Typography>
        </Stack>
        <Stack direction="row" justifyContent="space-between" sx={{ mt: 1, mb: 2 }}>
          <Typography variant="h6">Total</Typography>
          <Typography variant="h6" sx={{ color: PAPER, fontWeight: 700 }}>{fmtPrice(order.total)}</Typography>
        </Stack>
        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
          <Chip size="small" label={PAYMENT_LABELS[order.paymentMethod] || order.paymentMethod} />
          <Chip size="small" variant="outlined" label={`Deliver to: ${order.street}, ${order.city}`} />
        </Stack>
      </Paper>

      <Stack direction="row" justifyContent="center" sx={{ mt: 4 }}>
        <Button variant="outlined" onClick={() => navigate('/menu')}>Order something else</Button>
      </Stack>
    </Container>
  );
}
