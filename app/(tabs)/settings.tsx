import { useTaskStore } from '@/src/store/task-store';
import React, { useEffect, useState } from 'react';
import { Alert, Pressable, Text, TextInput, View } from 'react-native';
import { useAuthStore } from '@/src/store/auth-store';
import { router } from 'expo-router';
import { useProjectStore } from '@/src/store/project-store';

export default function SettingsScreen() {
  const { tasks, fetchTasks, clearAllTasks } = useTaskStore();
  const { user, logout } = useAuthStore();

  const { projects, updateProjectName } = useProjectStore();
  const [newProjectName, setNewProjectName] = useState('');

  // Lokalne stany do obsługi pól tekstowych dla 3 slotów
  const [proj0, setProj0] = useState(projects[0]);
  const [proj1, setProj1] = useState(projects[1]);
  const [proj2, setProj2] = useState(projects[2]);

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.isCompleted === 1).length;
  const activeTasks = totalTasks - completedTasks;

  useEffect(() => {
    fetchTasks();
  }, []);

  // Kiedy projekty w sklepie się zmienią, aktualizujemy lokalne inputy
  useEffect(() => {
    setProj0(projects[0]);
    setProj1(projects[1]);
    setProj2(projects[2]);
  }, [projects]);

  const handleUpdateProject = async (index: number, currentProjectName: string) => {
    if (!currentProjectName.trim()) {
      Alert.alert('Błąd', 'Nazwa kategorii nie może być pusta!');
      return;
    }

    try {
      // NAPRAWIONE: Wywołanie asynchroniczne z await, które modyfikuje całą bazę danych
      await updateProjectName(index, currentProjectName.trim());
      Alert.alert('Sukces', `Kategoria została globalnie zmieniona na: "${currentProjectName.trim()}"`);
    } catch (e) {
      Alert.alert('Błąd', 'Nie udało się zaktualizować powiązanych zadań w bazie danych.');
    }
  };

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



  // Parsowanie nazwy użytkownika z obiektu User
  const displayUsername = user?.email ? user.email.split('@')[0] : 'Użytkownik';

  return (
    <View className="flex-1 bg-slate-50 p-6">
      

    {/* profil uzystkownika */}
      <View className="bg-sky-600 p-4 rounded-xl mb-6 shadow-sm border border-sky-700">
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="text-white text-xs font-bold uppercase tracking-widest opacity-80">Twoje konto:</Text>
            <Text className="text-white text-2xl font-black mt-1">Witaj, {displayUsername}</Text>
          </View>
        <Pressable 
          onPress={handleLogout}
          className="bg-slate-100 p-2.5 rounded-lg items-center active:bg-slate-200 border border-slate-300"
          >
          <Text className="text-slate-700 font-bold text-sm">Wyloguj się</Text>
        </Pressable>
        </View>
        <Text className="text-white text-xs font-bold uppercase tracking-widest opacity-80 mt-6 mb-3">Podsumowanie danych:</Text>
      <View className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex-row justify-around">
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


      </View>


      
      <Text className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Opcje deweloperskie</Text>


      <View className="bg-white p-4 mb-6 rounded-xl border border-slate-200 shadow-sm">
        <Text className="text-sm font-bold text-slate-800 mb-1">Czyszczenie aplikacji</Text>
        <Text className="text-slate-500 text-xs mb-3">
          Usuwa bezpowrotnie wszystkie wpisy z listy zadań z bazy danych. 
        </Text>
        
        <Pressable 
          onPress={handleResetDatabase}
          className="bg-rose-600 p-2.5 rounded-lg items-center active:bg-rose-700"
        >
          <Text className="text-white font-bold text-sm">Wyczyść bazę danych</Text>
        </Pressable>
      </View>

      {/* PERSONALIZACJA 3 KATEGORII */}
      <Text className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Personalizacja Kategorii (Maks 3)</Text>
      <View className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-6 gap-3">
        <Text className="text-sm font-bold text-slate-800 mb-1">Możesz nazwać te 3 sloty po swojemu:</Text>
        
        {/* SLOT 1 */}
        <View className="flex-row gap-2 items-center">
          <TextInput
            className="flex-1 bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-sm text-slate-800 font-medium"
            value={proj0}
            onChangeText={setProj0}
          />
          <Pressable 
            onPress={() => handleUpdateProject(0, proj0)}
            className="bg-sky-600 px-4 py-2.5 rounded-lg active:bg-sky-700 justify-center"
          >
            <Text className="text-white font-bold text-xs">Zapisz</Text>
          </Pressable>
        </View>

        {/* SLOT 2 */}
        <View className="flex-row gap-2 items-center">
          <TextInput
            className="flex-1 bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-sm text-slate-800 font-medium"
            value={proj1}
            onChangeText={setProj1}
          />
          <Pressable 
            onPress={() => handleUpdateProject(1, proj1)}
            className="bg-sky-600 px-4 py-2.5 rounded-lg active:bg-sky-700 justify-center"
          >
            <Text className="text-white font-bold text-xs">Zapisz</Text>
          </Pressable>
        </View>

        {/* SLOT 3 */}
        <View className="flex-row gap-2 items-center">
          <TextInput
            className="flex-1 bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-sm text-slate-800 font-medium"
            value={proj2}
            onChangeText={setProj2}
          />
          <Pressable 
            onPress={() => handleUpdateProject(2, proj2)}
            className="bg-sky-600 px-4 py-2.5 rounded-lg active:bg-sky-700 justify-center"
          >
            <Text className="text-white font-bold text-xs">Zapisz</Text>
          </Pressable>
        </View>
      </View>

      <View className="flex-1 justify-end items-center mb-2">
        <Text className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">To-Do-4-Sure App v1.0</Text>
      </View>



    </View>
  );
}