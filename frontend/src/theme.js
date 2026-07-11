import { createTheme } from '@mui/material/styles';

// ── SUMI NIGHT design tokens ──────────────────────────────────────
// Warm ink backgrounds, paper-cream type, one vermilion accent (hanko
// seal red), gold for small flourishes. Photography-first layout with
// glass (translucent, blurred) cards.
export const INK = '#14120F';        // page background
export const INK_RAISED = '#1D1A16'; // solid surfaces (dialogs, menus)
export const PAPER = '#F5F1E8';      // primary text
export const TAUPE = '#A79F8F';      // secondary text
export const VERMILION = '#D93A2B';  // accent
export const GOLD = '#C9A46B';       // sparing second accent

export const glass = {
  background: 'rgba(245,241,232,0.05)',
  border: '1px solid rgba(245,241,232,0.12)',
  backdropFilter: 'blur(16px)',
  borderRadius: '20px',
};

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: VERMILION, light: '#E8654F', dark: '#A82A1E', contrastText: PAPER },
    secondary: { main: GOLD, dark: '#A8834D', contrastText: INK },
    background: { default: INK, paper: INK_RAISED },
    text: { primary: PAPER, secondary: TAUPE },
    divider: 'rgba(245,241,232,0.1)',
  },
  shape: { borderRadius: 16 },
  typography: {
    fontFamily: '"Inter", system-ui, -apple-system, sans-serif',
    h1: { fontFamily: '"Cormorant Garamond", serif', fontWeight: 600 },
    h2: { fontFamily: '"Cormorant Garamond", serif', fontWeight: 600 },
    h3: { fontFamily: '"Cormorant Garamond", serif', fontWeight: 600 },
    h4: { fontFamily: '"Cormorant Garamond", serif', fontWeight: 600 },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 700 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 999 },
        containedPrimary: {
          boxShadow: '0 10px 30px rgba(217,58,43,.35)',
          '&:hover': { backgroundColor: '#B92E21' },
        },
        outlined: {
          borderColor: 'rgba(245,241,232,.35)',
          color: PAPER,
          '&:hover': { borderColor: PAPER, background: 'rgba(245,241,232,.06)' },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: glass.background,
          border: glass.border,
          backdropFilter: glass.backdropFilter,
          borderRadius: 20,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { backgroundImage: 'none' },
      },
    },
    MuiChip: {
      styleOverrides: { root: { fontWeight: 600 } },
    },
    MuiAppBar: {
      styleOverrides: { root: { backgroundImage: 'none' } },
    },
  },
});

// Script accent (eyebrow lines like “Fresh. Handmade. Perfect.”)
export const scriptFont = '"Great Vibes", cursive';

export default theme;
