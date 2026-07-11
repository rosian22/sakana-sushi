import { useEffect, useState } from 'react';
import {
  Container, Typography, Tabs, Tab, Box, Paper, Table, TableHead, TableRow, TableCell,
  TableBody, Button, IconButton, Switch, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Stack, MenuItem, Select, Chip, Alert, Snackbar, TableContainer,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import RefreshIcon from '@mui/icons-material/Refresh';
import { api, fmtPrice } from '../api/client.js';
import { STATUS_LABELS } from './OrderConfirmation.jsx';
import { scriptFont, INK_RAISED } from '../theme.js';

const CATEGORIES = ['Rolls', 'Nigiri', 'Sashimi', 'Sets', 'Extras', 'Drinks', 'Desserts'];
const STATUSES = ['Pending', 'Confirmed', 'Preparing', 'OutForDelivery', 'Delivered', 'Cancelled'];

const EMPTY_PRODUCT = {
  name: '', description: '', category: 'Rolls', price: '',
  pieces: 8, imageUrl: '', tags: '', available: true,
};

export default function Admin() {
  const [tab, setTab] = useState(0);
  const [toast, setToast] = useState('');

  return (
    <Container maxWidth="lg" sx={{ pt: 12, pb: 8 }}>
      <Typography sx={{ fontFamily: scriptFont, color: '#E8654F', fontSize: 26, lineHeight: 1.2 }}>
        Behind the counter
      </Typography>
      <Typography variant="h3" sx={{ fontSize: { xs: 32, md: 44 }, mb: 3, mt: 0.5 }}>
        Admin{' '}
        <Box component="span" sx={{ color: 'primary.main', fontStyle: 'italic' }}>panel</Box>
      </Typography>
      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3 }}>
        <Tab label="Products" />
        <Tab label="Orders" />
      </Tabs>
      {tab === 0 && <ProductsTab onToast={setToast} />}
      {tab === 1 && <OrdersTab onToast={setToast} />}
      <Snackbar
        open={!!toast} autoHideDuration={3000} onClose={() => setToast('')}
        message={toast} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Container>
  );
}

/* ── Products ─────────────────────────────────────────────────────── */

