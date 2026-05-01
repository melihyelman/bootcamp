import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  Box,
  Stepper,
  Step,
  StepLabel,
  Alert,
  CircularProgress,
  Divider
} from '@mui/material';
import { CreditCard, LocalShipping } from '@mui/icons-material';
import { orderService, paymentService } from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const steps = ['Teslimat Adresi', 'Ödeme Bilgileri'];

export default function CheckoutPage() {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [orderId, setOrderId] = useState(null);
  const [orderNumber, setOrderNumber] = useState(null);

  const { cart, totalPrice, fetchCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [addressForm, setAddressForm] = useState({
    shippingAddress: ''
  });

  const [paymentForm, setPaymentForm] = useState({
    cardHolderName: '',
    cardNumber: '',
    expireMonth: '',
    expireYear: '',
    cvc: '',
    buyerName: user?.firstName || '',
    buyerSurname: user?.lastName || '',
    buyerEmail: user?.email || '',
    buyerIdentityNumber: '',
    buyerCity: '',
    buyerCountry: 'Türkiye'
  });

  const handleAddressChange = (e) => setAddressForm({ ...addressForm, [e.target.name]: e.target.value });
  const handlePaymentChange = (e) => setPaymentForm({ ...paymentForm, [e.target.name]: e.target.value });

  const handleNext = async () => {
    if (activeStep === 0) {
      if (!addressForm.shippingAddress.trim()) {
        setError('Lütfen teslimat adresi giriniz');
        return;
      }
      setError(null);
      setLoading(true);
      try {
        // Create Order
        const res = await orderService.create(addressForm);
        setOrderId(res.data.data.id);
        setOrderNumber(res.data.data.orderNumber);
        setActiveStep(1);
      } catch (err) {
        setError(err.message || 'Sipariş oluşturulurken bir hata oluştu');
      } finally {
        setLoading(false);
      }
    } else if (activeStep === 1) {
      if (!paymentForm.cardHolderName || !paymentForm.cardNumber || !paymentForm.expireMonth || !paymentForm.expireYear || !paymentForm.cvc || !paymentForm.buyerName || !paymentForm.buyerSurname || !paymentForm.buyerEmail || !paymentForm.buyerIdentityNumber || !paymentForm.buyerCity) {
        setError('Lütfen tüm ödeme ve alıcı bilgilerini doldurunuz');
        return;
      }
      setError(null);
      setLoading(true);
      try {
        // Process Payment
        const paymentData = {
          orderNumber: orderNumber,
          ...paymentForm
        };
        await paymentService.process(paymentData);
        await fetchCart(); // Refresh cart (should be empty now)
        setActiveStep(2); // Success step
      } catch (err) {
        setError(err.message || 'Ödeme işlemi başarısız oldu');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  if (!cart || cart.items.length === 0 && activeStep !== 2) {
    navigate('/cart');
    return null;
  }

  return (
    <Container maxWidth="md" sx={{ mt: 6, mb: 8 }}>
      <Paper elevation={0} sx={{ p: { xs: 3, md: 5 }, borderRadius: 3, border: '1px solid #e0e0e0' }}>
        <Typography component="h1" variant="h4" align="center" fontWeight={800} gutterBottom>
          Ödeme İşlemi
        </Typography>
        
        <Stepper activeStep={activeStep} sx={{ pt: 3, pb: 5 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

        {activeStep === steps.length ? (
          <Box textAlign="center" py={5}>
            <Typography variant="h5" gutterBottom fontWeight={700} color="success.main">
              Siparişiniz başarıyla alındı!
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" paragraph>
              Sipariş numaranız: <strong>{orderNumber}</strong>. Siparişinizin detaylarını siparişlerim sayfasından takip edebilirsiniz.
            </Typography>
            <Button
              variant="contained"
              onClick={() => navigate('/orders')}
              sx={{ mt: 3, background: 'linear-gradient(135deg, #1a1a2e, #16213e)' }}
            >
              Siparişlerime Git
            </Button>
          </Box>
        ) : (
          <>
            {activeStep === 0 && (
              <Box>
                <Typography variant="h6" gutterBottom fontWeight={600} display="flex" alignItems="center">
                  <LocalShipping sx={{ mr: 1, color: 'primary.main' }} /> Teslimat Adresi
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <TextField
                      required
                      name="shippingAddress"
                      label="Tam Adres"
                      fullWidth
                      multiline
                      rows={4}
                      value={addressForm.shippingAddress}
                      onChange={handleAddressChange}
                      placeholder="Mahalle, Sokak, Bina No, Daire, İlçe, İl"
                    />
                  </Grid>
                </Grid>
              </Box>
            )}

            {activeStep === 1 && (
              <Box>
                <Typography variant="h6" gutterBottom fontWeight={600} display="flex" alignItems="center">
                  <CreditCard sx={{ mr: 1, color: 'primary.main' }} /> Ödeme Bilgileri (Iyzico Test)
                </Typography>
                <Alert severity="info" sx={{ mb: 3 }}>
                  Lütfen Iyzico sandbox test kartı bilgilerini giriniz. Gerçek kart kullanmayınız. Toplam Tutar: <strong>{totalPrice.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}</strong>
                </Alert>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      required
                      name="cardHolderName"
                      label="Kart Üzerindeki İsim"
                      fullWidth
                      value={paymentForm.cardHolderName}
                      onChange={handlePaymentChange}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      required
                      name="cardNumber"
                      label="Kart Numarası"
                      fullWidth
                      value={paymentForm.cardNumber}
                      onChange={handlePaymentChange}
                      placeholder="XXXX XXXX XXXX XXXX"
                    />
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <TextField
                      required
                      name="expireMonth"
                      label="Ay"
                      fullWidth
                      value={paymentForm.expireMonth}
                      onChange={handlePaymentChange}
                      placeholder="MM"
                    />
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <TextField
                      required
                      name="expireYear"
                      label="Yıl"
                      fullWidth
                      value={paymentForm.expireYear}
                      onChange={handlePaymentChange}
                      placeholder="YY"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      required
                      name="cvc"
                      label="CVC"
                      fullWidth
                      value={paymentForm.cvc}
                      onChange={handlePaymentChange}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                      Fatura / Alıcı Bilgileri
                    </Typography>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      required
                      name="buyerName"
                      label="Alıcı Adı"
                      fullWidth
                      value={paymentForm.buyerName}
                      onChange={handlePaymentChange}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      required
                      name="buyerSurname"
                      label="Alıcı Soyadı"
                      fullWidth
                      value={paymentForm.buyerSurname}
                      onChange={handlePaymentChange}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      required
                      name="buyerEmail"
                      label="E-posta"
                      type="email"
                      fullWidth
                      value={paymentForm.buyerEmail}
                      onChange={handlePaymentChange}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      required
                      name="buyerIdentityNumber"
                      label="TC Kimlik No"
                      fullWidth
                      value={paymentForm.buyerIdentityNumber}
                      onChange={handlePaymentChange}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      required
                      name="buyerCity"
                      label="Şehir"
                      fullWidth
                      value={paymentForm.buyerCity}
                      onChange={handlePaymentChange}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      required
                      name="buyerCountry"
                      label="Ülke"
                      fullWidth
                      value={paymentForm.buyerCountry}
                      onChange={handlePaymentChange}
                    />
                  </Grid>
                </Grid>
              </Box>
            )}

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 5 }}>
              {activeStep !== 0 && (
                <Button onClick={handleBack} sx={{ mr: 1 }}>
                  Geri
                </Button>
              )}
              <Button
                variant="contained"
                onClick={handleNext}
                disabled={loading}
                sx={{ background: 'linear-gradient(135deg, #e94560, #c23152)' }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : (activeStep === steps.length - 1 ? 'Ödemeyi Tamamla' : 'İleri')}
              </Button>
            </Box>
          </>
        )}
      </Paper>
    </Container>
  );
}
