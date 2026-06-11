import * as Linking from 'expo-linking';
import * as SecureStore from 'expo-secure-store';
import * as WebBrowser from 'expo-web-browser';
import { create } from 'zustand';
import { supabase } from '../services/supabase';
import { GUEST_USER, User, UserDto } from '../types/user';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

WebBrowser.maybeCompleteAuthSession();

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  token: string | null;
  checkSession: () => Promise<void>;
  loginWithEmail: (dto: UserDto) => Promise<void>;
  signUpWithEmail: (dto: UserDto) => Promise<void>;
  loginWithProvider: (dto: UserDto, idToken?: string) => Promise<void>; //logowanie z Google
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
      //błędy które pojawiły się po drodze przy testowaniu - obsługuję je za pomocą customowych wiadomosci 
      
      // Zamieniamy nasze errory z supabase na małe litery, żeby ignorować wielkość liter i literówki
      const rawError = error.message.toLowerCase();
      let customErrorMessage = error.message;
      
      // Łapiemy błąd niepoprawnych danych
      if (rawError.includes('invalid') && rawError.includes('login')) {
        customErrorMessage = 'Podane konto nie istnieje lub wprowadziłeś niepoprawne hasło.';
      } else if (rawError.includes('rate limit') || rawError.includes('too many requests')) {
        customErrorMessage = 'Zbyt wiele prób logowania/rejestracji w krótkim czasie. Spróbuj ponownie za chwilę.';
      }

      set({ error: customErrorMessage, isLoading: false });
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
      const rawError = error.message.toLowerCase();
      let customErrorMessage = error.message;
      
      if (rawError.includes('rate limit') || rawError.includes('too many requests')) {
        customErrorMessage = 'Zbyt wiele żądań do bazy danych. Spróbuj ponownie za chwilę.';
      } else if (rawError.includes('already registered') || rawError.includes('exists')) {
        customErrorMessage = 'Użytkownik o takim adresie e-mail jest już zarejestrowany.';
      }

      set({ error: customErrorMessage, isLoading: false });
      throw error;
    }

    if (data.user) {
      set({ error: 'Rejestracja pomyślna! Zaloguj się, używając swojego loginu i hasla', isLoading: false });
    }
  },


  loginWithProvider: async (dto: UserDto, idToken?: string) => {
    if (!dto.provider) return;
    set({ isLoading: true, error: null });
    
    try {
      if (dto.provider === 'google' && idToken) {
        // 1. Wywołujemy oficjalną metodę 1:1 z dokumentacji Supabase dla tokenów tożsamości
        const { data, error } = await supabase.auth.signInWithIdToken({
          provider: 'google',
          token: idToken,
        });

        if (error) throw error;

        if (data.session && data.user) {
          await SecureStore.deleteItemAsync('guest_mode');
          set({
            user: { 
              id: data.user.id, 
              email: data.user.email || '', 
              token: data.session.access_token, 
              isGuest: false 
            },
            isLoading: false
          });
        }
      } else {
        set({ error: 'Brak tokenu autoryzacji Google.', isLoading: false });
      }
    } catch (e: any) {
      set({ error: `Błąd logowania Google: ${e.message}`, isLoading: false });
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