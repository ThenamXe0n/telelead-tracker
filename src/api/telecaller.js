import axios from 'axios';

const api = axios.create({
  baseURL: 'https://zora-undedicated-janean.ngrok-free.dev/api',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json', "ngrok-skip-browser-warning": "true" },
});

export default {
  counts: () => api.get('/telecaller/counts'),
  assigned: () => api.get('/telecaller/assigned'),
  pending: () => api.get('/telecaller/pending'),
  followUp: () => api.get('/telecaller/follow-up'),
  converted: () => api.get('/telecaller/converted'),
  closeCall: (callingNumberId, data) => api.post(`/telecaller/calls/${callingNumberId}/close`, data),
};
