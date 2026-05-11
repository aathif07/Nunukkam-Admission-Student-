import axios from 'axios';

let envApiUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL;

// Ensure it ends with /api if it's provided but missing the path
if (envApiUrl && !envApiUrl.endsWith('/api')) {
  envApiUrl = envApiUrl.replace(/\/$/, '') + '/api';
}

let API_BASE = envApiUrl || 'http://localhost:4000/api';

if (API_BASE.includes('localhost') && window.location.hostname === 'demoenrollment.nunukkam.com') {
  API_BASE = 'https://demoenrollmentbackend.nunukkam.com/api';
} else if (API_BASE.includes('localhost') && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
  console.error("🚨 CRITICAL: Frontend is trying to connect to a localhost API from a production domain. Please set the VITE_API_URL environment variable in Dokploy (under Environment) and rebuild the frontend.");
}

const api = axios.create({ baseURL: API_BASE });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('eis_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    // Only redirect if NOT on the login page and it's a 401
    if (err.response?.status === 401 && !err.config.url.includes('/auth/login')) {
      localStorage.removeItem('eis_token');
      localStorage.removeItem('eis_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
