import React, { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { useAuthStore } from '../src/store/auth-store'; 
import { ActivityIndicator, Alert, View } from 'react-native';
import { initDatabase } from '@/src/database/db';
import { supabase } from '@/src/services/supabase';
// import * as Notifications from 'expo-notifications';

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

  // // 2. Globalny nasłuchiwacz zmian stanu autentykacji (Obsługa powrotów z Google OAuth)
  // useEffect(() => {
  //   const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
  //     if (session && session.user) {
  //       // Po pomyślnym zalogowaniu przez Google/Email, aktualizujemy użytkownika ORAZ gasimy kółko ładowania!
  //       useAuthStore.setState({
  //         user: {
  //           id: session.user.id,
  //           email: session.user.email || '',
  //           token: session.access_token,
  //           isGuest: false
  //         },
  //         isLoading: false, // Przerywa nieskończone kręcenie się kółka na ekranie logowania
  //         error: null
  //       });
  //     } else if (event === 'SIGNED_OUT') {
  //       useAuthStore.setState({ user: null, isLoading: false });
  //     }
  //   });

  //   return () => {
  //     subscription.unsubscribe();
  //   };
  // }, []);

  // useEffect(() => {
  //   const requestNotificationPerm = async () => {
  //     try {
  //       // 1. Bezpiecznie sprawdzamy aktualny status uprawnień
  //       const { status } = await Notifications.getPermissionsAsync();
        
  //       if (status !== 'granted') {
  //         // 2. Jeśli nie ma uprawnień, prosimy o nie system operacyjny
  //         const { status: finalStatus } = await Notifications.requestPermissionsAsync();
          
  //         if (finalStatus !== 'granted') {
  //           console.log('Użytkownik odrzucił uprawnienia do notyfikacji.');
  //         }
  //       }
  //     } catch (e) {
  //       // 3. Ponieważ ExpoGo nie chce pokazywac powiadomien na androidzie, demonstracyjnie robimy zabezpieczenie 
  //       // Zamiast wywalać aplikację na czerwonym ekranie błędu, logujemy ostrzeżenie w konsoli
  //       console.warn("Powiadomienia systemowe są niedostępne w tym środowisku testowym.", e);
  //       Alert.alert('Informacja', 'Środowisko Expo Go na tym urządzeniu nie obsługuje powiadomień systemowych.');
  //     }
  //   };
    
  //   requestNotificationPerm(); 
  // }, []);


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