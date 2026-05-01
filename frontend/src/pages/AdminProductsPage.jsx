import { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar,
  Alert,
  Chip
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import { productService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function AdminProductsPage() {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  
  const [products, setProducts] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    stockQuantity: '',
    category: '',
    imageUrl: ''
  });

  useEffect(() => {
    // Basic protection: if not admin (or at least logged in), redirect
    if (!user) {
      navigate('/login');
    } else {
      fetchProducts();
    }
  }, [user, navigate]);

  const fetchProducts = async () => {
    try {
      // Fetch larger amount for admin table
      const res = await productService.getAll(0, 100);
      setProducts(res.data.data.content);
    } catch (err) {
      showSnackbar(err.message, 'error');
    }
  };

  const handleOpenDialog = (product = null) => {
    if (product) {
      setEditingId(product.id);
      setForm({
        name: product.name,
        description: product.description || '',
        price: product.price,
        stockQuantity: product.stockQuantity,
        category: product.category || '',
        imageUrl: product.imageUrl || ''
      });
    } else {
      setEditingId(null);
      setForm({ name: '', description: '', price: '', stockQuantity: '', category: '', imageUrl: '' });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      const data = {
        ...form,
        price: parseFloat(form.price),
        stockQuantity: parseInt(form.stockQuantity, 10)
      };

      if (editingId) {
        await productService.update(editingId, data);
        showSnackbar('Ürün başarıyla güncellendi');
      } else {
        await productService.create(data);
        showSnackbar('Yeni ürün eklendi');
      }
      handleCloseDialog();
      fetchProducts();
    } catch (err) {
      showSnackbar(err.message || 'Bir hata oluştu', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bu ürünü silmek istediğinize emin misiniz?')) {
      try {
        await productService.delete(id);
        showSnackbar('Ürün silindi (veya pasife alındı)');
        fetchProducts();
      } catch (err) {
        showSnackbar(err.message, 'error');
      }
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" fontWeight={800}>
          Ürün Yönetimi (Admin)
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<Add />} 
          onClick={() => handleOpenDialog()}
          sx={{ background: 'linear-gradient(135deg, #e94560, #c23152)' }}
        >
          Yeni Ürün Ekle
        </Button>
      </Box>

      <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 2 }}>
        <Table>
          <TableHead sx={{ bgcolor: '#f8f9fa' }}>
            <TableRow>
              <TableCell><strong>ID</strong></TableCell>
              <TableCell><strong>Görsel</strong></TableCell>
              <TableCell><strong>Ürün Adı</strong></TableCell>
              <TableCell><strong>Kategori</strong></TableCell>
              <TableCell align="right"><strong>Fiyat</strong></TableCell>
              <TableCell align="right"><strong>Stok</strong></TableCell>
              <TableCell align="center"><strong>Durum</strong></TableCell>
              <TableCell align="center"><strong>İşlemler</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                  <Typography color="text.secondary">Hiç ürün bulunamadı. Lütfen yeni ürün ekleyin.</Typography>
                </TableCell>
              </TableRow>
            ) : (
              products.map((product) => (
                <TableRow key={product.id} hover>
                  <TableCell>{product.id}</TableCell>
                  <TableCell>
                    <Box component="img" src={product.imageUrl || 'https://via.placeholder.com/50'} sx={{ width: 50, height: 50, objectFit: 'contain' }} />
                  </TableCell>
                  <TableCell>{product.name}</TableCell>
                  <TableCell>{product.category}</TableCell>
                  <TableCell align="right">{product.price.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}</TableCell>
                  <TableCell align="right">{product.stockQuantity}</TableCell>
                  <TableCell align="center">
                    <Chip label={product.active ? "Aktif" : "Pasif"} color={product.active ? "success" : "error"} size="small" />
                  </TableCell>
                  <TableCell align="center">
                    <IconButton color="primary" onClick={() => handleOpenDialog(product)}>
                      <Edit />
                    </IconButton>
                    <IconButton color="error" onClick={() => handleDelete(product.id)}>
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add / Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editingId ? 'Ürünü Düzenle' : 'Yeni Ürün Ekle'}</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField label="Ürün Adı" name="name" value={form.name} onChange={handleFormChange} fullWidth required />
            <TextField label="Kategori" name="category" value={form.category} onChange={handleFormChange} fullWidth />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField label="Fiyat (₺)" name="price" type="number" value={form.price} onChange={handleFormChange} fullWidth required />
              <TextField label="Stok Miktarı" name="stockQuantity" type="number" value={form.stockQuantity} onChange={handleFormChange} fullWidth required />
            </Box>
            <TextField label="Görsel URL" name="imageUrl" value={form.imageUrl} onChange={handleFormChange} fullWidth placeholder="https://..." />
            <TextField label="Açıklama" name="description" value={form.description} onChange={handleFormChange} fullWidth multiline rows={3} />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseDialog}>İptal</Button>
          <Button variant="contained" onClick={handleSubmit}>{editingId ? 'Güncelle' : 'Kaydet'}</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.severity} variant="filled">{snackbar.message}</Alert>
      </Snackbar>
    </Container>
  );
}
