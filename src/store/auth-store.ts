import * as SecureStore from 'expo-secure-store';
import { create } from 'zustand';
import { supabase } from '../services/supabase';
import { GUEST_USER, User, UserDto } from '../types/user';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  token: string | null;
  checkSession: () => Promise<void>;
  loginWithEmail: (dto: UserDto) => Promise<void>;
  signUpWithEmail: (dto: UserDto) => Promise<void>;
  loginWithProvider: (dto: UserDto) => Promise<void>; //logowanie z Google
  loginAsGuest: () => void;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isLoading: false,
  error: null,

  checkSession: async () => {
    set({ isLoading: true });
    
    const isGuestMode = await SecureStore.getItemAsync('guest_mode');
    if (isGuestMode === 'true') {
      set({ user: GUEST_USER, isLoading: false });
      return;
    }

    // Odczytujemy natywną, bezpieczną sesję z Supabase (token JWT w SecureStore)
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session && session.user) {
      set({ 
        user: { 
          id: session.user.id, 
          email: session.user.email || '', 
          token: session.access_token, 
          isGuest: false 
        }, 
        isLoading: false 
      });
    } else {
      set({ user: null, isLoading: false });
    }
  },

  loginWithEmail: async (dto: UserDto) => {
    if (!dto.password) return;
    set({ isLoading: true, error: null });

    const { data, error } = await supabase.auth.signInWithPassword({
      email: dto.email,
      password: dto.password,
    });

    if (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }

    if (data.session && data.user) {
      await SecureStore.deleteItemAsync('guest_mode');
      set({
        user: { id: data.user.id, email: data.user.email || '', token: data.session.access_token, isGuest: false },
        isLoading: false
      });
    }
  },

  signUpWithEmail: async (dto: UserDto) => {
    if (!dto.password) return;
    set({ isLoading: true, error: null });

    const { data, error } = await supabase.auth.signUp({
      email: dto.email,
      password: dto.password,
    });

    if (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }

    if (data.user) {
      set({ error: 'Rejestracja pomyślna! Sprawdź skrzynkę e-mail, aby potwierdzić konto.', isLoading: false });
    }
  },

  loginWithProvider: async (dto: UserDto) => {
    if (!dto.provider) return;
    set({ isLoading: true, error: null });

    // Protokół uwierzytelniania zewnętrznego OAuth (Google) za pomocą Supabase API
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: dto.provider,
      options: {
        redirectTo: 'todo4sure://', // Protokół Deep Linking Twojej aplikacji
      }
    });

    if (error) {
      set({ error: error.message, isLoading: false });
    }
  },

  loginAsGuest: async () => {
    await SecureStore.setItemAsync('guest_mode', 'true');
    set({ user: GUEST_USER, error: null });
  },

  logout: async () => {
    await supabase.auth.signOut();
    await SecureStore.deleteItemAsync('guest_mode');
    set({ user: null, error: null });
  },
}));