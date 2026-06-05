// frontend/src/services/api.js
import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('coaltrade_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('coaltrade_token');
      localStorage.removeItem('coaltrade_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ─── Auth API ─────────────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.put('/auth/change-password', data),
};

// ─── Listings API ─────────────────────────────────────────────
export const listingsAPI = {
  getAll: (params) => api.get('/listings', { params }),
  getById: (id) => api.get(`/listings/${id}`),
  getMyListings: () => api.get('/listings/my/listings'),
  create: (data) => api.post('/listings', data),
  update: (id, data) => api.put(`/listings/${id}`, data),
  delete: (id) => api.delete(`/listings/${id}`),
};

// ─── Trade API ────────────────────────────────────────────────
export const tradeAPI = {
  sendRequest: (data) => api.post('/trade', data),
  getMyRequests: () => api.get('/trade/my'),
  updateStatus: (id, status) => api.put(`/trade/${id}/status`, { status }),
  getAll: () => api.get('/trade'),
};

// ─── AI API ───────────────────────────────────────────────────
export const aiAPI = {
  predict: (data) => api.post('/ai/predict', data),
  getMarketInsights: () => api.get('/ai/market-insights'),
  getStatus: () => api.get('/ai/status'),
};

// ─── Admin API ────────────────────────────────────────────────
export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getUsers: () => api.get('/admin/users'),
  toggleUserStatus: (id) => api.put(`/admin/users/${id}/toggle-status`),
  updateUserRole: (id, role) => api.put(`/admin/users/${id}/role`, { role }),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  getAllListings: () => api.get('/admin/listings'),
};

export default api;
