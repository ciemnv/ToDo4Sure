import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, Text } from 'react-native';
import '../../global.css';

export default function TabLayout() {
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
          headerTitle: () => <Text className="text-xl font-bold text-slate-800">Zadania</Text>,
          tabBarLabel: ({ color }) => (
            <Text style={{ color }} className="text-s font-medium">Zadania</Text>
          ),
          tabBarIcon: ({ focused }) => (
            // Ikona do listy zadań z pakietu Ionicons https://ionic.io/ionicons
            <Ionicons name="list-outline" size={28} color={focused ? "#0284c7" : '#64748b'} />
          ),
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          headerTitle: () => <Text className="text-xl font-bold text-slate-800">Kalendarz</Text>,
          tabBarLabel: ({ color }) => (
            <Text style={{ color }} className="text-s font-medium">Kalendarz</Text>
          ),
          tabBarIcon: ({ focused }) => (
            <Ionicons name="calendar-number-outline" size={28} color={focused ? "#0284c7" : '#64748b'} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          headerTitle: () => <Text className="text-xl font-bold text-slate-800">Ustawienia</Text>,
          tabBarLabel: ({ color }) => (
            <Text style={{ color }} className="text-s font-medium">Ustawienia</Text>
          ),
          tabBarIcon: ({ focused }) => (
            <Ionicons name="settings-outline" size={28} color={focused ? "#0284c7" : '#64748b'} />
          ),
        }}
      />
    </Tabs>
  );
}