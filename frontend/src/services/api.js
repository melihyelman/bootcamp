import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor — attach JWT token and X-User-Id
api.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  if (user?.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  if (user?.userId) {
    config.headers['X-User-Id'] = user.userId;
  }
  return config;
});

// Response interceptor — unwrap ApiResponse
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message || error.message || 'Bir hata oluştu';
    return Promise.reject({ message, status: error.response?.status });
  }
);

// ─── Auth Service ─────────────────────────────────────────────
export const authService = {
  // POST /api/auth/register
  register: (data) => api.post('/api/auth/register', data),

  // POST /api/auth/login
  login: (data) => api.post('/api/auth/login', data),

  // GET /api/auth/validate?token=
  validate: (token) => api.get('/api/auth/validate', { params: { token } }),
};

// ─── Product Service ──────────────────────────────────────────
export const productService = {
  // GET /api/products?page=0&size=10&sortBy=id&sortDir=asc
  getAll: (page = 0, size = 10, sortBy = 'id', sortDir = 'asc') =>
    api.get('/api/products', { params: { page, size, sortBy, sortDir } }),

  // GET /api/products/{id}
  getById: (id) => api.get(`/api/products/${id}`),

  // GET /api/products/search?keyword=&page=0&size=10
  search: (keyword, page = 0, size = 10) =>
    api.get('/api/products/search', { params: { keyword, page, size } }),

  // GET /api/products/category/{category}?page=0&size=10
  getByCategory: (category, page = 0, size = 10) =>
    api.get(`/api/products/category/${category}`, { params: { page, size } }),

  // POST /api/products (Admin)
  create: (data) => api.post('/api/products', data),

  // PUT /api/products/{id} (Admin)
  update: (id, data) => api.put(`/api/products/${id}`, data),

  // DELETE /api/products/{id} (Admin)
  delete: (id) => api.delete(`/api/products/${id}`),
};

// ─── Cart Service ─────────────────────────────────────────────
export const cartService = {
  // GET /api/cart
  get: () => api.get('/api/cart'),

  // POST /api/cart/items
  addItem: (data) => api.post('/api/cart/items', data),

  // PUT /api/cart/items/{itemId}?quantity=
  updateItem: (itemId, quantity) =>
    api.put(`/api/cart/items/${itemId}`, null, { params: { quantity } }),

  // DELETE /api/cart/items/{itemId}
  removeItem: (itemId) => api.delete(`/api/cart/items/${itemId}`),

  // DELETE /api/cart
  clear: () => api.delete('/api/cart'),
};

// ─── Order Service ────────────────────────────────────────────
export const orderService = {
  // POST /api/orders
  create: (data) => api.post('/api/orders', data),

  // GET /api/orders
  getAll: () => api.get('/api/orders'),

  // GET /api/orders/{orderId}
  getById: (orderId) => api.get(`/api/orders/${orderId}`),
};

// ─── Payment Service ──────────────────────────────────────────
export const paymentService = {
  // POST /api/payments/process
  process: (data) => api.post('/api/payments/process', data),
};

export default api;
