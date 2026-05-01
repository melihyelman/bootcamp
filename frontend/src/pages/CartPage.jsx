import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Grid,
  Paper,
  IconButton,
  Button,
  Divider,
  CircularProgress,
  Alert
} from '@mui/material';
import { Add, Remove, Delete, ShoppingCartCheckout, ShoppingBag } from '@mui/icons-material';
import { useCart } from '../context/CartContext';

export default function CartPage() {
  const { cart, loading, error, updateItem, removeItem, clearCart, totalPrice, itemCount } = useCart();
  const navigate = useNavigate();

  const handleUpdateQuantity = async (itemId, currentQuantity, delta) => {
    const newQuantity = currentQuantity + delta;
    if (newQuantity < 1) return;
    try {
      await updateItem(itemId, newQuantity);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRemove = async (itemId) => {
    try {
      await removeItem(itemId);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading && !cart) {
    return (
      <Box display="flex" justifyContent="center" my={10}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <Container maxWidth="md" sx={{ mt: 8, textAlign: 'center' }}>
        <ShoppingBag sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
        <Typography variant="h5" gutterBottom fontWeight={600}>
          Sepetiniz boş
        </Typography>
        <Typography color="text.secondary" paragraph>
          Sepetinizde henüz ürün bulunmuyor. Alışverişe başlamak için ürünlerimize göz atabilirsiniz.
        </Typography>
        <Button variant="contained" component={RouterLink} to="/products" sx={{ mt: 2 }}>
          Alışverişe Başla
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      <Typography variant="h4" fontWeight={800} gutterBottom sx={{ mb: 4 }}>
        Alışveriş Sepetim
      </Typography>

      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {cart.items.map((item) => (
              <Paper key={item.id} elevation={0} sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 2 }}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} sm={5}>
                    <Typography variant="subtitle1" fontWeight={700} component={RouterLink} to={`/products/${item.productId}`} sx={{ textDecoration: 'none', color: 'inherit', '&:hover': { color: 'primary.main' } }}>
                      {item.productName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Birim Fiyat: {item.price.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                    </Typography>
                  </Grid>

                  <Grid item xs={6} sm={3}>
                    <Box sx={{ display: 'flex', alignItems: 'center', border: '1px solid #e0e0e0', borderRadius: 2, width: 'fit-content' }}>
                      <IconButton size="small" onClick={() => handleUpdateQuantity(item.id, item.quantity, -1)} disabled={item.quantity <= 1}>
                        <Remove fontSize="small" />
                      </IconButton>
                      <Typography sx={{ px: 2, fontWeight: 600, minWidth: 30, textAlign: 'center' }}>
                        {item.quantity}
                      </Typography>
                      <IconButton size="small" onClick={() => handleUpdateQuantity(item.id, item.quantity, 1)}>
                        <Add fontSize="small" />
                      </IconButton>
                    </Box>
                  </Grid>

                  <Grid item xs={4} sm={3} sx={{ textAlign: 'right' }}>
                    <Typography variant="subtitle1" fontWeight={700} color="primary.main">
                      {item.subtotal.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                    </Typography>
                  </Grid>

                  <Grid item xs={2} sm={1} sx={{ textAlign: 'right' }}>
                    <IconButton color="error" onClick={() => handleRemove(item.id)}>
                      <Delete />
                    </IconButton>
                  </Grid>
                </Grid>
              </Paper>
            ))}
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'flex-start', mt: 3 }}>
            <Button variant="outlined" color="error" onClick={clearCart}>
              Sepeti Temizle
            </Button>
          </Box>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper elevation={0} sx={{ p: 3, border: '1px solid #e0e0e0', borderRadius: 2, position: 'sticky', top: 100 }}>
            <Typography variant="h6" fontWeight={700} gutterBottom>
              Sipariş Özeti
            </Typography>
            <Divider sx={{ my: 2 }} />
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography color="text.secondary">Toplam Ürün ({itemCount})</Typography>
              <Typography fontWeight={600}>
                {totalPrice.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography color="text.secondary">Kargo</Typography>
              <Typography fontWeight={600} color="success.main">
                Ücretsiz
              </Typography>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
              <Typography variant="h6" fontWeight={800}>Genel Toplam</Typography>
              <Typography variant="h6" fontWeight={800} color="primary.main">
                {totalPrice.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
              </Typography>
            </Box>

            <Button
              variant="contained"
              fullWidth
              size="large"
              startIcon={<ShoppingCartCheckout />}
              onClick={() => navigate('/checkout')}
              sx={{
                py: 1.5,
                background: 'linear-gradient(135deg, #e94560, #c23152)',
                '&:hover': { background: 'linear-gradient(135deg, #c23152, #a12040)' },
                fontWeight: 700,
                fontSize: '1.05rem'
              }}
            >
              Alışverişi Tamamla
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}
