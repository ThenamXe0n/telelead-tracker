import axios from 'axios';

const api = axios.create({
  baseURL: 'https://server-za3w.onrender.com/api',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json', "ngrok-skip-browser-warning": "true" },
});

export default {
  list: () => api.get('/sheets'),
  get: (id) => api.get(`/sheets/${id}`),
  create: (name) => api.post('/sheets', { name }),
  update: (id, name) => api.put(`/sheets/${id}`, { name }),
  delete: (id) => api.delete(`/sheets/${id}`),
  getNumbers: (id, page = 1, limit = 20) => api.get(`/sheets/${id}/numbers`, { params: { page, limit } }),
  uploadCSV: (id, file) => {
    const form = new FormData();
    form.append('file', file);
    return api.post(`/sheets/${id}/upload`, form, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
  uploadImport: (id, filename, phoneColumn, nameColumn) =>
    api.post(`/sheets/${id}/upload-import`, { filename, phoneColumn, nameColumn: nameColumn || undefined }),
  addNumber: (id, phone, name) => api.post(`/sheets/${id}/numbers`, { phone, name }),
  assign: (id, telecallerIds) => api.post(`/sheets/${id}/assign`, { telecallerIds: telecallerIds || [] }),
};
