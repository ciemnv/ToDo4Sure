import React, { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { useAuthStore } from '../src/store/auth-store'; 
import { ActivityIndicator, View } from 'react-native';
import { initDatabase } from '@/src/database/db';

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
      } catch (error) {
        console.error("Błąd krytyczny podczas startu aplikacji:", error);
        setIsDbReady(true); // Odblokowujemy w razie awarii, żeby ErrorBoundary przejął kontrolę
      }
    };

    setupApp();
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