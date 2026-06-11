import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, Text, TextInput, View } from 'react-native';
import { useAuthStore } from '../src/store/auth-store';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';


export default function LoginScreen() {

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { user, loginWithEmail, signUpWithEmail, loginWithProvider, loginAsGuest, isLoading, error } = useAuthStore();

  useEffect(() => {
    GoogleSignin.configure({
      // Wklej tutaj SWÓJ "Client ID" dla aplikacji INTERNETOWEJ (Web Application) z Google Cloud Console
      webClientId: '703867197184-u4dn3geti0kpgfp29esougmhnjspbrqa.apps.googleusercontent.com',
    });
  }, []);
  
  useEffect(() => {
    // Jeśli w sklepie Zustand pojawi się zalogowany użytkownik, 
    // natychmiast wyrzucamy go z ekranu logowania do wnętrza aplikacji!
    if (user && !user.isGuest) {
      console.log('Wykryto sesję Google! Przekierowanie do aplikacji...');
      router.replace('/(tabs)');
    }
  }, [user]);


  const handleRegister = async () => {
  if (!email.trim() || !password.trim()) {
    Alert.alert('Błąd', 'Wprowadź e-mail i hasło, aby utworzyć konto.');
    return;
  }
  try {
    await signUpWithEmail({ email: email.trim(), password: password });
  } catch (e) {}
  };

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
    if (providerName !== 'google') return;

    try {
      // Sprawdzamy dostępność usług Google Play Services na telefonie
      await GoogleSignin.hasPlayServices();
      
      // Otwieramy natywne okno wyboru konta z dołu ekranu (Android Credential Manager)
      const response = await GoogleSignin.signIn();
      
      // Sprawdzamy czy logowanie zakończyło się sukcesem i mamy idToken
      if (response && response.data && response.data.idToken) {
        // Przesyłamy pobrany token tożsamości bezpośrednio do naszego sklepu Zustand
        await loginWithProvider({ email: '', provider: 'google' }, response.data.idToken);
      }
    } catch (err: any) {
      if (err.code === statusCodes.IN_PROGRESS) {
        Alert.alert('Informacja', 'Autoryzacja jest już w toku.');
      } else if (err.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        Alert.alert('Błąd', 'Usługi Google Play są niedostępne lub przestarzałe.');
      } else if (err.code === statusCodes.SIGN_IN_CANCELLED) {
        console.log('Użytkownik anulował logowanie.');
      } else {
        Alert.alert('Błąd logowania Google', err.message || 'Nieznany błąd.');
      }
    }
  };

  const handleGuestLogin = async () => {
    try {
      await loginAsGuest(); 
      router.replace('/(tabs)');
    } catch (e) {
      Alert.alert('Błąd', 'Nie udało się uruchomić trybu gościa.');
    }
  };

    return (
    <View className="flex-1 bg-slate-50 justify-center p-6">
      <View className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <Text className="text-3xl font-black text-slate-800 text-center mb-6">To-Do-4-Sure</Text>


        {/* WYŚWIETLANIE INFO O BŁĘDZIE/SUKCESIE NA CZERWONO LUB ZIELONO */}
        {error ? (() => {
          // Konwertujemy komunikaty bledu do malych liter
          const checkText = error.toLowerCase();
          const isSuccess = checkText.includes('pomyślna') || checkText.includes('utworzone');

          return (
            <View className={`p-3 rounded-xl mb-4 border ${isSuccess ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'}`}>
              <Text className={`text-xs font-bold text-center ${isSuccess ? 'text-emerald-700' : 'text-rose-600'}`}>
                {error}
              </Text>
            </View>
          );
        })() : null}

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
          className="bg-sky-600 p-3.5 rounded-xl items-center active:bg-sky-700"
          onPress={handleEmailLogin}
          disabled={isLoading}
        >
          {isLoading ? <ActivityIndicator color="#fff" /> : <Text className="text-white font-bold text-base">Zaloguj się kontem e-mail</Text>}
        </Pressable>

        {/* ZAREJESTRUJ SIĘ */}
        <Pressable 
          className="bg-slate-100 p-3 rounded-xl items-center active:bg-slate-200 border border-slate-300 mt-2"
          onPress={handleRegister}
          disabled={isLoading}
        >
          <Text className="text-slate-700 font-bold text-sm">Zarejestruj nowe konto</Text>
        </Pressable>


        <Text className="text-[10px] text-slate-400 font-bold uppercase text-center px-3 my-10">Lub zaloguj przez</Text>

        {/* DRUGA METODA LOGOWANIA: INTEGRACJA z GOOGLE */}
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
            <Text className="text-slate-600 font-bold text-sm">Kontynuuj jako gość</Text>
        </Pressable>
      </View>
    );
}