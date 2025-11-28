import axios from 'axios';

const API_BASE_URL = 'http://localhost:9090/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add JWT token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  signup: (userData) => api.post('/auth/signup', userData),
  registerOwner: (ownerData) => api.post('/auth/register-owner', ownerData),
};

// Dishes API
export const dishAPI = {
  getAll: () => api.get('/dishes'),
  getAvailable: () => api.get('/dishes/available'),
  search: (name, category) => {
    const params = new URLSearchParams();
    if (name) params.append('name', name);
    if (category) params.append('category', category);
    return api.get(`/dishes/search?${params.toString()}`);
  },
  getByRestaurant: (restaurantId) => api.get(`/dishes/restaurant/${restaurantId}`),
  getByCategory: (category) => api.get(`/dishes/category/${category}`),
  add: (dish) => api.post('/dishes/add', dish),
  update: (id, dish) => api.put(`/dishes/${id}`, dish),
  delete: (id) => api.delete(`/dishes/${id}`),
};

// Restaurants API
export const restaurantAPI = {
  getAll: () => api.get('/restaurants'),
  getById: (id) => api.get(`/restaurants/${id}`),
  getByOwner: (ownerId) => api.get(`/restaurants/owner/${ownerId}`),
  add: (restaurant) => api.post('/restaurants/add', restaurant),
  register: (restaurant) => api.post('/restaurants/register', restaurant),
  update: (id, restaurant) => api.put(`/restaurants/${id}`, restaurant),
  delete: (id) => api.delete(`/restaurants/${id}`),
};

// Reviews API
export const reviewAPI = {
  getByRestaurant: (restaurantId) => api.get(`/reviews/restaurant/${restaurantId}`),
  add: (review) => api.post('/reviews/add', review),
};

// Admin API
export const adminAPI = {
  getUsers: () => api.get('/admin/users'),
  getRestaurants: () => api.get('/admin/restaurants'),
  deleteUser: (id) => api.delete(`/admin/user/${id}`),
};

export default api;