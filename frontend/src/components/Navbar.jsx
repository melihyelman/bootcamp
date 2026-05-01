import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Badge,
  Box,
  Menu,
  MenuItem,
  Avatar,
  Divider,
  ListItemIcon,
  useTheme,
  useMediaQuery,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
} from '@mui/material';
import {
  ShoppingCart,
  Person,
  Logout,
  Login,
  PersonAdd,
  Menu as MenuIcon,
  Store,
  Receipt,
  AdminPanelSettings,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [anchorEl, setAnchorEl] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleMenuOpen = (e) => setAnchorEl(e.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleLogout = () => {
    logout();
    handleMenuClose();
    navigate('/');
  };

  const navItems = [
    { label: 'Ürünler', path: '/products', icon: <Store /> },
    ...(user
      ? [{ label: 'Siparişlerim', path: '/orders', icon: <Receipt /> }]
      : []),
    ...(isAdmin
      ? [{ label: 'Admin Panel', path: '/admin/products', icon: <AdminPanelSettings /> }]
      : []),
  ];

  return (
    <>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <Toolbar sx={{ maxWidth: 1200, width: '100%', mx: 'auto' }}>
          {isMobile && (
            <IconButton
              color="inherit"
              edge="start"
              onClick={() => setDrawerOpen(true)}
              sx={{ mr: 1 }}
            >
              <MenuIcon />
            </IconButton>
          )}

          <Typography
            variant="h6"
            component={RouterLink}
            to="/"
            sx={{
              textDecoration: 'none',
              color: '#fff',
              fontWeight: 700,
              letterSpacing: 1,
              background: 'linear-gradient(90deg, #e94560, #0f3460)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontSize: '1.4rem',
            }}
          >
            🛒 E-Commerce
          </Typography>

          <Box sx={{ flexGrow: 1 }} />

          {!isMobile &&
            navItems.map((item) => (
              <Button
                key={item.path}
                component={RouterLink}
                to={item.path}
                color="inherit"
                startIcon={item.icon}
                sx={{
                  mx: 0.5,
                  textTransform: 'none',
                  '&:hover': { background: 'rgba(255,255,255,0.08)' },
                }}
              >
                {item.label}
              </Button>
            ))}

          {user && (
            <IconButton
              color="inherit"
              component={RouterLink}
              to="/cart"
              sx={{ ml: 1 }}
            >
              <Badge badgeContent={itemCount} color="error">
                <ShoppingCart />
              </Badge>
            </IconButton>
          )}

          {user ? (
            <>
              <IconButton
                onClick={handleMenuOpen}
                sx={{ ml: 1 }}
              >
                <Avatar
                  sx={{
                    width: 34,
                    height: 34,
                    bgcolor: '#e94560',
                    fontSize: '0.9rem',
                  }}
                >
                  {user.firstName?.[0]?.toUpperCase()}
                </Avatar>
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              >
                <MenuItem disabled>
                  <Typography variant="body2" color="text.secondary">
                    {user.firstName} {user.lastName}
                  </Typography>
                </MenuItem>
                <Divider />
                <MenuItem onClick={() => { handleMenuClose(); navigate('/orders'); }}>
                  <ListItemIcon><Receipt fontSize="small" /></ListItemIcon>
                  Siparişlerim
                </MenuItem>
                <MenuItem onClick={handleLogout}>
                  <ListItemIcon><Logout fontSize="small" /></ListItemIcon>
                  Çıkış Yap
                </MenuItem>
              </Menu>
            </>
          ) : (
            <Box sx={{ ml: 1, display: 'flex', gap: 1 }}>
              <Button
                component={RouterLink}
                to="/login"
                color="inherit"
                startIcon={<Login />}
                size="small"
                sx={{ textTransform: 'none' }}
              >
                Giriş
              </Button>
              <Button
                component={RouterLink}
                to="/register"
                variant="contained"
                startIcon={<PersonAdd />}
                size="small"
                sx={{
                  textTransform: 'none',
                  background: 'linear-gradient(135deg, #e94560, #c23152)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #c23152, #a12040)',
                  },
                }}
              >
                Kayıt
              </Button>
            </Box>
          )}
        </Toolbar>
      </AppBar>

      {/* Mobile drawer */}
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        <Box sx={{ width: 250, pt: 2 }}>
          <Typography variant="h6" sx={{ px: 2, pb: 1, fontWeight: 700 }}>
            Menü
          </Typography>
          <Divider />
          <List>
            {navItems.map((item) => (
              <ListItem key={item.path} disablePadding>
                <ListItemButton
                  component={RouterLink}
                  to={item.path}
                  onClick={() => setDrawerOpen(false)}
                >
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.label} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
    </>
  );
}
