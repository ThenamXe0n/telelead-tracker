import axios from 'axios';

const api = axios.create({
  baseURL: 'https://zora-undedicated-janean.ngrok-free.dev/api',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json', "ngrok-skip-browser-warning": "true" },
});

api.interceptors.response.use(
  (r) => r,
  (e) => {
    // Don't redirect on 401 for /auth/me – that's the initial session check; AuthContext will set user null
    const isMeRequest = e.config?.url?.includes('auth/me');
    if (e.response?.status === 401 && !isMeRequest) {
      window.location.href = '/login';
    }
    return Promise.reject(e);
  }
);

export default {
  login: (email, password) => api.post('/auth/login', { email, password }),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
};
