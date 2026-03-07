import axios from 'axios';
import { baseURL } from '../constant';

const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json', "ngrok-skip-browser-warning": "true" },
});

export default {
  overview: () => api.get('/stats/overview'),
  sheet: (sheetId) => api.get(`/stats/sheets/${sheetId}`),
  telecallerStats: () => api.get('/stats/telecallers'),
  leads: (params) => api.get('/stats/leads', { params: params || {} }),
  monthlyConversions: () => api.get('/stats/monthly-conversions'),
  leadRecords: (callingNumberId) => api.get(`/stats/lead-records/${callingNumberId}`),
};
