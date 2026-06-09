import { router } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, Text, TextInput, View } from 'react-native';
import { useAuthStore } from '../src/store/auth-store';

export default function LoginScreen() {

  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { loginWithEmail, loginWithProvider, loginAsGuest, isLoading, error } = useAuthStore();

  const handleEmailLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Błąd', 'Wprowadź adres e-mail oraz hasło.');
      return;
    }
      try {
        // przesyłamy obiekt UserDto
        await loginWithEmail({ email: email.trim(), password: password });
        router.replace('/(tabs)');
      } catch (e) {}
  };

  const handleProviderLogin = async (providerName: 'google' | 'apple') => {
    try {
      // przesyłamy obiekt UserDto dla logowania przez sociale
      await loginWithProvider({ email: '', provider: providerName });
      router.replace('/(tabs)');
    } catch (e) {}
  };

  const handleGuestLogin = () => {
    loginAsGuest();
    router.replace('/(tabs)');
  };

    return (
    <View className="flex-1 bg-slate-50 justify-center p-6">
      <View className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <Text className="text-3xl font-black text-slate-800 text-center mb-1">To-Do-4-Sure</Text>
        <Text className="text-xs font-semibold text-slate-400 uppercase tracking-widest text-center mb-6">Uwierzytelnianie bazy sesji</Text>

        {error ? (
          <Text className="text-rose-600 text-xs font-bold text-center mb-4 bg-rose-50 p-2 rounded-lg border border-rose-100">{error}</Text>
        ) : null}

        <Text className="text-xs font-bold text-slate-500 uppercase mb-2">Adres E-mail:</Text>
        <TextInput
          className="bg-slate-50 p-3 rounded-xl mb-4 border border-slate-200 text-base text-slate-800"
          placeholder="przyklad@domain.com"
          placeholderTextColor="#94a3b8"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <Text className="text-xs font-bold text-slate-500 uppercase mb-2">Hasło zabezpieczające:</Text>
        <TextInput
          className="bg-slate-50 p-3 rounded-xl mb-6 border border-slate-200 text-base text-slate-800"
          placeholder="Minimum 6 znaków..."
          placeholderTextColor="#94a3b8"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <Pressable 
          className="bg-sky-600 p-3.5 rounded-xl items-center active:bg-sky-700 mb-4"
          onPress={handleEmailLogin}
          disabled={isLoading}
        >
          {isLoading ? <ActivityIndicator color="#fff" /> : <Text className="text-white font-bold text-base">Zaloguj się kontem e-mail</Text>}
        </Pressable>

        {/* LINIA ROZDZIELAJĄCA METODY LOGOWANIA */}
        <View className="flex-row items-center my-2 mb-4">
          <View className="flex-1 h-[1px] bg-slate-200" />
          <Text className="text-[10px] text-slate-400 font-bold uppercase px-3">Lub zaloguj przez</Text>
          <View className="flex-1 h-[1px] bg-slate-200" />
        </View>

        {/* DRUGA METODA LOGOWANIA: INTEGRACJA OAUTH */}
        <Pressable 
          className="bg-slate-900 p-3.5 rounded-xl items-center active:bg-black"
          onPress={() => handleProviderLogin('google')}
          disabled={isLoading}
        >
          <Text className="text-white font-bold text-sm">Kontynuuj przez konto Google</Text>
        </Pressable>
      </View>

        <Pressable 
            className="bg-slate-100 p-3.5 rounded-xl items-center active:bg-slate-200 border border-slate-200 mt-4"
            onPress={handleGuestLogin}
            disabled={isLoading}
          >
            <Text className="text-slate-600 font-bold text-sm">Kontynuuj jako gość (Zapis lokalny)</Text>
        </Pressable>
      </View>
    );
}