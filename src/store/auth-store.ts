import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { User, UserDto } from '../types/user';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  token: string | null;
  checkSession: () => Promise<void>;
  loginWithEmail: (dto: UserDto) => Promise<void>;
  loginWithProvider: (dto: UserDto) => Promise<void>; // <--- DRUGA METODA
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

loginWithEmail: async (dto: UserDto) => {
    set({ isLoading: true, error: null });
    try {
      // Tutaj w prawdziwej aplikacji wywołujemy np. await supabase.auth.signInWithPassword
      // To zrobimy pozniej
      // Symulujemy bezpieczną odpowiedź serwisu uwierzytelniającego, generując token JWT:
      if (!dto.password || dto.password.length < 6) {
        throw new Error("Hasło musi mieć minimum 6 znaków.");
      }
      
      const mockToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." + Date.now();
      const generatedUserId = "usr_" + btoa(dto.email).substring(0, 10);

      // Zapisujemy bezpiecznie dane sesji w SecureStore urządzenia
      await SecureStore.setItemAsync('auth_token', mockToken);
      await SecureStore.setItemAsync('user_email', dto.email);
      await SecureStore.setItemAsync('user_id', generatedUserId);

      set({
        user: { id: generatedUserId, email: dto.email, token: mockToken }, 
        isLoading: false, 
        error: null
     });
    } catch (e: any) {
      set({ error: e.message || 'Błąd uwierzytelniania.', isLoading: false });
    }
  },

  loginWithProvider: async (dto: UserDto) => {
    set({ isLoading: true, error: null });
    try {
      // Integracja z Expo AuthSession / Apple Authentication
      const mockToken = `oauth_token_${dto.provider}_` + Date.now();
      const mockEmail = `${dto.provider}_user@example.com`;
      const mockId = `usr_${dto.provider}_123`;

      await SecureStore.setItemAsync('auth_token', mockToken);
      await SecureStore.setItemAsync('user_email', mockEmail);
      await SecureStore.setItemAsync('user_id', mockId);

      set({ token: mockToken, user: { email: mockEmail, id: mockId }, isLoading: false, error: null });
    } catch (e) {
      set({ error: `Logowanie przez ${dto.provider} nie powiodło się.`, isLoading: false });
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