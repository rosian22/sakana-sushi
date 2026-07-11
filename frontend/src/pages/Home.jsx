import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Container, Typography, Button, Stack, Grid } from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import SetMealOutlinedIcon from '@mui/icons-material/SetMealOutlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined';
import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined';
import useParallax from '../hooks/useParallax.js';
import ProductCard from '../components/ProductCard.jsx';
import { api } from '../api/client.js';
import { INK, PAPER, TAUPE, GOLD, glass, scriptFont } from '../theme.js';

const HERO_IMG = 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=1920&q=80&auto=format&fit=crop';
const ABOUT_IMG = 'https://images.unsplash.com/photo-1553621042-f6e147245754?w=1000&q=80&auto=format&fit=crop';
const BAND_IMG = 'https://images.unsplash.com/photo-1611143669185-af224c5e3252?w=1920&q=80&auto=format&fit=crop';

// Photo-frame treatment shared by section imagery.
const photoFrame = {
  borderRadius: '24px',
  border: '1px solid rgba(245,241,232,0.12)',
  boxShadow: '0 24px 60px rgba(0,0,0,.5)',
};

const TRUST_BADGES = [
  { icon: <SetMealOutlinedIcon sx={{ fontSize: 20 }} />, title: 'Sashimi-grade', caption: 'fish cut daily' },
  { icon: <LocalShippingOutlinedIcon sx={{ fontSize: 20 }} />, title: 'Free delivery', caption: 'on orders $35+' },
  { icon: <AutoAwesomeOutlinedIcon sx={{ fontSize: 20 }} />, title: 'Handmade', caption: 'rolled to order' },
];

const CHECKLIST = [
  'Sustainably sourced fish',
  'Rice seasoned the Edo way',
  'Rolled after you order — never before',
  'At your door in about 40 minutes',
];

const FEATURES = [
  { icon: <LocalShippingOutlinedIcon sx={{ fontSize: 30 }} />, title: 'Free delivery', caption: 'on orders over $35' },
  { icon: <AccessTimeOutlinedIcon sx={{ fontSize: 30 }} />, title: 'Fresh & fast', caption: '~40 min average' },
  { icon: <VerifiedUserOutlinedIcon sx={{ fontSize: 30 }} />, title: 'Secure checkout', caption: 'pay on delivery today, online soon' },
  { icon: <AutoAwesomeOutlinedIcon sx={{ fontSize: 30 }} />, title: 'Loyalty rewards', caption: 'coming soon' },
];

// Script-font eyebrow line above each section heading.
function Eyebrow({ children, color = '#E8654F', sx = {} }) {
  return (
    <Typography
      component="p"
      sx={{ fontFamily: scriptFont, color, fontSize: { xs: 26, md: 32 }, lineHeight: 1.2, mb: 1, ...sx }}
    >
      {children}
    </Typography>
  );
}

