import {
  Box, Container, Typography, Stack, Link, Grid, TextField, IconButton,
} from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { Link as RouterLink } from 'react-router-dom';

const colHeaderSx = {
  textTransform: 'uppercase',
  fontSize: 11,
  letterSpacing: 2,
  color: 'text.secondary',
  fontWeight: 700,
  mb: 2,
};

const footerLinkSx = {
  color: 'text.primary',
  textDecoration: 'none',
  fontSize: 14,
  width: 'fit-content',
  '&:hover': { textDecoration: 'underline' },
};

export default function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        bgcolor: '#100E0C',
        borderTop: '1px solid rgba(245,241,232,.08)',
        pt: 8,
        pb: 4,
        mt: 8,
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={{ xs: 5, md: 4 }}>
          {/* Col 1 — brand */}
          <Grid item xs={12} md={4}>
            <Typography
              sx={{
                fontFamily: '"Cormorant Garamond", serif',
                fontWeight: 700,
                letterSpacing: 3,
                fontSize: 24,
                color: 'text.primary',
                mb: 1.5,
              }}
            >
              SAKANA{' '}
              <Box component="span" sx={{ color: 'primary.main' }}>鮨</Box>
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', maxWidth: 300, mb: 1.5 }}>
              Edomae-inspired sushi, rolled by hand every morning and delivered
              to your door while the rice is still warm.
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Open daily 11:00 – 23:00
            </Typography>
          </Grid>

          {/* Col 2 — quick links */}
          <Grid item xs={6} sm={4} md={2.5}>
            <Typography sx={colHeaderSx}>Quick links</Typography>
            <Stack spacing={1.25}>
              <Link component={RouterLink} to="/menu" sx={footerLinkSx}>Menu</Link>
              <Link component={RouterLink} to="/account" sx={footerLinkSx}>My orders</Link>
              <Link component={RouterLink} to="/login" sx={footerLinkSx}>Sign in</Link>
            </Stack>
          </Grid>

          {/* Col 3 — customer care */}
          <Grid item xs={6} sm={4} md={2.5}>
            <Typography sx={colHeaderSx}>Customer care</Typography>
            <Stack spacing={1.25}>
              <Link component={RouterLink} to="/account" sx={footerLinkSx}>Track your order</Link>
              <Link component={RouterLink} to="/menu" sx={footerLinkSx}>Delivery info</Link>
              <Link href="mailto:hello@sakana.local" sx={footerLinkSx}>Contact us</Link>
            </Stack>
          </Grid>

          {/* Col 4 — newsletter */}
          <Grid item xs={12} sm={4} md={3}>
            <Typography sx={colHeaderSx}>Stay in the loop</Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1.5 }}>
              Occasional offers, no spam.
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center">
              <TextField
                size="small"
                variant="filled"
                placeholder="Your email"
                hiddenLabel
                fullWidth
                InputProps={{ disableUnderline: true }}
                sx={{
                  '& .MuiFilledInput-root': {
                    borderRadius: 999,
                    bgcolor: 'rgba(245,241,232,0.06)',
                    border: '1px solid rgba(245,241,232,0.12)',
                    '&:hover': { bgcolor: 'rgba(245,241,232,0.09)' },
                    '&.Mui-focused': { bgcolor: 'rgba(245,241,232,0.09)' },
                  },
                  '& .MuiFilledInput-input': { py: 1.25, px: 2, fontSize: 14 },
                }}
              />
              <IconButton
                aria-label="subscribe"
                onClick={() => {}}
                sx={{
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText',
                  width: 40,
                  height: 40,
                  flexShrink: 0,
                  '&:hover': { bgcolor: 'primary.dark' },
                }}
              >
                <ArrowForwardIcon fontSize="small" />
              </IconButton>
            </Stack>
          </Grid>
        </Grid>

        <Typography
          variant="caption"
          sx={{ color: 'text.secondary', display: 'block', textAlign: 'center', mt: 6 }}
        >
          © 2026 Sakana Sushi — handmade in small batches
        </Typography>
      </Container>
    </Box>
  );
}
