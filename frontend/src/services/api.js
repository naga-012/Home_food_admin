import axios from 'axios';

const rawApiUrl = (import.meta.env.VITE_API_URL || 'https://inti-ruchi-backend.onrender.com').trim();
let trimmedApiUrl = rawApiUrl.replace(/\/+$/, '');
if (trimmedApiUrl && !trimmedApiUrl.includes('.') && !trimmedApiUrl.includes('localhost') && !trimmedApiUrl.includes('127.0.0.1')) {
  trimmedApiUrl = `${trimmedApiUrl}.onrender.com`;
}
if (trimmedApiUrl && !trimmedApiUrl.startsWith('http://') && !trimmedApiUrl.startsWith('https://')) {
  trimmedApiUrl = `https://${trimmedApiUrl}`;
}
export const API_BASE_URL = trimmedApiUrl;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach bearer token if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('inti_ruchi_admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// Global response interceptor for 401/403
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      if (error.response.status === 401) {
        localStorage.removeItem('inti_ruchi_admin_token');
        localStorage.removeItem('inti_ruchi_admin_user');
        if (!window.location.pathname.includes('/admin/login')) {
          window.location.href = '/admin/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export const adminApi = {
  // Auth
  login: (credentials) => api.post('/api/admin/login', credentials),
  
  // Dashboard & Metrics
  getDashboard: () => api.get('/api/admin/dashboard'),

  // Orders
  getOrders: (params) => api.get('/api/admin/orders', { params }),
  getOrder: (id) => api.get(`/api/admin/orders/${id}`),
  acceptOrder: (id) => api.post(`/api/admin/orders/${id}/accept`),
  rejectOrder: (id, reason) => api.post(`/api/admin/orders/${id}/reject`, { reason }),
  updateOrderStatus: (id, payload) => api.patch(`/api/admin/orders/${id}/status`, payload),

  // Customers
  getCustomers: (params) => api.get('/api/admin/customers', { params }),
  getCustomer: (id) => api.get(`/api/admin/customers/${id}`),
  toggleCustomerStatus: (id) => api.patch(`/api/admin/customers/${id}/status`),

  // Foods
  getFoods: (params) => api.get('/api/admin/foods', { params }),
  createFood: (data) => api.post('/api/admin/foods', data),
  updateFoodStatus: (id, payload) => api.patch(`/api/admin/foods/${id}/status`, payload),
  deleteFood: (id) => api.delete(`/api/admin/foods/${id}`),
  uploadImage: (formData) => api.post('/api/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),

  // Categories
  getCategories: () => api.get('/api/admin/categories'),

  // Cooks
  getCooks: (params) => api.get('/api/admin/cooks', { params }),
  approveCook: (id) => api.patch(`/api/admin/cooks/${id}/approve`),
  rejectCook: (id) => api.patch(`/api/admin/cooks/${id}/reject`),
  suspendCook: (id) => api.patch(`/api/admin/cooks/${id}/suspend`),

  // Reports
  getRevenueReport: () => api.get('/api/admin/reports/revenue'),
  getOrdersReport: () => api.get('/api/admin/reports/orders'),

  // Notifications & Audit
  getNotifications: () => api.get('/api/admin/notifications'),
  getAuditLogs: (limit = 50) => api.get('/api/admin/audit-logs', { params: { limit } }),
};

export default api;
