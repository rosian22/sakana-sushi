import { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  AppBar, Toolbar, Box, Button, IconButton, Badge, Drawer, List, ListItemButton,
  ListItemIcon, ListItemText, Typography, Divider, Avatar, Menu, MenuItem,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import AdminPanelSettingsOutlinedIcon from '@mui/icons-material/AdminPanelSettingsOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function NavBar() {
  const { count, setOpen } = useCart();
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchor, setAnchor] = useState(null);

  const links = [
    { label: 'Home', to: '/', icon: <HomeOutlinedIcon /> },
    { label: 'Menu', to: '/menu', icon: <RestaurantMenuIcon /> },
    ...(isAdmin ? [{ label: 'Admin', to: '/admin', icon: <AdminPanelSettingsOutlinedIcon /> }] : []),
  ];

  const handleLogout = () => {
    setAnchor(null);
    logout();
    navigate('/');
  };

  return (
    <>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          background: 'rgba(20,18,15,.7)',
          backdropFilter: 'blur(18px)',
          borderBottom: '1px solid rgba(245,241,232,.08)',
        }}
      >
        <Toolbar sx={{ gap: 1 }}>
          <IconButton
            edge="start"
            sx={{ display: { md: 'none' } }}
            onClick={() => setMobileOpen(true)}
            aria-label="menu"
          >
            <MenuIcon />
          </IconButton>

          <Typography
            component={RouterLink}
            to="/"
            variant="h6"
            sx={{
              textDecoration: 'none',
              color: 'text.primary',
              fontFamily: '"Cormorant Garamond", serif',
              fontWeight: 700,
              letterSpacing: 3,
              mr: 2,
              whiteSpace: 'nowrap',
            }}
          >
            SAKANA{' '}
            <Box component="span" sx={{ color: 'primary.main' }}>鮨</Box>
          </Typography>

          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 0.5, flex: 1 }}>
            {links.map((l) => (
              <Button key={l.to} component={RouterLink} to={l.to} color="inherit">
                {l.label}
              </Button>
            ))}
          </Box>
          <Box sx={{ flex: { xs: 1, md: 0 } }} />

          {user ? (
            <>
              <IconButton onClick={(e) => setAnchor(e.currentTarget)} aria-label="account">
                <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: 15 }}>
                  {user.name?.[0]?.toUpperCase() || '?'}
                </Avatar>
              </IconButton>
              <Menu anchorEl={anchor} open={!!anchor} onClose={() => setAnchor(null)}>
                <MenuItem disabled>{user.name}</MenuItem>
                <Divider />
                <MenuItem onClick={() => { setAnchor(null); navigate('/account'); }}>
                  My orders
                </MenuItem>
                {isAdmin && (
                  <MenuItem onClick={() => { setAnchor(null); navigate('/admin'); }}>
                    Admin panel
                  </MenuItem>
                )}
                <MenuItem onClick={handleLogout}>Log out</MenuItem>
              </Menu>
            </>
          ) : (
            <Button
              component={RouterLink}
              to="/login"
              color="inherit"
              startIcon={<PersonOutlineIcon />}
              sx={{ display: { xs: 'none', sm: 'inline-flex' } }}
            >
              Sign in
            </Button>
          )}

          <IconButton onClick={() => setOpen(true)} aria-label="cart">
            <Badge badgeContent={count} color="primary">
              <ShoppingBagOutlinedIcon />
            </Badge>
          </IconButton>
        </Toolbar>
      </AppBar>
      {/* spacer under the fixed bar for non-hero pages is handled per page */}

      <Drawer
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        PaperProps={{ sx: { bgcolor: '#1D1A16' } }}
      >
        <Box sx={{ width: 260, pt: 2 }} role="presentation" onClick={() => setMobileOpen(false)}>
          <Typography
            variant="h6"
            sx={{
              px: 2,
              pb: 1,
              fontFamily: '"Cormorant Garamond", serif',
              fontWeight: 700,
              letterSpacing: 3,
              color: 'text.primary',
            }}
          >
            🍣 SAKANA{' '}
            <Box component="span" sx={{ color: 'primary.main' }}>鮨</Box>
          </Typography>
          <Divider />
          <List>
            {links.map((l) => (
              <ListItemButton key={l.to} component={RouterLink} to={l.to}>
                <ListItemIcon>{l.icon}</ListItemIcon>
                <ListItemText primary={l.label} />
              </ListItemButton>
            ))}
            {!user && (
              <ListItemButton component={RouterLink} to="/login">
                <ListItemIcon><PersonOutlineIcon /></ListItemIcon>
                <ListItemText primary="Sign in" />
              </ListItemButton>
            )}
            {user && (
              <ListItemButton component={RouterLink} to="/account">
                <ListItemIcon><PersonOutlineIcon /></ListItemIcon>
                <ListItemText primary="My orders" />
              </ListItemButton>
            )}
          </List>
        </Box>
      </Drawer>
    </>
  );
}
