import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

interface AuthState {
  user: string | null;
  isLoading: boolean;
  error: string | null;
  checkSession: () => Promise<void>;
  login: (username: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,
  error: null,

  checkSession: async () => {
    set({ isLoading: true });
    try {
      const savedUser = await SecureStore.getItemAsync('user_session');
      set({ user: savedUser, isLoading: false });
    } catch (e) {
      set({ user: null, isLoading: false });
    }
  },

  login: async (username: string) => {
    set({ isLoading: true, error: null });
    try {
      await SecureStore.setItemAsync('user_session', username);
      set({ user: username, isLoading: false, error: null });
    } catch (e) {
      set({ error: 'Nie udało się bezpiecznie zalogować.', isLoading: false });
    }
  },

  logout: async () => {
    try {
      await SecureStore.deleteItemAsync('user_session');
      set({ user: null, error: null });
    } catch (e) {
      console.error('Błąd podczas wylogowywania:', e);
    }
  },
}));