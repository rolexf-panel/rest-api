import axios from 'axios';

// Konfigurasi instance Axios untuk komunikasi dengan API
const api = axios.create({
  baseURL: '/api/v1',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Flag untuk mencegah multiple refresh request
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Request interceptor — tambahkan token jika ada
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Jika error 401 dan bukan request refresh/login/register
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes('/auth/login') &&
      !originalRequest.url.includes('/auth/register') &&
      !originalRequest.url.includes('/auth/refresh-token')
    ) {
      // Jika sedang refresh, antri request ini
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      // Coba refresh token
      const refreshToken = localStorage.getItem('refreshToken');

      if (refreshToken) {
        try {
          const response = await api.post('/auth/refresh-token', {
            refreshToken,
          });

          const { accessToken } = response.data.data;

          // Simpan token baru
          localStorage.setItem('accessToken', accessToken);

          // Update header untuk request yang gagal
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;

          // Proses antrian request yang menunggu
          processQueue(null, accessToken);

          // Retry request yang gagal
          return api(originalRequest);
        } catch (refreshError) {
          // Refresh gagal, hapus token dan redirect
          processQueue(refreshError, null);
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');

          // Redirect ke login jika bukan halaman publik
          if (!window.location.pathname.includes('/login')) {
            window.location.href = '/login';
          }

          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      } else {
        // Tidak ada refresh token, hapus dan redirect
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        isRefreshing = false;

        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      }
    }

    return Promise.reject(error);
  }
);

export default api;
