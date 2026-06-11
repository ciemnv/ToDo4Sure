import React, { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { useAuthStore } from '../src/store/auth-store'; 
import { ActivityIndicator, View } from 'react-native';
import { initDatabase } from '@/src/database/db';
import { supabase } from '@/src/services/supabase';
import * as Linking from 'expo-linking';
import { useProjectStore } from '@/src/store/project-store';

export default function RootLayout() {
  const { user, checkSession, isLoading } = useAuthStore();
  const [isDbReady, setIsDbReady] = useState(false); // Stan blokady aplikacji


  //efektem ubocznym będzie sprawdzenie sesji wywołane z auth-store
  useEffect(() => {
    const setupApp = async () => {
      try {
        // 1. NAJPIERW GWARANTUJEMY STWORZENIE TABELI W SQLITE
        await initDatabase();
        setIsDbReady(true);
        // 2. DOPIERO POTEM SPRAWDZAMY ZASZYFROWANĄ SESJĘ W SECURESTORE
        await checkSession();

        // NOWOŚĆ: Przechwytywanie powrotu z logowania Google (OAuth)
        const subscription = Linking.addEventListener('url', (event) => {
        const parsed = Linking.parse(event.url);
        if (parsed.queryParams) {
          // Supabase automatycznie ustawi sesję, jeśli w URL będą parametry auth
          supabase.auth.getSession().then(() => checkSession());
        }
      });

      } catch (error) {
        console.error("Błąd krytyczny podczas startu aplikacji:", error);
        setIsDbReady(true); // Odblokowujemy w razie awarii, żeby ErrorBoundary przejął kontrolę
      }
    };

    setupApp();
  }, []);

  useEffect(() => {
  // Nasłuchiwanie na globalną zmianę stanu autentykacji w Supabase (e-mail, Google, Apple)
  const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
    if (session && session.user) {
      // Jeśli pojawiła się sesja z Google, natychmiast zapisujemy użytkownika w Zustandzie
      useAuthStore.setState({
        user: {
          id: session.user.id,
          email: session.user.email || '',
          token: session.access_token,
          isGuest: false
        }
      });
    } else {
      // Brak sesji -> czyszczenie stanu (np. po wylogowaniu)
      useAuthStore.setState({ user: null });
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

  if (isLoading && user === null) {
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