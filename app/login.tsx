import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Pressable, Text, TextInput, View } from 'react-native';
import { useAuthStore } from '../src/store/auth-store';

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading } = useAuthStore();

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert('Błąd', 'Wprowadź login i hasło.');
      return;
    }
    try {
      await login(username.trim());
      router.replace('/(tabs)'); // przekierowanie do calej aplikacji po sukcesie
    } catch (e) {
      Alert.alert('Błąd', 'Logowanie nie powiodło się.');
    }
  };

  return (
    <View className="flex-1 bg-slate-50 justify-center p-6">
      <View className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <Text className="text-3xl font-black text-slate-800 text-center mb-2">To-Do-4-Sure</Text>
        <Text className="text-xs font-semibold text-slate-400 uppercase tracking-widest text-center mb-8">Zaloguj się do bazy zadań</Text>

        <Text className="text-xs font-bold text-slate-500 uppercase mb-2">Nazwa użytkownika:</Text>
        <TextInput
          className="bg-slate-50 p-3 rounded-xl mb-4 border border-slate-200 text-base"
          placeholder="Wpisz swój login..."
          placeholderTextColor="#94a3b8"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
        />

        <Text className="text-xs font-bold text-slate-500 uppercase mb-2">Hasło:</Text>
        <TextInput
          className="bg-slate-50 p-3 rounded-xl mb-6 border border-slate-200 text-base"
          placeholder="Wpisz hasło..."
          placeholderTextColor="#94a3b8"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <Pressable 
          className={`bg-sky-600 p-3.5 rounded-xl items-center active:bg-sky-700 ${isLoading ? 'opacity-50' : ''}`}
          onPress={handleLogin}
          disabled={isLoading}
        >
          <Text className="text-white font-bold text-base">Zaloguj się</Text>
        </Pressable>
      </View>
    </View>
  );
}