import { useState, useEffect } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Typography,
  Button,
  Pagination,
  Box,
  CircularProgress,
  TextField,
  InputAdornment,
  Chip,
  IconButton,
  Snackbar,
  Alert
} from '@mui/material';
import { Search, AddShoppingCart, Visibility } from '@mui/icons-material';
import { productService } from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function ProductListPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0); // Backend uses 0-based index
  const [totalPages, setTotalPages] = useState(1);
  const [keyword, setKeyword] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const { addItem } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
  }, [page, searchQuery]);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      let res;
      if (searchQuery) {
        res = await productService.search(searchQuery, page, 8); // Using 8 per page for better grid
      } else {
        res = await productService.getAll(page, 8);
      }
      const data = res.data.data; // PagedResponse
      setProducts(data.content);
      setTotalPages(data.totalPages);
    } catch (err) {
      setError(err.message || 'Ürünler yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearchQuery(keyword);
    setPage(0); // Reset to first page on new search
  };

  const handlePageChange = (event, value) => {
    setPage(value - 1); // MUI Pagination is 1-based, backend is 0-based
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddToCart = async (product) => {
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      await addItem(product, 1);
      setSnackbarMessage(`${product.name} sepete eklendi!`);
    } catch (err) {
      setSnackbarMessage('Sepete eklenirken hata oluştu: ' + err.message);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4" fontWeight={700}>
          {searchQuery ? `"${searchQuery}" için sonuçlar` : 'Tüm Ürünler'}
        </Typography>

        <Box component="form" onSubmit={handleSearchSubmit} sx={{ display: 'flex', gap: 1 }}>
          <TextField
            size="small"
            placeholder="Ürün ara..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
          />
          <Button type="submit" variant="contained" sx={{ background: '#1a1a2e' }}>
            Ara
          </Button>
          {searchQuery && (
            <Button onClick={() => { setKeyword(''); setSearchQuery(''); setPage(0); }}>
              Temizle
            </Button>
          )}
        </Box>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" my={10}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : products.length === 0 ? (
        <Typography variant="h6" align="center" color="text.secondary" my={10}>
          Ürün bulunamadı.
        </Typography>
      ) : (
        <>
          <Grid container spacing={3}>
            {products.map((product) => (
              <Grid item key={product.id} xs={12} sm={6} md={4} lg={3}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'transform 0.2s',
                    '&:hover': { transform: 'translateY(-4px)', boxShadow: 6 },
                    position: 'relative'
                  }}
                >
                  {!product.active && (
                    <Chip 
                      label="Pasif" 
                      color="error" 
                      size="small" 
                      sx={{ position: 'absolute', top: 10, right: 10, zIndex: 1 }} 
                    />
                  )}
                  <CardMedia
                    component="img"
                    height="200"
                    image={product.imageUrl || 'https://via.placeholder.com/200x200?text=No+Image'}
                    alt={product.name}
                    sx={{ objectFit: 'contain', p: 2, bgcolor: '#f8f9fa' }}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography gutterBottom variant="subtitle2" color="text.secondary">
                      {product.category}
                    </Typography>
                    <Typography gutterBottom variant="h6" component="h2" sx={{ fontWeight: 600, fontSize: '1.1rem', lineHeight: 1.2, height: '2.4em', overflow: 'hidden' }}>
                      {product.name}
                    </Typography>
                    <Typography variant="h5" color="primary.main" fontWeight={700} sx={{ mt: 1 }}>
                      {product.price.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                      Stok: {product.stockQuantity}
                    </Typography>
                  </CardContent>
                  <CardActions sx={{ p: 2, pt: 0, justifyContent: 'space-between' }}>
                    <IconButton 
                      component={RouterLink} 
                      to={`/products/${product.id}`}
                      color="primary"
                    >
                      <Visibility />
                    </IconButton>
                    <Button
                      variant="contained"
                      startIcon={<AddShoppingCart />}
                      onClick={() => handleAddToCart(product)}
                      disabled={!product.active || product.stockQuantity <= 0}
                      sx={{ 
                        flexGrow: 1, 
                        ml: 1,
                        background: 'linear-gradient(90deg, #1a1a2e, #0f3460)',
                        '&:hover': { background: '#0f3460' }
                      }}
                    >
                      {product.stockQuantity <= 0 ? 'Stokta Yok' : 'Sepete Ekle'}
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>

          {totalPages > 1 && (
            <Box display="flex" justifyContent="center" mt={6}>
              <Pagination
                count={totalPages}
                page={page + 1}
                onChange={handlePageChange}
                color="primary"
                size="large"
              />
            </Box>
          )}
        </>
      )}

      <Snackbar
        open={!!snackbarMessage}
        autoHideDuration={3000}
        onClose={() => setSnackbarMessage('')}
        message={snackbarMessage}
      />
    </Container>
  );
}
