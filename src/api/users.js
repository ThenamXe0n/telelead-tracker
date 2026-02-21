import axios from 'axios';

const api = axios.create({
  baseURL: 'https://server-za3w.onrender.com/api',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json', "ngrok-skip-browser-warning": "true" },
});

export default {
  list: (role) => api.get('/users', { params: role ? { role } : {} }),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
};
