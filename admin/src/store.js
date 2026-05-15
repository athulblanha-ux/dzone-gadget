import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(persist(
  (set) => ({
    user: null,
    token: null,
    isAuthenticated: false,
    setAuth: (user, token) => {
      localStorage.setItem('adminToken', token);
      set({ user, token, isAuthenticated: true });
    },
    logout: () => {
      localStorage.removeItem('adminToken');
      set({ user: null, token: null, isAuthenticated: false });
    }
  }),
  { name: 'd-store-admin-auth' }
));

export const useThemeStore = create(persist(
  (set, get) => ({
    isDark: true,
    toggle: () => {
      const dark = !get().isDark;
      document.documentElement.classList.toggle('dark', dark);
      set({ isDark: dark });
    },
    init: () => document.documentElement.classList.toggle('dark', get().isDark)
  }),
  { name: 'd-store-admin-theme-v2' }
));
