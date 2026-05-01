import { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid,
  Divider,
  Chip
} from '@mui/material';
import { ExpandMore, Receipt, CalendarToday, LocalShipping } from '@mui/icons-material';
import { orderService } from '../services/api';

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await orderService.getAll();
      setOrders(res.data.data);
    } catch (err) {
      setError(err.message || 'Siparişler yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
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

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 8 }}>
      <Typography variant="h4" fontWeight={800} gutterBottom sx={{ mb: 4, display: 'flex', alignItems: 'center' }}>
        <Receipt sx={{ mr: 2, fontSize: 36, color: 'primary.main' }} /> Siparişlerim
      </Typography>

      {orders.length === 0 ? (
        <Paper elevation={0} sx={{ p: 5, textAlign: 'center', border: '1px solid #e0e0e0', borderRadius: 3 }}>
          <Typography variant="h6" color="text.secondary">
            Henüz hiç siparişiniz bulunmamaktadır.
          </Typography>
        </Paper>
      ) : (
        orders.map((order) => (
          <Accordion key={order.id} sx={{ mb: 2, '&:before': { display: 'none' }, border: '1px solid #e0e0e0', borderRadius: '12px !important', overflow: 'hidden' }} elevation={0}>
            <AccordionSummary expandIcon={<ExpandMore />} sx={{ bgcolor: '#f8f9fa', '& .MuiAccordionSummary-content': { my: 2 } }}>
              <Grid container alignItems="center" spacing={2}>
                <Grid item xs={12} sm={4}>
                  <Typography variant="subtitle2" color="text.secondary">Sipariş No</Typography>
                  <Typography fontWeight={700}>{order.orderNumber}</Typography>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Typography variant="subtitle2" color="text.secondary" display="flex" alignItems="center">
                    <CalendarToday sx={{ fontSize: 14, mr: 0.5 }} /> Tarih
                  </Typography>
                  <Typography fontWeight={600}>
                    {new Date(order.createdAt).toLocaleDateString('tr-TR')}
                  </Typography>
                </Grid>
                <Grid item xs={6} sm={2}>
                  <Typography variant="subtitle2" color="text.secondary">Tutar</Typography>
                  <Typography fontWeight={700} color="primary.main">
                    {order.totalAmount.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={3} sx={{ textAlign: { sm: 'right' } }}>
                  <Chip 
                    label={order.status === 'COMPLETED' ? 'Ödeme Alındı' : order.status} 
                    color={order.status === 'COMPLETED' ? 'success' : 'warning'} 
                    size="small" 
                    sx={{ fontWeight: 600 }}
                  />
                </Grid>
              </Grid>
            </AccordionSummary>
            <AccordionDetails sx={{ p: 3 }}>
              <Typography variant="subtitle1" fontWeight={700} gutterBottom display="flex" alignItems="center">
                <LocalShipping sx={{ mr: 1, fontSize: 20 }} color="action" /> Teslimat Adresi
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                {order.shippingAddress}
              </Typography>

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                Ürünler
              </Typography>
              
              {order.items.map((item) => (
                <Box key={item.id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1, borderBottom: '1px dashed #e0e0e0', '&:last-child': { borderBottom: 'none' } }}>
                  <Box>
                    <Typography variant="body1" fontWeight={600}>
                      {item.productName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {item.quantity} adet x {item.price.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                    </Typography>
                  </Box>
                  <Typography fontWeight={700}>
                    {(item.quantity * item.price).toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                  </Typography>
                </Box>
              ))}
            </AccordionDetails>
          </Accordion>
        ))
      )}
    </Container>
  );
}
