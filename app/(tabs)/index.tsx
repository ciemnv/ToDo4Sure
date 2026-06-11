import { EditTaskModal } from '@/components/editTaskModal';
import { useProjectStore } from '@/src/store/project-store';
import { useTaskStore } from '@/src/store/task-store';
import { Task } from '@/src/types/task';
import Ionicons from '@expo/vector-icons/Ionicons';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Pressable, ScrollView, Text, TextInput, View } from 'react-native';

// const AVAILABLE_PROJECTS = ['Główne', 'Studia', 'Dom'];

export default function TasksScreen() {
  const { projects } = useProjectStore();
  // const [selectedProject, setSelectedProject] = useState('Wszystkie');

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [project, setProject] = useState(projects[0] || 'Główne');
  const [selectedFilter, setSelectedFilter] = useState('Wszystkie');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isCameraLoading, setIsCameraLoading] = useState<string | null >(null); //przechowujemy id zadania ktore klikamy jako ukonczone


  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [selectedTaskForEdit, setSelectedTaskForEdit] = useState<Task | null>(null);

  const { tasks, fetchTasks, addTask, deleteTask, completeTask, isLoading, error } = useTaskStore();

  useEffect(() => {
    fetchTasks();
  }, []);
  
  useEffect(() => {
  // Sprawdzamy, czy aktualnie wybrany filtr to nie jest przypadek "Wszystkie"
  if (selectedFilter !== 'Wszystkie') {
    // Jeśli wybrana nazwa projektu NIE znajduje się już w tablicy 3 aktualnych projektów,
    // oznacza to, że użytkownik właśnie ją zmienił w Ustawieniach.
    const projectExists = projects.includes(selectedFilter);
    
    if (!projectExists) {
      // Automatycznie resetujemy filtr na 'Wszystkie' lub na pierwszy dostępny projekt, 
      // dzięki czemu lista zadań nie zrobi się pusta!
      setSelectedFilter('Wszystkie');
    }
  }
}, [projects]);

  const handleAddTask = async () => {
    if (!title.trim()) {
      Alert.alert('Błąd', 'Tytuł zadania nie może być pusty!');
      return;
    }
    const formattedDate = date.toISOString().split('T')[0];
    try {
      // przekazujemy obiekt Payload
      await addTask({
        title: title.trim(),
        description: description.trim(),
        project: project,
        dueDate: formattedDate
      });
      setTitle('');
      setDescription('');
      setDate(new Date());
    } catch (err) {
      Alert.alert('Błąd bazy danych', 'Nie udało się zapisać zadania.');
      console.error(err);
    }
  };

  const handleCompleteTaskWithCamera = async (id: string) => {
    setIsCameraLoading(id);
    
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (permission.granted === false) {
      Alert.alert('Błąd', 'Musisz zezwolić aplikacji na dostęp do aparatu');
      setIsCameraLoading(null);
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      quality: 0.7,
    });

    if (!result.canceled && result.assets && result.assets[0]?.uri) {
      const permanentUri = result.assets[0].uri;
      try {
        await completeTask(id, permanentUri);
      } catch (err) {
        Alert.alert('Błąd', 'Nie udało się zaktualizować statusu zadania');
      }
    }
    setIsCameraLoading(null);
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const filteredTasks = tasks.filter((task) => {
    if (selectedFilter === 'Wszystkie') return true;
    return task.project === selectedFilter;
  });

  const openEditModal = (task: Task) => {
    setSelectedTaskForEdit(task);
    setIsEditModalVisible(true);
  };

  return (
    <View className="flex-1 bg-slate-50 p-4">
      <View className="bg-white p-4 rounded-xl shadow-sm mb-6 border border-slate-100">
        <Text className="text-lg font-bold text-slate-800 mb-3">Nowe zadanie</Text>
        <TextInput
          className="bg-slate-50 p-3 rounded-lg mb-3 border border-slate-200 text-base"
          placeholder="Tytuł zadania..."
          placeholderTextColor="#94a3b8"
          value={title}
          onChangeText={setTitle}
        />
        <TextInput
          className="bg-slate-50 p-3 rounded-lg mb-4 border border-slate-200 text-base"
          placeholder="Opis zadania (opcjonalnie)..."
          placeholderTextColor="#94a3b8"
          value={description}
          onChangeText={setDescription}
        />
        <Text className="text-sm font-semibold text-slate-600 mb-2">Projekt / Kategoria:</Text>
        <View className="flex-row gap-2 mb-3">
          {projects.map((p) => {
            const isSelected = project === p;
            return (
              <Pressable
                key={p}
                onPress={() => setProject(p)}
                className={isSelected ? "flex-1 p-2 rounded-lg items-center border bg-sky-50 border-sky-600" : "flex-1 p-2 rounded-lg items-center border bg-slate-50 border-slate-300"}
              >
                <Text className={isSelected ? "font-medium text-sm text-sky-600" : "font-medium text-sm text-slate-600"}>{p}</Text>
              </Pressable>
            );
          })}
        </View>
        <Pressable
          className="bg-slate-100 p-3 rounded-lg mb-4 border border-slate-300 flex-row justify-between items-center active:opacity-70"
          onPress={() => setShowDatePicker(true)}
        >
          <Text className="text-slate-700 text-base">Termin wykonania:</Text>
          <Text className="text-sky-600 font-semibold text-base">{date.toISOString().split('T')[0]}</Text>
        </Pressable>
        {showDatePicker ? (
          <DateTimePicker
            value={date}
            mode="date"
            display="default"
            minimumDate={new Date()}
            onChange={onDateChange}
          />
        ) : null}
        <Pressable className="bg-sky-600 p-3 rounded-lg items-center" onPress={handleAddTask}>
          <Text className="text-white font-semibold text-base">Dodaj do listy</Text>
        </Pressable>
      </View>

      <View className="mb-4">
        <Text className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Filtruj według projektu:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-2">
          {['Wszystkie', ...projects].map((filter) => {
            const isSelected = selectedFilter === filter;
            return (
              <Pressable
                key={filter}
                onPress={() => setSelectedFilter(filter)}
                className={isSelected ? "px-4 py-2 rounded-full border mr-2 bg-slate-800 border-slate-800" : "px-4 py-2 rounded-full border mr-2 bg-white border-slate-200"}
              >
                <Text className={isSelected ? "font-semibold text-sm text-white" : "font-semibold text-sm text-slate-600"}>{filter}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {error ? (
        <View className="bg-rose-50 p-4 rounded-xl border border-rose-200 mb-4">
          <Text className="text-rose-700 font-medium text-sm mb-2">{error}</Text>
          <Pressable className="bg-rose-600 p-2 rounded-lg items-center self-start px-4" onPress={fetchTasks}>
            <Text className="text-white font-bold text-xs">Spróbuj ponownie</Text>
          </Pressable>
        </View>
      ) : null}

      <Text className="text-xl font-bold text-slate-800 mb-3">Twoje zadania: ({selectedFilter})</Text>
      
      {isLoading ? (
        <View className="flex-1 justify-center items-center py-10">
          <ActivityIndicator size="large" color="#0284c7" />
          <Text className="text-slate-400 text-sm mt-2 font-medium">Wczytywanie bazy danych SQLite...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredTasks}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={
            <View className="items-center mt-10">
              <Text className="text-slate-400 text-base">Brak zadań. Wpisz coś powyżej!</Text>
            </View>
          }
          renderItem={({ item }) => {
            const isDone = item.isCompleted === 1;
            return (
              <View className={isDone ? "bg-white p-4 rounded-xl mb-3 border border-slate-200 flex-row justify-between items-center opacity-50" : "bg-white p-4 rounded-xl mb-3 border border-slate-200 flex-row justify-between items-center"}>
                <View className="flex-1 pr-4">
                  <View className="flex-row items-center gap-2">
                  <Text className={isDone ? "text-lg font-semibold text-slate-400 line-through" : "text-lg font-semibold text-slate-900"}>{item.title}</Text>
                   <Pressable 
                    onPress={() => openEditModal(item)}
                    >
                    <Ionicons name="create-outline" size={16} color= "#64748b" />
                  </Pressable>
                  </View>
                  {item.description ? (
                    <Text className="text-slate-500 mt-1 text-sm">{item.description}</Text>
                  ) : null}
                  <View className="flex-row gap-2 mt-2">
                    <Text className="text-xs text-sky-600 font-medium bg-sky-50 px-2 py-1 rounded">{item.project}</Text>
                    <Text className="text-xs text-amber-600 font-medium bg-amber-50 px-2 py-1 rounded">Do: {item.dueDate}</Text>
                  </View>
                </View>
                <View className="flex-row gap-2 items-center">
                  {isDone ? (
                    <Text className="text-emerald-600 font-bold mr-2 text-sm">Sukces</Text>
                  ) : (
                  <Pressable 
                      className={`bg-emerald-600 px-3 py-2 rounded-lg active:bg-emerald-700 flex-row items-center gap-1.5 ${isCameraLoading === item.id ? 'opacity-80' : ''}`}
                      onPress={() => handleCompleteTaskWithCamera(item.id)}
                      disabled={isCameraLoading !== null} // Blokujemy klikanie innych przycisków w czasie ładowania
                    >
                      {isCameraLoading === item.id ? (
                        <>
                          <ActivityIndicator size="small" color="#fff" />
                          <Text className="text-white font-medium text-xs">Ładowanie...</Text>
                        </>
                      ) : (
                        <Text className="text-white font-medium text-sm">Zrobione</Text>
                      )}
                    </Pressable>
                  )}
                  <Pressable 
                    className="bg-rose-50 px-3 py-2 rounded-lg active:bg-rose-100"
                    onPress={() => deleteTask(item.id)}
                  >
                    <Text className="text-rose-600 font-medium text-sm">Usuń</Text>
                  </Pressable>


                  
                </View>
              </View>
            );
          }}
        />
      )}

      <EditTaskModal 
        isVisible={isEditModalVisible}
        task={selectedTaskForEdit}
        onClose={() => {
          setIsEditModalVisible(false);
          setSelectedTaskForEdit(null);
        }}
      />
    </View>
  );
}