function ProductsTab({ onToast }) {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState('');
  const [dialog, setDialog] = useState(null); // { id?, ...form }
  const [busy, setBusy] = useState(false);

  const load = () =>
    api.get('/products?all=true').then(setProducts).catch((e) => setError(e.message));
  useEffect(() => { load(); }, []);

  const openCreate = () => setDialog({ ...EMPTY_PRODUCT });
  const openEdit = (p) =>
    setDialog({
      id: p.id, name: p.name, description: p.description, category: p.category,
      price: String(p.price), pieces: p.pieces, imageUrl: p.imageUrl || '',
      tags: (p.tags || []).join(', '), available: p.available,
    });

  const save = async () => {
    setBusy(true);
    setError('');
    const body = {
      name: dialog.name,
      description: dialog.description,
      category: dialog.category,
      price: parseFloat(dialog.price),
      pieces: parseInt(dialog.pieces, 10) || 1,
      imageUrl: dialog.imageUrl || null,
      tags: dialog.tags.split(',').map((t) => t.trim()).filter(Boolean),
      available: dialog.available,
    };
    try {
      if (dialog.id) {
        await api.put(`/products/${dialog.id}`, body);
        onToast('Product updated');
      } else {
        await api.post('/products', body);
        onToast('Product created');
      }
      setDialog(null);
      load();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  const toggleAvailable = async (p) => {
    try {
      await api.put(`/products/${p.id}`, { ...p, available: !p.available });
      setProducts((prev) => prev.map((x) => (x.id === p.id ? { ...x, available: !p.available } : x)));
    } catch (e) {
      setError(e.message);
    }
  };

  const remove = async (p) => {
    if (!window.confirm(`Delete "${p.name}"?`)) return;
    try {
      await api.delete(`/products/${p.id}`);
      onToast('Product deleted');
      load();
    } catch (e) {
      setError(e.message);
    }
  };

  const valid = dialog && dialog.name.trim() && parseFloat(dialog.price) > 0;

  return (
    <>
      <Stack direction="row" justifyContent="space-between" sx={{ mb: 2 }}>
        <Button startIcon={<RefreshIcon />} onClick={load}>Refresh</Button>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>Add product</Button>
      </Stack>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <TableContainer component={Paper} sx={{ bgcolor: INK_RAISED }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Category</TableCell>
              <TableCell align="right">Price</TableCell>
              <TableCell align="right">Pieces</TableCell>
              <TableCell align="center">Available</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {products.map((p) => (
              <TableRow key={p.id} hover>
                <TableCell sx={{ fontWeight: 600 }}>{p.name}</TableCell>
                <TableCell><Chip size="small" label={p.category} /></TableCell>
                <TableCell align="right">{fmtPrice(p.price)}</TableCell>
                <TableCell align="right">{p.pieces}</TableCell>
                <TableCell align="center">
                  <Switch size="small" checked={p.available} onChange={() => toggleAvailable(p)} />
                </TableCell>
                <TableCell align="right">
                  <IconButton size="small" onClick={() => openEdit(p)} aria-label="edit">
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" onClick={() => remove(p)} aria-label="delete">
                    <DeleteOutlineIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog
        open={!!dialog} onClose={() => setDialog(null)} fullWidth maxWidth="sm"
        PaperProps={{ sx: { bgcolor: INK_RAISED } }}
      >
        <DialogTitle>{dialog?.id ? 'Edit product' : 'New product'}</DialogTitle>
        {dialog && (
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField label="Name" required value={dialog.name}
                onChange={(e) => setDialog({ ...dialog, name: e.target.value })} />
              <TextField label="Description" multiline minRows={2} value={dialog.description}
                onChange={(e) => setDialog({ ...dialog, description: e.target.value })} />
              <Stack direction="row" spacing={2}>
                <TextField select label="Category" fullWidth value={dialog.category}
                  onChange={(e) => setDialog({ ...dialog, category: e.target.value })}>
                  {CATEGORIES.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                </TextField>
                <TextField label="Price" required fullWidth type="number"
                  inputProps={{ step: '0.10', min: '0' }} value={dialog.price}
                  onChange={(e) => setDialog({ ...dialog, price: e.target.value })} />
                <TextField label="Pieces" fullWidth type="number"
                  inputProps={{ min: '1' }} value={dialog.pieces}
                  onChange={(e) => setDialog({ ...dialog, pieces: e.target.value })} />
              </Stack>
              <TextField label="Image URL (optional)" value={dialog.imageUrl}
                onChange={(e) => setDialog({ ...dialog, imageUrl: e.target.value })}
                helperText="Leave empty for the built-in artwork" />
              <TextField label="Tags (comma separated)" value={dialog.tags}
                onChange={(e) => setDialog({ ...dialog, tags: e.target.value })}
                helperText="e.g. spicy, vegan, bestseller" />
              <Stack direction="row" alignItems="center" spacing={1}>
                <Switch checked={dialog.available}
                  onChange={(e) => setDialog({ ...dialog, available: e.target.checked })} />
                <Typography>Available for ordering</Typography>
              </Stack>
            </Stack>
          </DialogContent>
        )}
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDialog(null)}>Cancel</Button>
          <Button variant="contained" disabled={!valid || busy} onClick={save}>
            {busy ? 'Saving…' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

/* ── Orders ───────────────────────────────────────────────────────── */

function OrdersTab({ onToast }) {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState(null);

  const load = () => api.get('/orders').then(setOrders).catch((e) => setError(e.message));
  useEffect(() => { load(); }, []);

  const setStatus = async (order, status) => {
    try {
      const updated = await api.patch(`/orders/${order.id}/status`, { status });
      setOrders((prev) => prev.map((o) => (o.id === order.id ? updated : o)));
      if (selected?.id === order.id) setSelected(updated);
      onToast(`Order #${order.id.slice(-6).toUpperCase()} → ${STATUS_LABELS[status]}`);
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <>
      <Stack direction="row" justifyContent="flex-end" sx={{ mb: 2 }}>
        <Button startIcon={<RefreshIcon />} onClick={load}>Refresh</Button>
      </Stack>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <TableContainer component={Paper} sx={{ bgcolor: INK_RAISED }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Order</TableCell>
              <TableCell>Customer</TableCell>
              <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>Placed</TableCell>
              <TableCell align="right">Total</TableCell>
              <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>Payment</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.map((o) => (
              <TableRow key={o.id} hover sx={{ cursor: 'pointer' }} onClick={() => setSelected(o)}>
                <TableCell sx={{ fontWeight: 600 }}>#{o.id.slice(-6).toUpperCase()}</TableCell>
                <TableCell>{o.customerName}</TableCell>
                <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                  {new Date(o.createdAt).toLocaleString()}
                </TableCell>
                <TableCell align="right">{fmtPrice(o.total)}</TableCell>
                <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                  <Chip size="small" label={o.paymentStatus} />
                </TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <Select
                    size="small" value={o.status} variant="standard" disableUnderline
                    onChange={(e) => setStatus(o, e.target.value)}
                    sx={{ fontSize: 14 }}
                  >
                    {STATUSES.map((s) => (
                      <MenuItem key={s} value={s}>{STATUS_LABELS[s]}</MenuItem>
                    ))}
                  </Select>
                </TableCell>
              </TableRow>
            ))}
            {orders.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                  No orders yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog
        open={!!selected} onClose={() => setSelected(null)} fullWidth maxWidth="sm"
        PaperProps={{ sx: { bgcolor: INK_RAISED } }}
      >
        {selected && (
          <>
            <DialogTitle>Order #{selected.id.slice(-6).toUpperCase()}</DialogTitle>
            <DialogContent>
              <Stack spacing={1.5}>
                <Box>
                  <Typography variant="body2" color="text.secondary">Customer</Typography>
                  <Typography>{selected.customerName} · {selected.phone}</Typography>
                  <Typography variant="body2">{selected.email}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">Deliver to</Typography>
                  <Typography>
                    {selected.street}, {selected.city}{selected.zip ? `, ${selected.zip}` : ''}
                  </Typography>
                  {selected.notes && (
                    <Typography variant="body2" color="text.secondary">“{selected.notes}”</Typography>
                  )}
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">Items</Typography>
                  {selected.items.map((i) => (
                    <Stack key={i.productId} direction="row" justifyContent="space-between">
                      <Typography variant="body2">{i.quantity} × {i.name}</Typography>
                      <Typography variant="body2">{fmtPrice(i.unitPrice * i.quantity)}</Typography>
                    </Stack>
                  ))}
                </Box>
                <Stack direction="row" justifyContent="space-between">
                  <Typography fontWeight={700}>Total</Typography>
                  <Typography fontWeight={700}>{fmtPrice(selected.total)}</Typography>
                </Stack>
                <Stack direction="row" spacing={1}>
                  <Chip size="small" label={`Payment: ${selected.paymentMethod}`} />
                  <Chip size="small" label={selected.paymentStatus} />
                </Stack>
              </Stack>
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
              <Button onClick={() => setSelected(null)}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </>
  );
}
