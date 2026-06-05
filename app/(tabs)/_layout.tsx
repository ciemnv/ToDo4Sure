import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import '../../global.css';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        tabBarActiveTintColor: '#0284c7', // Kolor dla aktywnych zakładek
        tabBarInactiveTintColor: '#64748b', // Kolor dla nieaktywnych zakładek
        tabBarStyle: Platform.select({
          ios: { position: 'absolute' },
          default: {},
        }),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Zadania',
          tabBarIcon: ({ focused }) => (
            // Ikona do listy zadań z pakietu Ionicons https://ionic.io/ionicons
            <Ionicons name="list-outline" size={28} color={focused ? "#0284c7" : '#64748b'} />
          ),
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: 'Kalendarz',
          tabBarIcon: ({ focused }) => (
            // Ikona do kalendarza zadań z pakietu Ionicons
            <Ionicons name="calendar-number-outline" size={28} color={focused ? "#0284c7" : '#64748b'} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Ustawienia',
          tabBarIcon: ({ focused }) => (
            // Ikona do ustawień
            <Ionicons name="settings-outline" size={28} color={focused ? "#0284c7" : '#64748b'} />
          ),
        }}
      />
    </Tabs>
  );
}