import { create } from 'zustand';
import api from '../api/apiClient';

const useAuthStore = create((set, get) => ({
  user: null,
  token: localStorage.getItem('token') || null,
  isAuthenticated: !!localStorage.getItem('token'),
  isLoading: false,
  error: null,

  login: async (username, password) => {
    set({ isLoading: true, error: null });
    try {
      // The API specifies /api/users/login/
      const response = await api.post('/api/users/login/', { username, password });
      const { token } = response.data; // Assuming token is returned like this
      localStorage.setItem('token', token);
      
      set({ token, isAuthenticated: true, isLoading: false });
      await get().fetchProfile();
      return true;
    } catch (error) {
      set({ error: error.response?.data?.detail || 'Failed to login', isLoading: false });
      return false;
    }
  },

  fetchProfile: async () => {
    try {
      const response = await api.get('/api/users/profile/');
      set({ user: response.data });
    } catch (error) {
      console.error('Failed to fetch profile', error);
      if (error.response?.status === 401) {
        get().logout();
      }
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null, isAuthenticated: false });
  }
}));

export default useAuthStore;
