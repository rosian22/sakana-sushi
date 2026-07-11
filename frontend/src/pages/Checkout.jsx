import { useEffect, useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Container, Typography, Grid, Paper, Stack, TextField, Button, Alert,
  Stepper, Step, StepLabel, Radio, RadioGroup, FormControlLabel, Divider, Link, CircularProgress,
} from '@mui/material';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { api, fmtPrice } from '../api/client.js';
import { scriptFont, PAPER, glass } from '../theme.js';

const STEPS = ['Contact', 'Delivery', 'Payment'];

export default function Checkout() {
  const { items, subtotal, deliveryFee, total, clear } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [methods, setMethods] = useState(null);
  const [form, setForm] = useState({
    customerName: '', email: '', phone: '',
    street: '', city: '', zip: '', notes: '',
    paymentMethod: '',
  });
  const [error, setError] = useState('');
  const [placing, setPlacing] = useState(false);

  // Prefill from the logged-in account.
  useEffect(() => {
    if (user) {
      setForm((f) => ({
        ...f,
        customerName: f.customerName || user.name,
        email: f.email || user.email,
        phone: f.phone || user.phone || '',
      }));
    }
  }, [user]);

  useEffect(() => {
    api.get('/payments/methods')
      .then((m) => {
        setMethods(m);
        setForm((f) => ({ ...f, paymentMethod: f.paymentMethod || m[0]?.id || '' }));
      })
      .catch((e) => setError(e.message));
  }, []);

  if (items.length === 0 && !placing) {
    return (
      <Container maxWidth="sm" sx={{ pt: 14, textAlign: 'center' }}>
        <Typography variant="h4" sx={{ mb: 2 }}>Your cart is empty</Typography>
        <Button variant="contained" onClick={() => navigate('/menu')}>Go to the menu</Button>
      </Container>
    );
  }

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const stepValid = () => {
    if (step === 0) return form.customerName.trim() && form.email.trim() && form.phone.trim();
    if (step === 1) return form.street.trim() && form.city.trim();
    return !!form.paymentMethod;
  };

  const placeOrder = async () => {
    setError('');
    setPlacing(true);
    try {
      const { order, redirectUrl } = await api.post('/orders', {
        items: items.map((i) => ({ productId: i.product.id, quantity: i.qty })),
        ...form,
        zip: form.zip || null,
        notes: form.notes || null,
      });
      clear();
      if (redirectUrl) {
        // Online processors (once configured) hand back a hosted payment page.
        window.location.href = redirectUrl;
      } else {
        navigate(`/order/${order.id}?email=${encodeURIComponent(order.email)}`);
      }
    } catch (err) {
      setError(err.message);
      setPlacing(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ pt: 12, pb: 8 }}>
      <Typography sx={{ fontFamily: scriptFont, color: '#E8654F', fontSize: 26, lineHeight: 1.2 }}>
        Almost there
      </Typography>
      <Typography variant="h3" sx={{ fontSize: { xs: 32, md: 44 }, mb: 4, mt: 0.5 }}>Checkout</Typography>

      <Grid container spacing={4}>
        <Grid item xs={12} md={7}>
          <Paper sx={{ ...glass, p: { xs: 2.5, md: 4 } }}>
            <Stepper activeStep={step} sx={{ mb: 4 }}>
              {STEPS.map((label) => (
                <Step key={label}><StepLabel>{label}</StepLabel></Step>
              ))}
            </Stepper>

            {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

            {step === 0 && (
              <Stack spacing={2}>
                {!user && (
                  <Alert severity="info" variant="outlined">
                    Ordering as a guest.{' '}
                    <Link component={RouterLink} to="/login" state={{ from: '/checkout' }}>
                      Sign in
                    </Link>{' '}
                    to save your details for next time.
                  </Alert>
                )}
                <TextField label="Full name" required value={form.customerName} onChange={set('customerName')} />
                <TextField label="Email" type="email" required value={form.email} onChange={set('email')}
                  helperText="Used for the order confirmation and tracking link" />
                <TextField label="Phone" required value={form.phone} onChange={set('phone')} />
              </Stack>
            )}

            {step === 1 && (
              <Stack spacing={2}>
                <TextField label="Street & number" required value={form.street} onChange={set('street')} />
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <TextField label="City" required fullWidth value={form.city} onChange={set('city')} />
                  <TextField label="Zip (optional)" fullWidth value={form.zip} onChange={set('zip')} />
                </Stack>
                <TextField
                  label="Delivery notes (optional)" multiline minRows={2}
                  value={form.notes} onChange={set('notes')}
                  placeholder="Ring twice, no wasabi, extra chopsticks…"
                />
              </Stack>
            )}

            {step === 2 && (
              methods === null ? (
                <Stack alignItems="center" sx={{ py: 4 }}><CircularProgress /></Stack>
              ) : (
                <RadioGroup value={form.paymentMethod} onChange={set('paymentMethod')}>
                  <Stack spacing={1.5}>
                    {methods.map((m) => (
                      <Paper
                        key={m.id}
                        variant="outlined"
                        sx={{
                          p: 2,
                          borderColor: form.paymentMethod === m.id ? 'primary.main' : 'rgba(245,241,232,.15)',
                          cursor: 'pointer',
                        }}
                        onClick={() => setForm((f) => ({ ...f, paymentMethod: m.id }))}
                      >
                        <FormControlLabel
                          value={m.id}
                          control={<Radio />}
                          sx={{ width: '100%', m: 0 }}
                          label={
                            <Stack>
                              <Typography fontWeight={600}>{m.name}</Typography>
                              <Typography variant="body2" color="text.secondary">{m.description}</Typography>
                            </Stack>
                          }
                        />
                      </Paper>
                    ))}
                    <Typography variant="body2" color="text.secondary">
                      Online card payment will appear here automatically once a payment
                      processor is connected.
                    </Typography>
                  </Stack>
                </RadioGroup>
              )
            )}

            <Stack direction="row" justifyContent="space-between" sx={{ mt: 4 }}>
              <Button disabled={step === 0 || placing} onClick={() => setStep((s) => s - 1)}>
                Back
              </Button>
              {step < STEPS.length - 1 ? (
                <Button variant="contained" disabled={!stepValid()} onClick={() => setStep((s) => s + 1)}>
                  Continue
                </Button>
              ) : (
                <Button variant="contained" size="large" disabled={!stepValid() || placing} onClick={placeOrder}>
                  {placing ? 'Placing order…' : `Place order · ${fmtPrice(total)}`}
                </Button>
              )}
            </Stack>
          </Paper>
        </Grid>

        <Grid item xs={12} md={5}>
          <Paper sx={{ ...glass, p: 3, position: { md: 'sticky' }, top: { md: 96 } }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Order summary</Typography>
            <Stack spacing={1}>
              {items.map(({ product, qty }) => (
                <Stack key={product.id} direction="row" justifyContent="space-between">
                  <Typography variant="body2">{qty} × {product.name}</Typography>
                  <Typography variant="body2">{fmtPrice(product.price * qty)}</Typography>
                </Stack>
              ))}
            </Stack>
            <Divider sx={{ my: 2 }} />
            <Stack direction="row" justifyContent="space-between">
              <Typography color="text.secondary">Subtotal</Typography>
              <Typography>{fmtPrice(subtotal)}</Typography>
            </Stack>
            <Stack direction="row" justifyContent="space-between">
              <Typography color="text.secondary">Delivery</Typography>
              <Typography>{deliveryFee === 0 ? 'Free' : fmtPrice(deliveryFee)}</Typography>
            </Stack>
            <Stack direction="row" justifyContent="space-between" sx={{ mt: 1 }}>
              <Typography variant="h6">Total</Typography>
              <Typography variant="h6" sx={{ color: PAPER, fontWeight: 700 }}>{fmtPrice(total)}</Typography>
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}
