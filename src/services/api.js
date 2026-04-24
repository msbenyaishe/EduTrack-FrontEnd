import axios from 'axios';

const baseURL = (
  import.meta.env.VITE_API_URL ||
  'https://edutrack-backend-five.vercel.app/api'
).replace(/\/$/, '');

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const cache = new Map();

// Add a request interceptor to attach token and handle caching
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Only cache GET requests
    if (config.method === 'get') {
      const cachedData = sessionStorage.getItem(`cache_${config.url}`);
      if (cachedData) {
        config.adapter = (config) => {
          return new Promise((resolve) => {
            const res = {
              data: JSON.parse(cachedData),
              status: 200,
              statusText: 'OK',
              headers: { 'x-from-cache': 'true' },
              config,
              request: {}
            };
            resolve(res);
          });
        };
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add a response interceptor to handle 401s and update cache
api.interceptors.response.use(
  (response) => {
    if (response.config.method === 'get' && !response.headers['x-from-cache']) {
      sessionStorage.setItem(`cache_${response.config.url}`, JSON.stringify(response.data));
    }
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.clear();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
