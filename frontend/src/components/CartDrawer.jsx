import { useNavigate } from 'react-router-dom';
import {
  Drawer, Box, Typography, IconButton, Stack, Divider, Button, Chip,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import { useCart } from '../context/CartContext.jsx';
import { fmtPrice, FREE_DELIVERY_OVER } from '../api/client.js';

export default function CartDrawer() {
  const { items, open, setOpen, setQty, remove, subtotal, deliveryFee, total } = useCart();
  const navigate = useNavigate();

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={() => setOpen(false)}
      PaperProps={{ sx: { bgcolor: '#1D1A16' } }}
    >
      <Box sx={{ width: { xs: '100vw', sm: 400 }, display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ p: 2 }}>
          <Typography
            variant="h6"
            sx={{ fontFamily: '"Cormorant Garamond", serif', fontWeight: 700, fontSize: 24 }}
          >
            Your order
          </Typography>
          <IconButton onClick={() => setOpen(false)} aria-label="close cart"><CloseIcon /></IconButton>
        </Stack>
        <Divider />

        {items.length === 0 ? (
          <Stack alignItems="center" justifyContent="center" sx={{ flex: 1, gap: 2, p: 4 }}>
            <ShoppingBagOutlinedIcon sx={{ fontSize: 64, color: 'text.secondary' }} />
            <Typography color="text.secondary">Your cart is empty</Typography>
            <Button variant="contained" onClick={() => { setOpen(false); navigate('/menu'); }}>
              Browse the menu
            </Button>
          </Stack>
        ) : (
          <>
            <Box sx={{ flex: 1, overflowY: 'auto', px: 2 }}>
              {items.map(({ product, qty }) => (
                <Stack key={product.id} direction="row" alignItems="center" spacing={1} sx={{ py: 1.5 }}>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography noWrap fontWeight={600}>{product.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {fmtPrice(product.price)} × {qty}
                    </Typography>
                  </Box>
                  <IconButton size="small" onClick={() => setQty(product.id, qty - 1)} aria-label="decrease">
                    <RemoveIcon fontSize="small" />
                  </IconButton>
                  <Typography sx={{ minWidth: 18, textAlign: 'center' }}>{qty}</Typography>
                  <IconButton size="small" onClick={() => setQty(product.id, qty + 1)} aria-label="increase">
                    <AddIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" onClick={() => remove(product.id)} aria-label="remove">
                    <DeleteOutlineIcon fontSize="small" />
                  </IconButton>
                </Stack>
              ))}
            </Box>

            <Divider />
            <Box sx={{ p: 2 }}>
              {deliveryFee > 0 && (
                <Chip
                  size="small"
                  color="secondary"
                  variant="outlined"
                  label={`Add ${fmtPrice(FREE_DELIVERY_OVER - subtotal)} more for free delivery`}
                  sx={{ mb: 1.5 }}
                />
              )}
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
                <Typography variant="h6" sx={{ color: 'text.primary', fontWeight: 700 }}>
                  {fmtPrice(total)}
                </Typography>
              </Stack>
              <Button
                fullWidth
                variant="contained"
                size="large"
                sx={{ mt: 2 }}
                onClick={() => { setOpen(false); navigate('/checkout'); }}
              >
                Checkout
              </Button>
            </Box>
          </>
        )}
      </Box>
    </Drawer>
  );
}
