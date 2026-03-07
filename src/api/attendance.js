import axios from 'axios';
import { baseURL } from '../constants';

const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' },
});

export default {
  list: (params) => api.get('/attendance', { params: params || {} }),
  punch: (action, date) => api.post('/attendance', { action, date }),
  createOrUpdate: (data) => api.post('/attendance', data),
};
