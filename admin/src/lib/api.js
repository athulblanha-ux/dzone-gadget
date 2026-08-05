import axios from 'axios';

const api = axios.create({
  baseURL: (import.meta.env.VITE_API_URL || 'http://localhost:5001/api').trim(),
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && error.response?.data?.code === 'TOKEN_EXPIRED') {
      try {
        const { data } = await api.post('/auth/refresh');
        localStorage.setItem('adminToken', data.accessToken);
        error.config.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(error.config);
      } catch {
        localStorage.removeItem('adminToken');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
