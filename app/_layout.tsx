import React, { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { useAuthStore } from '../src/store/auth-store'; 
import { ActivityIndicator, View } from 'react-native';
import { initDatabase } from '@/src/database/db';
import { supabase } from '@/src/services/supabase';

export default function RootLayout() {
  const { user, checkSession, isLoading } = useAuthStore();
  const [isDbReady, setIsDbReady] = useState(false); // Stan blokady aplikacji

  // 1. Inicjalizacja bazy danych i sesji lokalnej przy starcie aplikacji
  useEffect(() => {
    const setupApp = async () => {
      try {
        // Gwarantujemy stworzenie tabeli w SQLite
        await initDatabase();
        setIsDbReady(true);
        
        // Sprawdzamy zaszyfrowaną sesję w chmurze / SecureStore
        await checkSession();
      } catch (error) {
        console.error("Błąd krytyczny podczas startu aplikacji:", error);
        setIsDbReady(true); // Odblokowujemy w razie awarii, żeby ErrorBoundary przejął kontrolę
      }
    };

    setupApp();
  }, []);

  // 2. Globalny nasłuchiwacz zmian stanu autentykacji (Obsługa powrotów z Google OAuth)
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session && session.user) {
        // Po pomyślnym zalogowaniu przez Google/Email, aktualizujemy użytkownika ORAZ gasimy kółko ładowania!
        useAuthStore.setState({
          user: {
            id: session.user.id,
            email: session.user.email || '',
            token: session.access_token,
            isGuest: false
          },
          isLoading: false, // Przerywa nieskończone kręcenie się kółka na ekranie logowania
          error: null
        });
      } else if (event === 'SIGNED_OUT') {
        useAuthStore.setState({ user: null, isLoading: false });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Dopóki baza się tworzy LUB sklep sprawdza token, pokazujemy ekran ładowania
  if (!isDbReady || (isLoading && user === null)) {
    return (
      <View className="flex-1 justify-center items-center bg-slate-50">
        <ActivityIndicator size="large" color="#0284c7" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {user ? (
        <Stack.Screen name="(tabs)" />
      ) : (
        <Stack.Screen name="login" />
      )}
    </Stack>
  );
}