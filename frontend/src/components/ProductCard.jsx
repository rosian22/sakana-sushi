import { useState } from 'react';
import {
  Card, CardContent, Box, Typography, Chip, Button, IconButton, Stack,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { useCart } from '../context/CartContext.jsx';
import { fmtPrice } from '../api/client.js';
import { PAPER, TAUPE } from '../theme.js';

const CATEGORY_EMOJI = {
  Rolls: '🍣',
  Nigiri: '🍤',
  Sashimi: '🐟',
  Sets: '🍱',
  Extras: '🥢',
  Drinks: '🍵',
  Desserts: '🍡',
};

// Warm-ink versions of the original gradients — darkened and pulled toward
// the SUMI NIGHT ink palette so the fallback art sits well on INK pages.
const GRADIENTS = [
  'linear-gradient(135deg, #211722 0%, #301b28 55%, #40202c 100%)',
  'linear-gradient(135deg, #14202c 0%, #1a2f3a 55%, #1e4034 100%)',
  'linear-gradient(135deg, #221a12 0%, #322516 55%, #423018 100%)',
  'linear-gradient(135deg, #191d2a 0%, #22233c 55%, #302749 100%)',
  'linear-gradient(135deg, #1c2618 0%, #26371f 55%, #2f4626 100%)',
];

const hash = (s) => [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);

export default function ProductCard({ product }) {
  const { items, add, setQty } = useCart();
  const [imgBroken, setImgBroken] = useState(false);
  const inCart = items.find((i) => i.product.id === product.id);
  const emoji = CATEGORY_EMOJI[product.category] || '🍣';
  const gradient = GRADIENTS[hash(product.name) % GRADIENTS.length];
  const showPhoto = Boolean(product.imageUrl) && !imgBroken;

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform .25s ease, box-shadow .25s ease',
        '&:hover': { transform: 'translateY(-6px)', boxShadow: '0 18px 44px rgba(0,0,0,.55)' },
      }}
    >
      <Box
        sx={{
          height: 170,
          borderRadius: '14px 14px 0 0',
          overflow: 'hidden',
          background: showPhoto ? 'transparent' : gradient,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        {showPhoto ? (
          <Box
            component="img"
            src={product.imageUrl}
            alt={product.name}
            onError={() => setImgBroken(true)}
            sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        ) : (
          <Typography sx={{ fontSize: 64, filter: 'drop-shadow(0 8px 16px rgba(0,0,0,.4))' }}>
            {emoji}
          </Typography>
        )}
        <Chip
          label={`${product.pieces} pc${product.pieces > 1 ? 's' : ''}`}
          size="small"
          sx={{
            position: 'absolute',
            top: 10,
            right: 10,
            bgcolor: 'rgba(20,18,15,.6)',
            backdropFilter: 'blur(6px)',
            color: PAPER,
          }}
        />
      </Box>

      <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Typography
          variant="h6"
          sx={{ lineHeight: 1.2, fontFamily: '"Cormorant Garamond", serif', fontWeight: 700, fontSize: 20 }}
        >
          {product.name}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ flex: 1 }}>
          {product.description}
        </Typography>
        {product.tags?.length > 0 && (
          <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap', gap: 0.5 }}>
            {product.tags.map((t) => {
              const tagColor = t === 'spicy' ? 'primary' : t.includes('veg') ? 'secondary' : 'default';
              return (
                <Chip
                  key={t}
                  label={t}
                  size="small"
                  variant="outlined"
                  color={tagColor}
                  sx={tagColor === 'default' ? { borderColor: TAUPE, color: TAUPE } : undefined}
                />
              );
            })}
          </Stack>
        )}
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mt: 0.5 }}>
          <Typography variant="h6" sx={{ color: PAPER, fontWeight: 700 }}>
            {fmtPrice(product.price)}
          </Typography>
          {inCart ? (
            <Stack direction="row" alignItems="center" spacing={0.5}>
              <IconButton size="small" onClick={() => setQty(product.id, inCart.qty - 1)} aria-label="decrease">
                <RemoveIcon fontSize="small" />
              </IconButton>
              <Typography sx={{ minWidth: 20, textAlign: 'center', fontWeight: 700 }}>{inCart.qty}</Typography>
              <IconButton size="small" onClick={() => setQty(product.id, inCart.qty + 1)} aria-label="increase">
                <AddIcon fontSize="small" />
              </IconButton>
            </Stack>
          ) : (
            <Button variant="contained" size="small" startIcon={<AddIcon />} onClick={() => add(product)}>
              Add
            </Button>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}
