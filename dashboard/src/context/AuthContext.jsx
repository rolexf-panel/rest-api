import { createContext, useContext, useState, useEffect } from 'react';
import api from '../lib/api';

/**
 * Context untuk state autentikasi
 * Menyimpan data user, token, dan status login
 */

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(() => localStorage.getItem('accessToken'));

  // Load user dari token saat pertama kali
  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        try {
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          const response = await api.get('/auth/profil');
          setUser(response.data.data);
        } catch (error) {
          // Token tidak valid, hapus
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          setToken(null);
          delete api.defaults.headers.common['Authorization'];
        }
      }
      setLoading(false);
    };

    loadUser();
  }, [token]);

  // Login
  const login = async (email, kataSandi) => {
    const response = await api.post('/auth/login', { email, kataSandi });
    const { accessToken, refreshToken, pengguna } = response.data.data;

    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

    setToken(accessToken);
    setUser(pengguna);

    return pengguna;
  };

  // Register
  const register = async (email, kataSandi, nama) => {
    const response = await api.post('/auth/register', { email, kataSandi, nama });
    return response.data.data;
  };

  // Logout
  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      // Abaikan error logout
    }

    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    delete api.defaults.headers.common['Authorization'];

    setToken(null);
    setUser(null);
  };

  // Update profil
  const updateProfil = async (data) => {
    const response = await api.patch('/auth/profil', data);
    setUser(response.data.data);
    return response.data.data;
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    updateProfil,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth harus digunakan di dalam AuthProvider');
  }
  return context;
}
