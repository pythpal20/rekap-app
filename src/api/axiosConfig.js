import axios from 'axios';

export const API_BASE = 'http://localhost:5001/api';
export const FILE_BASE = 'http://localhost:5001/uploads';

axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('sirekap_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default axios;