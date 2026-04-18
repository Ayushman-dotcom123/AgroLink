import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
})

// Attach JWT token
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const auth = JSON.parse(localStorage.getItem('agrolink-auth') || '{}')
    const token = auth?.state?.token
    if (token) config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle 401 — session expired, redirect to login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      // Clear auth state
      const stored = JSON.parse(localStorage.getItem('agrolink-auth') || '{}')
      if (stored?.state?.isAuthenticated) {
        localStorage.removeItem('agrolink-auth')
        window.location.href = '/auth/login'
      }
    }
    return Promise.reject(error)
  }
)

// Auth
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
}

// Crops / Marketplace
export const cropAPI = {
  list: (params) => api.get('/crops', { params }),
  get: (id) => api.get(`/crops/${id}`),
  create: (data) => api.post('/crops', data),
  update: (id, data) => api.put(`/crops/${id}`, data),
  delete: (id) => api.delete(`/crops/${id}`),
  myListings: () => api.get('/crops/my/listings'),
}

// Orders
export const orderAPI = {
  create: (data) => api.post('/orders', data),
  list: () => api.get('/orders'),
  get: (id) => api.get(`/orders/${id}`),
  updateStatus: (id, status) => api.put(`/orders/${id}/status`, { status }),
  myOrders: () => api.get('/orders/my/orders'),
}

// Farm Management
export const farmAPI = {
  list: () => api.get('/farms'),
  create: (data) => api.post('/farms', data),
  update: (id, data) => api.put(`/farms/${id}`, data),
  delete: (id) => api.delete(`/farms/${id}`),
}

// Inventory
export const inventoryAPI = {
  list: () => api.get('/inventory'),
  create: (data) => api.post('/inventory', data),
  update: (id, data) => api.put(`/inventory/${id}`, data),
  delete: (id) => api.delete(`/inventory/${id}`),
}

// Expenses
export const expenseAPI = {
  list: (params) => api.get('/expenses', { params }),
  create: (data) => api.post('/expenses', data),
  summary: () => api.get('/expenses/summary'),
}

// Weather
export const weatherAPI = {
  get: (city) => api.get(`/weather?city=${city}`),
}

// AI Recommendations
export const aiAPI = {
  recommend: (data) => api.post('/ai/recommend', data),
}

// Admin
export const adminAPI = {
  farmers: () => api.get('/admin/farmers'),
  approveFarmer: (id) => api.put(`/admin/farmers/${id}/approve`),
  orders: () => api.get('/admin/orders'),
  stats: () => api.get('/admin/stats'),
  notifications: (data) => api.post('/admin/notifications', data),
}

export default api
