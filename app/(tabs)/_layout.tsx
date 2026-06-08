import Ionicons from '@expo/vector-icons/Ionicons';
import * as Notifications from 'expo-notifications';
import { Tabs } from 'expo-router';
import React, { useEffect } from 'react';
import { Platform, Pressable, Text, View } from 'react-native';
import '../../global.css';

export default function TabLayout() {
  useEffect(() => {
    const requestNotificationPerm = async () => {
      try {
        const { status } = await Notifications.getPermissionsAsync();
        if (status !== 'granted') {
          await Notifications.requestPermissionsAsync();
        }
      } catch (e) {
        console.error(e);
      }
    };
    
    requestNotificationPerm(); 
  }, []); 

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        tabBarActiveTintColor: '#0284c7', 
        tabBarInactiveTintColor: '#64748b', 
        tabBarStyle: Platform.select({
          ios: { position: 'absolute' },
          default: {},
        }),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          headerTitle: 'Zadania', 
          tabBarLabel: 'Zadania',
          tabBarIcon: ({ focused }) => (
            <Ionicons name="list-outline" size={28} color={focused ? "#0284c7" : '#64748b'} />
          ), // <--- POPRAWKA 4: Usunięty komentarz ze środka JSX, który psuł parsowanie stringów
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          headerTitle: 'Kalendarz',
          tabBarLabel: 'Kalendarz',
          tabBarIcon: ({ focused }) => (
            <Ionicons name="calendar-number-outline" size={28} color={focused ? "#0284c7" : '#64748b'} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          headerTitle: 'Ustawienia',
          tabBarLabel: 'Ustawienia',
          tabBarIcon: ({ focused }) => (
            <Ionicons name="settings-outline" size={28} color={focused ? "#0284c7" : '#64748b'} />
          ),
        }}
      />
    </Tabs>
  );
}

export function ErrorBoundary({ error, retry }: { error: Error; retry: () => Promise<void> }) {
  return (
    <View className="flex-1 justify-center items-center bg-slate-50 p-6">
      <Text className="text-4xl mb-2">⚠️</Text>
      <Text className="text-xl font-bold text-slate-800 text-center mb-2">
        Wystąpił nieoczekiwany błąd aplikacji
      </Text>
      <Text className="text-sm text-slate-500 text-center mb-6">
        {error.message || 'Interfejs graficzny uległ awarii z powodu nieoczekiwanego błędu renderowania.'}
      </Text>
      <Pressable 
        className="bg-sky-600 active:bg-sky-700 py-3 px-6 rounded-xl border border-sky-700 shadow-sm"
        onPress={retry}
      >
        <Text className="text-white font-bold text-sm">Odśwież interfejs</Text>
      </Pressable>
    </View>
  );
}