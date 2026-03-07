import axios from 'axios';
import { baseURL } from '../constant';

const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json', "ngrok-skip-browser-warning": "true" },
});

export default {
  list: (role) => api.get('/users', { params: role ? { role } : {} }),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
};
