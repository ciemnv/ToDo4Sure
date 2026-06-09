import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { useAuthStore } from '../src/store/auth-store'; 
import { ActivityIndicator, View } from 'react-native';

export default function RootLayout() {
  const { user, checkSession, isLoading } = useAuthStore();


  //efektem ubocznym będzie sprawdzenie sesji wywołane z auth-store
  useEffect(() => {
    checkSession();
  }, []);

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