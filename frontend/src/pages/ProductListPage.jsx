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
  Alert,
  Fade,
  Grow
} from '@mui/material';
import { Search, AddShoppingCart, Visibility, LocalOffer } from '@mui/icons-material';
import { productService } from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function ProductListPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0); 
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
        res = await productService.search(searchQuery, page, 8); 
      } else {
        res = await productService.getAll(page, 8);
      }
      const data = res.data.data; 
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
    setPage(0); 
  };

  const handlePageChange = (event, value) => {
    setPage(value - 1); 
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
    <Container maxWidth="xl" sx={{ mt: 4, mb: 10 }}>
      {/* Modern Header & Search Section */}
      <Box 
        sx={{ 
          mb: 6, 
          p: { xs: 3, md: 5 }, 
          borderRadius: 4, 
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
          color: 'white',
          display: 'flex', 
          flexDirection: { xs: 'column', md: 'row' }, 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          boxShadow: '0 10px 30px rgba(26, 26, 46, 0.3)',
          gap: 3
        }}
      >
        <Box>
          <Typography variant="h3" fontWeight={800} sx={{ letterSpacing: '-0.5px', mb: 1 }}>
            {searchQuery ? `"${searchQuery}" Sonuçları` : 'Koleksiyonu Keşfet'}
          </Typography>
          <Typography variant="subtitle1" sx={{ color: 'rgba(255,255,255,0.7)' }}>
            En yeni ürünleri en uygun fiyatlarla satın alın
          </Typography>
        </Box>

        <Box component="form" onSubmit={handleSearchSubmit} sx={{ display: 'flex', gap: 1, width: { xs: '100%', md: 'auto' } }}>
          <TextField
            variant="outlined"
            placeholder="Ne aramıştınız?"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            sx={{
              bgcolor: 'rgba(255, 255, 255, 0.1)',
              borderRadius: 2,
              input: { color: 'white' },
              '& .MuiOutlinedInput-root': {
                '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
                '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.5)' },
                '&.Mui-focused fieldset': { borderColor: '#e94560' },
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ color: 'rgba(255,255,255,0.7)' }} />
                </InputAdornment>
              ),
            }}
          />
          <Button 
            type="submit" 
            variant="contained" 
            sx={{ 
              background: '#e94560', 
              color: 'white',
              px: 4,
              borderRadius: 2,
              fontWeight: 'bold',
              '&:hover': { background: '#d13b56' } 
            }}
          >
            Ara
          </Button>
          {searchQuery && (
            <Button 
              onClick={() => { setKeyword(''); setSearchQuery(''); setPage(0); }}
              sx={{ color: 'rgba(255,255,255,0.7)' }}
            >
              Temizle
            </Button>
          )}
        </Box>
      </Box>

      {/* Content Section */}
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="40vh">
          <CircularProgress size={60} thickness={4} sx={{ color: '#e94560' }} />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ borderRadius: 2, fontSize: '1.1rem' }}>{error}</Alert>
      ) : products.length === 0 ? (
        <Box textAlign="center" py={10}>
          <Typography variant="h5" color="text.secondary" fontWeight={500}>
            Aradığınız kriterlere uygun ürün bulunamadı.
          </Typography>
        </Box>
      ) : (
        <Box>
          <Grid container spacing={4} alignItems="stretch">
            {products.map((product, index) => (
              <Grow in={true} timeout={(index % 8) * 200 + 500} key={product.id}>
                <Grid item xs={12} sm={6} md={4} lg={3}>
                  <Card
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      borderRadius: 3,
                      border: '1px solid rgba(0,0,0,0.05)',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&:hover': { 
                        transform: 'translateY(-10px)', 
                        boxShadow: '0 20px 40px rgba(0,0,0,0.08)',
                        '& .product-image': {
                          transform: 'scale(1.05)'
                        }
                      },
                      position: 'relative',
                      overflow: 'hidden',
                      bgcolor: '#ffffff'
                    }}
                  >
                    {!product.active && (
                      <Chip 
                        label="Tükendi" 
                        color="error" 
                        size="small" 
                        sx={{ position: 'absolute', top: 16, right: 16, zIndex: 2, fontWeight: 'bold' }} 
                      />
                    )}
                    
                    {/* Uniform Image Container */}
                    <Box sx={{ 
                      position: 'relative', 
                      width: '100%', 
                      paddingTop: '100%', // 1:1 Aspect Ratio
                      bgcolor: '#f8f9fa',
                      overflow: 'hidden'
                    }}>
                      <CardMedia
                        className="product-image"
                        component="img"
                        image={product.imageUrl || 'https://via.placeholder.com/400x400?text=Görsel+Yok'}
                        alt={product.name}
                        sx={{ 
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          objectFit: 'contain', // Changed to contain with padding to look clean, or cover for full bleed
                          p: 3,
                          transition: 'transform 0.5s ease',
                        }}
                      />
                    </Box>

                    <CardContent sx={{ flexGrow: 1, p: 3 }}>
                      <Box display="flex" alignItems="center" gap={0.5} mb={1}>
                        <LocalOffer sx={{ fontSize: 14, color: '#e94560' }} />
                        <Typography variant="caption" sx={{ color: '#e94560', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>
                          {product.category}
                        </Typography>
                      </Box>
                      
                      <Typography 
                        variant="h6" 
                        component="h2" 
                        sx={{ 
                          fontWeight: 700, 
                          fontSize: '1.1rem', 
                          lineHeight: 1.4, 
                          mb: 2,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          color: '#1a1a2e'
                        }}
                      >
                        {product.name}
                      </Typography>
                      
                      <Box display="flex" justifyContent="space-between" alignItems="flex-end" mt="auto">
                        <Typography variant="h5" sx={{ fontWeight: 800, color: '#1a1a2e' }}>
                          {product.price.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                        </Typography>
                        <Typography variant="body2" sx={{ color: product.stockQuantity > 5 ? 'success.main' : 'warning.main', fontWeight: 500 }}>
                          {product.stockQuantity > 0 ? `Son ${product.stockQuantity} ürün` : 'Stokta yok'}
                        </Typography>
                      </Box>
                    </CardContent>

                    <CardActions sx={{ p: 3, pt: 0, gap: 1 }}>
                      <IconButton 
                        component={RouterLink} 
                        to={`/products/${product.id}`}
                        sx={{ 
                          bgcolor: 'rgba(26, 26, 46, 0.05)', 
                          color: '#1a1a2e',
                          '&:hover': { bgcolor: 'rgba(26, 26, 46, 0.1)' }
                        }}
                      >
                        <Visibility />
                      </IconButton>
                      <Button
                        variant="contained"
                        startIcon={<AddShoppingCart />}
                        onClick={() => handleAddToCart(product)}
                        disabled={!product.active || product.stockQuantity <= 0}
                        fullWidth
                        sx={{ 
                          background: '#1a1a2e',
                          color: 'white',
                          py: 1,
                          borderRadius: 2,
                          fontWeight: 600,
                          textTransform: 'none',
                          fontSize: '0.95rem',
                          boxShadow: 'none',
                          '&:hover': { 
                            background: '#e94560',
                            boxShadow: '0 4px 12px rgba(233, 69, 96, 0.3)'
                          }
                        }}
                      >
                        {product.stockQuantity <= 0 ? 'Tükendi' : 'Sepete Ekle'}
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              </Grow>
            ))}
          </Grid>

          {totalPages > 1 && (
            <Box display="flex" justifyContent="center" mt={8}>
              <Pagination
                count={totalPages}
                page={page + 1}
                onChange={handlePageChange}
                size="large"
                sx={{
                  '& .MuiPaginationItem-root': {
                    fontSize: '1rem',
                    fontWeight: 500,
                  },
                  '& .Mui-selected': {
                    backgroundColor: '#1a1a2e !important',
                    color: '#fff',
                  }
                }}
              />
            </Box>
          )}
        </Box>
      )}

      <Snackbar
        open={!!snackbarMessage}
        autoHideDuration={4000}
        onClose={() => setSnackbarMessage('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setSnackbarMessage('')} 
          severity={snackbarMessage.includes('hata') ? 'error' : 'success'} 
          variant="filled"
          sx={{ width: '100%', borderRadius: 2, fontWeight: 500 }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
}
