import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' },
});

export default {
  list: (params) => api.get('/attendance', { params: params || {} }),
  punch: (action, date) => api.post('/attendance', { action, date }),
  createOrUpdate: (data) => api.post('/attendance', data),
};
