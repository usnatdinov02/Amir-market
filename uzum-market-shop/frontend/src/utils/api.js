import axios from 'axios';
import Cookies from 'js-cookie';

// Create axios instance with default config
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      Cookies.remove('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API endpoints
export const authAPI = {
  // User authentication
  register: (userData) => api.post('/auth/register', userData),
  login: (email, password) => api.post('/auth/login', { email, password }),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  updateProfile: (userData) => api.put('/auth/update-profile', userData),
  changePassword: (currentPassword, newPassword) => 
    api.put('/auth/change-password', { currentPassword, newPassword }),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (resetToken, password) => 
    api.put(`/auth/reset-password/${resetToken}`, { password }),

  // Admin authentication
  adminLogin: (email, password) => api.post('/auth/admin/login', { email, password }),
  adminRegister: (userData) => api.post('/auth/admin/register', userData),
};

// Products API endpoints
export const productsAPI = {
  // Get products with filters and pagination
  getProducts: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return api.get(`/products${queryString ? `?${queryString}` : ''}`);
  },
  
  // Get single product
  getProduct: (id) => api.get(`/products/${id}`),
  
  // Search products
  searchProducts: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return api.get(`/products/search${queryString ? `?${queryString}` : ''}`);
  },
  
  // Get products by category
  getProductsByCategory: (category, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return api.get(`/products/category/${category}${queryString ? `?${queryString}` : ''}`);
  },
  
  // Get featured products
  getFeaturedProducts: () => api.get('/products/featured'),
  
  // Get top products
  getTopProducts: () => api.get('/products/top'),
  
  // Product reviews
  getProductReviews: (productId) => api.get(`/products/${productId}/reviews`),
  addProductReview: (productId, reviewData) => 
    api.post(`/products/${productId}/reviews`, reviewData),
  deleteProductReview: (productId, reviewId) => 
    api.delete(`/products/${productId}/reviews/${reviewId}`),
  
  // Admin product management
  createProduct: (productData) => api.post('/products', productData),
  updateProduct: (id, productData) => api.put(`/products/${id}`, productData),
  deleteProduct: (id) => api.delete(`/products/${id}`),
  uploadProductImage: (id, imageData) => {
    const formData = new FormData();
    formData.append('image', imageData);
    return api.post(`/products/${id}/upload-image`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
};

// Cart API endpoints
export const cartAPI = {
  getCart: () => api.get('/cart'),
  addToCart: (productId, quantity = 1) => 
    api.post('/cart/add', { productId, quantity }),
  updateCartItem: (productId, quantity) => 
    api.put(`/cart/${productId}`, { quantity }),
  removeFromCart: (productId) => api.delete(`/cart/${productId}`),
  clearCart: () => api.delete('/cart'),
};

// Orders API endpoints
export const ordersAPI = {
  // User order management
  createOrder: (orderData) => api.post('/orders', orderData),
  getMyOrders: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return api.get(`/orders/my-orders${queryString ? `?${queryString}` : ''}`);
  },
  getOrderById: (id) => api.get(`/orders/${id}`),
  updateOrderToPaid: (id, paymentData) => 
    api.put(`/orders/${id}/pay`, paymentData),
  
  // Admin order management
  getAllOrders: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return api.get(`/orders${queryString ? `?${queryString}` : ''}`);
  },
  updateOrderStatus: (id, statusData) => 
    api.put(`/orders/${id}/status`, statusData),
  updateOrderToDelivered: (id) => api.put(`/orders/${id}/deliver`),
  getOrderStats: () => api.get('/orders/stats/overview'),
};

// Admin API endpoints
export const adminAPI = {
  // Dashboard
  getDashboardStats: () => api.get('/admin/dashboard'),
  
  // User management
  getAllUsers: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return api.get(`/admin/users${queryString ? `?${queryString}` : ''}`);
  },
  getUserById: (id) => api.get(`/admin/users/${id}`),
  updateUser: (id, userData) => api.put(`/admin/users/${id}`, userData),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  
  // Product management
  getAdminProducts: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return api.get(`/admin/products${queryString ? `?${queryString}` : ''}`);
  },
  updateProductStatus: (id, statusData) => 
    api.put(`/admin/products/${id}/status`, statusData),
  bulkUpdateProducts: (productIds, updates) => 
    api.put('/admin/products/bulk-update', { productIds, updates }),
};

// Health check
export const healthAPI = {
  check: () => api.get('/health'),
  getAPIInfo: () => api.get('/'),
};

// Export default api instance for custom requests
export default api;