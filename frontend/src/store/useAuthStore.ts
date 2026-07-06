import { create } from 'zustand';
import { apiFetch } from '../utils/api';
import { getFriendlyValidationMessages, normalizeValidationErrors } from '../utils/validation';

interface User {
  id: number;
  name: string;
  email: string;
  balance: number;
  monthly_budget_limit: number;
  created_at?: string;
  role?: string;
  username?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  validationErrors: Record<string, string[]>;
  login: (credentials: any) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: { name: string }) => Promise<any>;
  fetchUser: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('kupat_token'),
  isAuthenticated: !!localStorage.getItem('kupat_token'),
  isLoading: false,
  error: null,
  validationErrors: {},
  clearError: () => set({ error: null, validationErrors: {} }),
  login: async (credentials) => {
    set({ isLoading: true, error: null, validationErrors: {} });
    try {
      const res = await apiFetch('/login', {
        method: 'POST',
        body: JSON.stringify(credentials)
      });
      localStorage.setItem('kupat_token', res.data.token);
      set({ user: res.data.user, token: res.data.token, isAuthenticated: true, isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false, validationErrors: {} });
      throw err;
    }
  },
  register: async (data) => {
    set({ isLoading: true, error: null, validationErrors: {} });
    try {
      const res = await apiFetch('/register', {
        method: 'POST',
        body: JSON.stringify(data)
      });
      localStorage.setItem('kupat_token', res.data.token);
      set({ user: res.data.user, token: res.data.token, isAuthenticated: true, isLoading: false });
    } catch (err: any) {
      const normalizedErrors = normalizeValidationErrors(err.errors);
      const friendlyMessages = getFriendlyValidationMessages(normalizedErrors);
      set({
        error: friendlyMessages[0] || err.message || 'Registrasi gagal.',
        validationErrors: normalizedErrors || {},
        isLoading: false,
      });
      throw err;
    }
  },
  logout: async () => {
    set({ isLoading: true });
    try {
      await apiFetch('/logout', { method: 'POST' });
    } catch (e) {
      // Ignore logout errors
    } finally {
      localStorage.removeItem('kupat_token');
      set({ user: null, token: null, isAuthenticated: false, isLoading: false });
    }
  },
  updateProfile: async (data) => {
    set({ isLoading: true, error: null, validationErrors: {} });
    try {
      const res = await apiFetch('/user', {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      set({ user: res.data.user, isLoading: false });
      return res;
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },
  fetchUser: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await apiFetch('/user');
      set({ user: res.data.user, isAuthenticated: true, isLoading: false });
    } catch (err: any) {
      localStorage.removeItem('kupat_token');
      set({ user: null, token: null, isAuthenticated: false, error: err.message, validationErrors: {}, isLoading: false });
    }
  }
}));
