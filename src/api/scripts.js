import axios from 'axios';
import { baseURL } from '../constant';

const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json', "ngrok-skip-browser-warning": "true" },
});

export default {
  list: () => api.get('/scripts'),
  get: (id) => api.get(`/scripts/${id}`),
  create: (data) => api.post('/scripts', data),
  update: (id, data) => api.put(`/scripts/${id}`, data),
  delete: (id) => api.delete(`/scripts/${id}`),
};
