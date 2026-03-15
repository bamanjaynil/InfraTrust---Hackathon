import { create } from 'zustand';

const storedUser = (() => {
  try {
    const raw = localStorage.getItem('auth_user');
    return raw ? JSON.parse(raw) : null;
  } catch (_error) {
    return null;
  }
})();

export const useAuthStore = create((set) => ({
  user: storedUser,
  token: localStorage.getItem('token') || null,
  role: storedUser?.role || null,
  isAuthenticated: !!localStorage.getItem('token'),
  
  login: (userData, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('auth_user', JSON.stringify(userData));
    set({
      user: userData,
      token,
      role: userData.role,
      isAuthenticated: true,
    });
  },
  
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('auth_user');
    set({
      user: null,
      token: null,
      role: null,
      isAuthenticated: false,
    });
  },
  
  setUser: (userData) => {
    if (userData) {
      localStorage.setItem('auth_user', JSON.stringify(userData));
    } else {
      localStorage.removeItem('auth_user');
    }
    set({ user: userData, role: userData?.role || null });
  },
}));
