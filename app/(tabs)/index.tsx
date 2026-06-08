import { useTaskStore } from '@/src/store/task-store';
import React, { useEffect, useState } from 'react';
import { Alert, FlatList, Text, TextInput, TouchableOpacity, View } from 'react-native';
 

export default function TasksScreen() {
  // Stany lokalne komponentu do obsługi formularza dodawania tasków 
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [project, setProject] = useState('Główne');

  // Pobieramy stany globalne do listy zadań (wg zustanda) przez TaskStore
  const { tasks, fetchTasks, addTask, deleteTask } = useTaskStore();

  // Pobieramy zadania z bazy danych
  useEffect(() => {
    fetchTasks();
  }, []);

  // obsługa dodania zadania
  const handleAddTask = async () => {
    //jeśli tytuł po skróceniu nie istnieje
    if (!title.trim()) {
      Alert.alert('Błąd', 'Tytuł zadania nie może być pusty!');
      return;
    }

    //wywolujemy funkcje ze store
    await addTask(title, description, project);

    // Czyszczenie pól formularza po dodaniu
    setTitle('');
    setDescription('');
  };




  return (
    <View className="flex-1 bg-slate-50 p-4">
      
      {/* formularz dodawania nowego zadania */}
      <View className="bg-white p-4 rounded-xl shadow-sm mb-6 border border-slate-100">
        <Text className="text-lg font-bold text-slate-800 mb-3">Nowe zadanie</Text>
        
        {/* tytuł */}
        <TextInput
          className="bg-slate-50 p-3 rounded-lg mb-3 border border-slate-200 text-base"
          placeholder="Tytuł zadania..."
          placeholderTextColor="#94a3b8"
          value={title}
          onChangeText={setTitle}
        />
        
        {/* opis */}
        <TextInput
          className="bg-slate-50 p-3 rounded-lg mb-4 border border-slate-200 text-base"
          placeholder="Opis zadania (opcjonalnie)..."
          placeholderTextColor="#94a3b8"
          value={description}
          onChangeText={setDescription}
        />

        {/* Przycisk dodawania */}
        <TouchableOpacity 
          className="bg-sky-600 p-3 rounded-lg items-center active:bg-sky-700"
          onPress={handleAddTask}
        >
          <Text className="text-white font-semibold text-base">Dodaj do listy</Text>
        </TouchableOpacity>
      </View>

      {/* wyświetlanie listy zadań */}
      <Text className="text-xl font-bold text-slate-800 mb-3">Twoje zadania</Text>
      

      {/* renderujemy taski za pomocą flatlist, aby zoptymalizowac wydajnosc */}
      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        // renderItem to pojedynczy kafelek taskowy
        renderItem={({ item }) => (
          <View className="bg-white p-4 rounded-xl mb-3 border border-slate-100 shadow-sm flex-row justify-between items-center">
            <View className="flex-1 pr-4">
              <Text className="text-lg font-semibold text-slate-900">{item.title}</Text>
              
              {item.description ? (
                <Text className="text-slate-500 mt-1 text-sm">{item.description}</Text>
              ) : null}
              
              <Text className="text-xs text-sky-600 font-medium mt-2 bg-sky-50 px-2 py-1 rounded self-start">
                {item.project}
              </Text>
            </View>
            
            {/* Przycisk usun */}
            <TouchableOpacity 
              className="bg-rose-50 px-3 py-2 rounded-lg active:bg-rose-100"
              onPress={() => deleteTask(item.id)}
            >
              <Text className="text-rose-600 font-medium">Usuń</Text>
            </TouchableOpacity>
          </View>
        )}
        // co sie wyswietla, jeśli nie ma żadnych tasków
        ListEmptyComponent={
          <View className="items-center mt-10">
            <Text className="text-slate-400 text-base">Brak zadań. Wpisz coś powyżej!</Text>
          </View>
        }
      />
    </View>
  );
}