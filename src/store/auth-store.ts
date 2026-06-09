import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { User } from '../types/user';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  token: string | null;
  checkSession: () => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  loginWithProvider: (provider: 'google' | 'apple') => Promise<void>; // <--- DRUGA METODA
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isLoading: false,
  error: null,

  checkSession: async () => {
    set({ isLoading: true });
    try {
      const savedToken = await SecureStore.getItemAsync('auth_token');
      const savedEmail = await SecureStore.getItemAsync('user_email');
      const savedId = await SecureStore.getItemAsync('user_id');

      if (savedToken && savedEmail && savedId) {
        set({ token: savedToken, user: { email: savedEmail, id: savedId }, isLoading: false });
      } else {
        set({ user: null, token: null, isLoading: false });
      }
    } catch (e) {
      set({ user: null, token: null, isLoading: false });
    }
  },

loginWithEmail: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      // Tutaj w prawdziwej aplikacji wywołujemy np. await supabase.auth.signInWithPassword
      // To zrobimy pozniej
      // Symulujemy bezpieczną odpowiedź serwisu uwierzytelniającego, generując token JWT:
      if (password.length < 6) {
        throw new Error("Hasło musi mieć minimum 6 znaków.");
      }
      
      const mockToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." + Date.now();
      const generatedUserId = "usr_" + btoa(email).substring(0, 10);

      // Zapisujemy bezpiecznie dane sesji w SecureStore urządzenia
      await SecureStore.setItemAsync('auth_token', mockToken);
      await SecureStore.setItemAsync('user_email', email);
      await SecureStore.setItemAsync('user_id', generatedUserId);

      set({ token: mockToken, user: { email, id: generatedUserId }, isLoading: false, error: null });
    } catch (e: any) {
      set({ error: e.message || 'Błąd uwierzytelniania.', isLoading: false });
    }
  },

  loginWithProvider: async (provider: 'google' | 'apple') => {
    set({ isLoading: true, error: null });
    try {
      // Integracja z Expo AuthSession / Apple Authentication
      const mockToken = `oauth_token_${provider}_` + Date.now();
      const mockEmail = `${provider}_user@example.com`;
      const mockId = `usr_${provider}_123`;

      await SecureStore.setItemAsync('auth_token', mockToken);
      await SecureStore.setItemAsync('user_email', mockEmail);
      await SecureStore.setItemAsync('user_id', mockId);

      set({ token: mockToken, user: { email: mockEmail, id: mockId }, isLoading: false, error: null });
    } catch (e) {
      set({ error: `Logowanie przez ${provider} nie powiodło się.`, isLoading: false });
    }
  },

  logout: async () => {
    try {
      await SecureStore.deleteItemAsync('auth_token');
      await SecureStore.deleteItemAsync('user_email');
      await SecureStore.deleteItemAsync('user_id');
      set({ user: null, token: null, error: null });
    } catch (e) {
      console.error('Błąd podczas wylogowywania:', e);
    }
  },
}));