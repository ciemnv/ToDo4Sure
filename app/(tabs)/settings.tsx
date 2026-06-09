import { useTaskStore } from '@/src/store/task-store';
import React, { useEffect } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import { useAuthStore } from '@/src/store/auth-store';
import { router } from 'expo-router';

export default function SettingsScreen() {
  const { tasks, fetchTasks, clearAllTasks } = useTaskStore();
  const { logout } = useAuthStore();
  
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.isCompleted === 1).length;
  const activeTasks = totalTasks - completedTasks;

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleResetDatabase = () => {
    if (tasks.length === 0) {
      Alert.alert('Informacja', 'Baza danych jest już pusta.');
      return;
    }

    Alert.alert(
      'Resetowanie bazy',
      'Czy chcesz usunąć wszystkie zadania z bazy SQLite? Tego kroku nie da się cofnąć.',
      [
        { text: 'Anuluj', style: 'cancel' },
        { 
          text: 'Usuń wszystko', 
          style: 'destructive',
          onPress: async () => {
            try {
              // Czyścimy bazę usuwając elementy ze store
              await clearAllTasks();
              Alert.alert('Sukces', 'Baza danych została wyczyszczona.');
            } catch (error) {
              Alert.alert('Błąd', 'Nie udało się zresetować bazy.');
            }
          }
        }
      ]
    );
  };

  const handleLogout = async () => {
    try {
      await logout(); // 1. Czyścimy Zustand i SecureStore
      router.replace('/login'); // 2. Przekierowanie do logowania
    } catch (error) {
      Alert.alert('Błąd', 'Nie udało się poprawnie wylogować.');
    }
  };

  return (
    <View className="flex-1 bg-slate-50 p-6">
      
      <Text className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Podsumowanie danych</Text>
      <View className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-6 flex-row justify-around">
        <View className="items-center">
          <Text className="text-xl font-black text-slate-800">{totalTasks}</Text>
          <Text className="text-[10px] text-slate-500 font-medium">Zadań</Text>
        </View>
        <View className="items-center">
          <Text className="text-xl font-black text-emerald-600">{completedTasks}</Text>
          <Text className="text-[10px] text-slate-500 font-medium">Wykonanych</Text>
        </View>
        <View className="items-center">
          <Text className="text-xl font-black text-amber-500">{activeTasks}</Text>
          <Text className="text-[10px] text-slate-500 font-medium">W toku</Text>
        </View>
      </View>

      
      <Text className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Opcje deweloperskie</Text>


      <View className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <Text className="text-sm font-bold text-slate-800 mb-1">Czyszczenie aplikacji</Text>
        <Text className="text-slate-500 text-xs mb-3">
          Usuwa bezpowrotnie wszystkie wpisy z lokalnej bazy danych SQLite w celu przeprowadzenia czystych testów.
        </Text>
        
        <Pressable 
          onPress={handleResetDatabase}
          className="bg-rose-600 p-2.5 rounded-lg items-center active:bg-rose-700"
        >
          <Text className="text-white font-bold text-sm">Wyczyść bazę danych</Text>
        </Pressable>
      </View>


      <Text className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Sesja użytkownika</Text>
      <View className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <Text className="text-sm font-bold text-slate-800 mb-1">Bezpieczne wylogowanie</Text>
        <Text className="text-slate-500 text-xs mb-3">
          Usuwa zaszyfrowany token sesji z pamięci SecureStore i blokuje dostęp do zadań.
        </Text>
        <Pressable 
          onPress={handleLogout}
          className="bg-slate-100 p-2.5 rounded-lg items-center active:bg-slate-200 border border-slate-300"
        >
          <Text className="text-slate-700 font-bold text-sm">Wyloguj się</Text>
        </Pressable>
      </View>


      <View className="flex-1 justify-end items-center mb-2">
        <Text className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">To-Do-4-Sure App v1.0</Text>
      </View>



    </View>
  );
}