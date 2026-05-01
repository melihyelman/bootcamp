import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Grid,
  Typography,
  Button,
  Box,
  CircularProgress,
  Alert,
  Paper,
  Divider,
  Chip,
  IconButton,
  Snackbar
} from '@mui/material';
import { AddShoppingCart, ArrowBack, Remove, Add } from '@mui/icons-material';
import { productService } from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const { addItem } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    setLoading(true);
    try {
      const res = await productService.getById(id);
      setProduct(res.data.data);
    } catch (err) {
      setError(err.message || 'Ürün yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = (delta) => {
    const newQuantity = quantity + delta;
    if (newQuantity >= 1 && newQuantity <= (product?.stockQuantity || 1)) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      await addItem(product, quantity);
      setSnackbarMessage(`${quantity} adet ${product.name} sepete eklendi!`);
    } catch (err) {
      setSnackbarMessage('Sepete eklenirken hata oluştu: ' + err.message);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" my={10}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !product) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">{error || 'Ürün bulunamadı'}</Alert>
        <Button startIcon={<ArrowBack />} component={RouterLink} to="/products" sx={{ mt: 2 }}>
          Ürünlere Dön
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      <Button startIcon={<ArrowBack />} component={RouterLink} to="/products" sx={{ mb: 3 }}>
        Ürünlere Dön
      </Button>

      <Paper elevation={0} sx={{ p: { xs: 2, md: 4 }, borderRadius: 3, border: '1px solid #e0e0e0' }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={5}>
            <Box
              component="img"
              src={product.imageUrl || 'https://via.placeholder.com/400x400?text=No+Image'}
              alt={product.name}
              sx={{
                width: '100%',
                height: 'auto',
                maxHeight: 500,
                objectFit: 'contain',
                borderRadius: 2,
                bgcolor: '#f8f9fa',
                p: 2
              }}
            />
          </Grid>

          <Grid item xs={12} md={7}>
            <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <Typography variant="overline" color="primary" fontWeight={600} fontSize="0.9rem">
                {product.category}
              </Typography>
              
              <Typography variant="h3" component="h1" fontWeight={800} gutterBottom sx={{ mt: 1 }}>
                {product.name}
              </Typography>
              
              {!product.active && (
                <Chip label="Pasif Ürün" color="error" sx={{ alignSelf: 'flex-start', mb: 2 }} />
              )}

              <Typography variant="h4" color="primary.main" fontWeight={700} sx={{ my: 2 }}>
                {product.price.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
              </Typography>

              <Divider sx={{ my: 3 }} />

              <Typography variant="body1" color="text.secondary" paragraph sx={{ flexGrow: 1, lineHeight: 1.8 }}>
                {product.description || 'Bu ürün için henüz bir açıklama girilmemiştir.'}
              </Typography>

              <Box sx={{ mt: 'auto', pt: 3 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Stok Durumu: {product.stockQuantity > 0 ? (
                    <Typography component="span" color="success.main" fontWeight={700}>
                      {product.stockQuantity} adet stokta
                    </Typography>
                  ) : (
                    <Typography component="span" color="error.main" fontWeight={700}>
                      Stokta Yok
                    </Typography>
                  )}
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mt: 2, flexWrap: 'wrap' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', border: '1px solid #e0e0e0', borderRadius: 2 }}>
                    <IconButton onClick={() => handleQuantityChange(-1)} disabled={quantity <= 1}>
                      <Remove />
                    </IconButton>
                    <Typography sx={{ px: 2, fontWeight: 600, minWidth: 40, textAlign: 'center' }}>
                      {quantity}
                    </Typography>
                    <IconButton onClick={() => handleQuantityChange(1)} disabled={quantity >= product.stockQuantity}>
                      <Add />
                    </IconButton>
                  </Box>

                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<AddShoppingCart />}
                    onClick={handleAddToCart}
                    disabled={!product.active || product.stockQuantity <= 0}
                    sx={{
                      px: 6,
                      py: 1.5,
                      background: 'linear-gradient(90deg, #1a1a2e, #0f3460)',
                      '&:hover': { background: '#0f3460' },
                      fontWeight: 600,
                      fontSize: '1.1rem'
                    }}
                  >
                    Sepete Ekle
                  </Button>
                </Box>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      <Snackbar
        open={!!snackbarMessage}
        autoHideDuration={3000}
        onClose={() => setSnackbarMessage('')}
        message={snackbarMessage}
      />
    </Container>
  );
}