export default function Home() {
  const scrollY = useParallax();
  const navigate = useNavigate();
  const [featured, setFeatured] = useState([]);

  // Respect prefers-reduced-motion: all parallax speeds collapse to 0.
  const reduced =
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const spd = (speed) => (reduced ? 0 : speed);

  // Measure where the photo band sits so its parallax stays centered on it.
  const bandRef = useRef(null);
  const [bandCenter, setBandCenter] = useState(2200);
  useEffect(() => {
    const measure = () => {
      if (bandRef.current) {
        setBandCenter(
          bandRef.current.offsetTop + bandRef.current.offsetHeight / 2 - window.innerHeight / 2
        );
      }
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [featured]);

  useEffect(() => {
    api.get('/products')
      .then((products) => setFeatured(
        products.filter((p) => p.tags?.includes('bestseller')).slice(0, 4).length >= 3
          ? products.filter((p) => p.tags?.includes('bestseller')).slice(0, 4)
          : products.slice(0, 4)
      ))
      .catch(() => {});
  }, []);

  return (
    <Box>
      {/* ── 1 · HERO ─────────────────────────────────────────────────── */}
      <Box
        sx={{
          position: 'relative',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          overflow: 'hidden',
        }}
      >
        {/* Parallax photo layer (oversized so edges never show) */}
        <Box
          aria-hidden
          sx={{
            position: 'absolute',
            inset: '-12% 0',
            zIndex: 0,
            backgroundImage: `url(${HERO_IMG})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            transform: `translate3d(0, ${scrollY * spd(0.25)}px, 0)`,
            willChange: 'transform',
          }}
        />
        {/* Left-readability overlay */}
        <Box
          aria-hidden
          sx={{
            position: 'absolute',
            inset: 0,
            zIndex: 1,
            background:
              'linear-gradient(90deg, rgba(20,18,15,.94) 0%, rgba(20,18,15,.6) 45%, rgba(20,18,15,.25) 100%)',
          }}
        />
        {/* Bottom fade into page ink */}
        <Box
          aria-hidden
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 180,
            zIndex: 1,
            background: `linear-gradient(transparent, ${INK})`,
          }}
        />

        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2, py: { xs: 12, md: 14 } }}>
          <Eyebrow>Fresh. Handmade. Perfect.</Eyebrow>
          <Typography
            variant="h1"
            sx={{ fontSize: { xs: 44, sm: 60, md: 78 }, lineHeight: 1.05, mb: 2.5, maxWidth: 700 }}
          >
            Experience{' '}
            <Box component="span" sx={{ color: 'primary.main', fontStyle: 'italic' }}>sushi</Box>
            {' '}like never before
          </Typography>
          <Typography sx={{ color: TAUPE, maxWidth: '52ch', mb: 4, fontSize: { xs: 16, md: 18 } }}>
            Sashimi-grade fish, rice seasoned the Edo way — every roll is made by hand
            minutes before the courier leaves, so it lands at your door tasting like the counter.
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 5 }}>
            <Button
              size="large"
              variant="contained"
              endIcon={<ArrowForwardIcon />}
              onClick={() => navigate('/menu')}
              sx={{ px: 4.5, py: 1.5, fontSize: 16 }}
            >
              Explore menu
            </Button>
            <Button
              size="large"
              variant="outlined"
              onClick={() =>
                document.getElementById('how-it-works')?.scrollIntoView({
                  behavior: reduced ? 'auto' : 'smooth',
                })
              }
              sx={{ px: 4.5, py: 1.5, fontSize: 16 }}
            >
              How it works
            </Button>
          </Stack>

          {/* Trust badges */}
          <Stack direction="row" spacing={{ xs: 2.5, md: 4 }} useFlexGap flexWrap="wrap">
            {TRUST_BADGES.map((b) => (
              <Stack key={b.title} direction="row" spacing={1.5} alignItems="center">
                <Box
                  sx={{
                    ...glass,
                    borderRadius: '50%',
                    width: 40,
                    height: 40,
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: GOLD,
                  }}
                >
                  {b.icon}
                </Box>
                <Box>
                  <Typography sx={{ color: PAPER, fontWeight: 700, fontSize: 13, lineHeight: 1.3 }}>
                    {b.title}
                  </Typography>
                  <Typography sx={{ color: TAUPE, fontSize: 12, lineHeight: 1.3 }}>
                    {b.caption}
                  </Typography>
                </Box>
              </Stack>
            ))}
          </Stack>
        </Container>
      </Box>

      {/* ── 2 · ABOUT ────────────────────────────────────────────────── */}
      <Container maxWidth="lg" sx={{ py: { xs: 8, md: 12 } }}>
        <Grid container spacing={{ xs: 5, md: 8 }} alignItems="center">
          <Grid item xs={12} md={6}>
            <Box
              component="img"
              src={ABOUT_IMG}
              alt="Chef slicing sashimi-grade fish"
              sx={{
                ...photoFrame,
                width: '100%',
                display: 'block',
                transform: `translate3d(0, ${reduced ? 0 : (scrollY - 600) * -0.04}px, 0)`,
                willChange: 'transform',
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Eyebrow>About us</Eyebrow>
            <Typography variant="h2" sx={{ fontSize: { xs: 34, md: 48 }, lineHeight: 1.1, mb: 2 }}>
              More than just{' '}
              <Box component="span" sx={{ color: 'primary.main', fontStyle: 'italic' }}>sushi</Box>
            </Typography>
            <Typography sx={{ color: TAUPE, mb: 3, maxWidth: '52ch' }}>
              We treat every order like a seat at the counter. Our chefs work in small
              batches — slicing, seasoning and rolling only when your ticket prints —
              because sushi is at its best in the first hour of its life.
            </Typography>
            <Stack spacing={1.5} sx={{ mb: 4 }}>
              {CHECKLIST.map((item) => (
                <Stack key={item} direction="row" spacing={1.5} alignItems="center">
                  <CheckCircleRoundedIcon sx={{ color: 'primary.main', fontSize: 22 }} />
                  <Typography sx={{ color: PAPER }}>{item}</Typography>
                </Stack>
              ))}
            </Stack>
            <Button variant="outlined" size="large" onClick={() => navigate('/menu')} sx={{ px: 4 }}>
              Browse the menu
            </Button>
          </Grid>
        </Grid>
      </Container>

      {/* ── 3 · POPULAR PICKS ────────────────────────────────────────── */}
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
        <Box sx={{ textAlign: 'center', mb: { xs: 4, md: 6 } }}>
          <Eyebrow>Our signature</Eyebrow>
          <Typography variant="h2" sx={{ fontSize: { xs: 34, md: 48 } }}>
            Popular{' '}
            <Box component="span" sx={{ color: 'primary.main', fontStyle: 'italic' }}>Picks</Box>
          </Typography>
        </Box>
        <Grid container spacing={3}>
          {featured.map((p) => (
            <Grid item xs={12} sm={6} md={3} key={p.id}>
              <ProductCard product={p} />
            </Grid>
          ))}
        </Grid>
        <Box sx={{ textAlign: 'center', mt: 5 }}>
          <Button
            variant="outlined"
            size="large"
            endIcon={<ArrowForwardIcon />}
            onClick={() => navigate('/menu')}
            sx={{ px: 4 }}
          >
            View full menu
          </Button>
        </Box>
      </Container>

      {/* ── 4 · PARALLAX BAND ────────────────────────────────────────── */}
      <Box
        ref={bandRef}
        sx={{
          position: 'relative',
          overflow: 'hidden',
          height: { xs: 340, md: 420 },
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <Box
          aria-hidden
          sx={{
            position: 'absolute',
            inset: '-35% 0',
            zIndex: 0,
            backgroundImage: `url(${BAND_IMG})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            transform: `translate3d(0, ${(scrollY - bandCenter) * spd(0.18)}px, 0)`,
            willChange: 'transform',
          }}
        />
        <Box aria-hidden sx={{ position: 'absolute', inset: 0, zIndex: 1, background: 'rgba(20,18,15,.68)' }} />
        <Container maxWidth="md" sx={{ position: 'relative', zIndex: 2, textAlign: 'center' }}>
          <Eyebrow color={GOLD}>Taste of Tokyo</Eyebrow>
          <Typography variant="h2" sx={{ fontSize: { xs: 32, md: 44 }, mb: 1.5 }}>
            Free delivery over{' '}
            <Box component="span" sx={{ color: 'primary.main', fontStyle: 'italic' }}>$35</Box>
          </Typography>
          <Typography sx={{ color: TAUPE, mb: 3 }}>
            Average delivery time: 40 minutes.
          </Typography>
          <Button variant="contained" size="large" onClick={() => navigate('/menu')} sx={{ px: 4.5 }}>
            Build your order
          </Button>
        </Container>
      </Box>

      {/* ── 5 · FEATURE STRIP ────────────────────────────────────────── */}
      <Container maxWidth="lg" id="how-it-works" sx={{ py: { xs: 8, md: 12 } }}>
        <Grid container spacing={{ xs: 2, md: 3 }}>
          {FEATURES.map((f) => (
            <Grid item xs={6} md={3} key={f.title}>
              <Box sx={{ ...glass, p: 3, height: '100%', textAlign: 'center' }}>
                <Box sx={{ color: GOLD, mb: 1.5 }}>{f.icon}</Box>
                <Typography sx={{ color: PAPER, fontWeight: 700, fontSize: { xs: 14, md: 15 }, mb: 0.5 }}>
                  {f.title}
                </Typography>
                <Typography sx={{ color: TAUPE, fontSize: { xs: 12, md: 13 } }}>
                  {f.caption}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}
