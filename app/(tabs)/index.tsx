import { useTaskStore } from '@/src/store/task-store';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useState } from 'react';
import { Alert, FlatList, Pressable, ScrollView, Text, TextInput, View } from 'react-native';


const AVAILABLE_PROJECTS = ['Główne', 'Studia', 'Dom'];

export default function TasksScreen() {
  // Stany lokalne komponentu do obsługi formularza dodawania tasków 
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [project, setProject] = useState('Główne');

  //stan dla filtrowania listy - domyslnie "wszystkie"
  const [selectedFilter, setSelectedFilter] = useState('Wszystkie');

  // Stan dla daty i wyświetlania kalendarza
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Pobieramy stany globalne do listy zadań (wg zustanda) przez TaskStore
  const { tasks, fetchTasks, addTask, deleteTask, completeTask } = useTaskStore();

  // Pobieramy zadania z bazy danych
  useEffect(() => {
    fetchTasks();
  }, []);

  // obsługa dodania zadania
  const handleAddTask = async () => {
    //jeśli tytuł po skróceniu nie istnieje (usuwamy z tekstu wszystkie puste spacje)
    if (!title.trim()) {
      Alert.alert('Błąd', 'Tytuł zadania nie może być pusty!');
      return;
    }

    // formatujemy date do stringu YYYY-MM-DD
    //tniemy tekst tylko do pierwszej części formatu date
    const formattedDate = date.toISOString().split('T')[0];

    try {
    //przekazujemy dane do Zustanda - TaskStore - który potem przesyła je przez serwis do sql lite
    await addTask(title, description, project, formattedDate);

    // Czyszczenie pól formularza po dodaniu
    setTitle('');
    setDescription('');
    setDate(new Date());
    } catch (error) {
      Alert.alert('Błąd bazy danych', 'Nie udało się zapisać zadania.');
      console.error(error);
    }
  };

  const handleCompleteTaskWithCamera = async (id: string) => {
    //1. prosimy system o uprawnienia aparatu
    const permission = await ImagePicker.requestCameraPermissionsAsync();

    if (permission.granted === false) {
      Alert.alert('Błąd', 'Musisz zezwolić aplikacji na dostęp do aparatu')
      return;
    }

    //2. uruchamiamy systemowy aparat
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      quality: 0.7, //żeby nie obciążać danymi
    });

    //3. dalsza obsługa (jeśli nie kliknął anuluj)
    if(!result.canceled && result.assets && result.assets[0].uri) {
      const permamentUri = result.assets[0].uri;
      try {
        //zapisujemy ścieżkę zdjęcia systemowego w bazie sqlite i zustand
        await completeTask(id, permamentUri);
      } catch (error) {
        Alert.alert('Błąd', 'Nie udało się zaktualizować statusu zadania')
      }
    }


  }

  //funkcja którą wywołujemy automatycznie przez komponent kalendarza, kiedy użytkownik klika w jakiś dzień
  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false); //ukryj kalendarz żeby nie zasłaniał ekranu
    if (selectedDate) {
      setDate(selectedDate);
    }
  }


  //filtrowanie po kategoriach - filter wybiera tylko te, ktore pasuja do filtra
  const filteredTasks = tasks.filter((task) => {
    if (selectedFilter === 'Wszystkie') return true;
    return task.project === selectedFilter; 
  });



  return (
    <View className="flex-1 bg-slate-50 p-4">
      
      {/* formularz dodawania nowego zadania */}

      <View className="bg-white p-4 rounded-xl shadow-sm mb-6 border border-slate-100">    {/* className pochodzi od NativeWinda */}
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

        {/* wybór projektu/kategorii */}
        <Text className="text-sm font-semibold text-slate-600 mb-2">Projekt / Kategoria:</Text>
        <View className="flex-row gap-2 mb-3">
          {AVAILABLE_PROJECTS.map((p) => {
            const isSelected = project === p;
            return (
              <Pressable
                key={p}
                onPress={() => setProject(p)}
                className={`flex-1 p-2 rounded-lg items-center border ${isSelected ? 'bg-sky-50 border-sky-600' : 'bg-slate-50 border-slate-300'}`}
              >
                <Text className={`font-medium text-sm ${isSelected ? 'text-sky-600' : 'text-slate-600'}`}>
                  {p}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Przycisk ustawiania daty */}
        <Pressable
          className="bg-slate-100 p-3 rounded-lg mb-4 border border-slate-300 flex-row justify-between items-center active:opacity-70"
          onPress={() => setShowDatePicker(true)}
        >
          <Text className="text-slate-700 text-base">Termin wykonania:</Text>
          <Text className="text-sky-600 font-semibold text-base">
            {date.toISOString().split('T')[0]}
          </Text>
        </Pressable>
        
        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display="default"
            minimumDate={new Date()} // nie pozwalamy wybierać dat z przeszłości
            onChange={onDateChange}
          />
        )}

        {/* Przycisk dodawania */}
        <Pressable
          className="bg-sky-600 p-3 rounded-lg items-center"
          onPress={handleAddTask}
        >
          <Text className="text-white font-semibold text-base">Dodaj do listy</Text>
        </Pressable>
      </View>

      {/* tabsy do filtrowania po kategoriach/projektach */}
      <View className="mb-4">
        <Text className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Filtruj według projektu:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-2">
          {['Wszystkie', ...AVAILABLE_PROJECTS].map((filter) => {
            const isSelected = selectedFilter === filter;
            return (
              <Pressable
                key={filter}
                onPress={() => setSelectedFilter(filter)}
                className={`px-4 py-2 rounded-full border mr-2 ${isSelected ? 'bg-slate-800 border-slate-800' : 'bg-white border-slate-200'}`}
              >
                <Text className={`font-semibold text-sm ${isSelected ? 'text-white' : 'text-slate-600'}`}>
                  {filter}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>



      {/* Część z dodawaniem listy zadań */}

      {/* wyświetlanie listy zadań */}
      <Text className="text-xl font-bold text-slate-800 mb-3">Twoje zadania: ({selectedFilter})</Text>
      
      <FlatList
        data={filteredTasks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const isDone = item.isCompleted === 1;

          return (
            <View className={`bg-white p-4 rounded-xl mb-3 border border-slate-200 flex-row justify-between items-center ${isDone ? 'opacity-50' : ''}`}>   
              <View className="flex-1 pr-4">
                {/* Jeśli zrobione, przekreślamy tekst */}
                <Text className={`text-lg font-semibold text-slate-900 ${isDone ? 'line-through text-slate-400' : ''}`}>
                  {item.title}
                </Text>
                
                {item.description ? (
                  <Text className="text-slate-500 mt-1 text-sm">{item.description}</Text>
                ) : null}
                
                <View className="flex-row gap-2 mt-2">
                  <Text className="text-xs text-sky-600 font-medium bg-sky-50 px-2 py-1 rounded">
                    {item.project}
                  </Text>
                  <Text className="text-xs text-amber-600 font-medium bg-amber-50 px-2 py-1 rounded">
                    Do: {item.dueDate}
                  </Text>
                </View>
              </View>
              


              <View className="flex-row gap-2 items-center">
                {/* Przycisk Zrobione - ukrywamy, jeśli już jest wykonane */}
                {isDone ? (
                  <Text className="text-emerald-600 font-bold mr-2 text-sm">Sukces</Text>
                ) : (
                  <Pressable 
                    className="bg-emerald-600 px-3 py-2 rounded-lg active:bg-emerald-700"
                    //na razie to tylko link do zdj
                    onPress={() => handleCompleteTaskWithCamera(item.id)}
                  >
                    <Text className="text-white font-medium text-sm">Zrobione</Text>
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
        ListEmptyComponent={
          <View className="items-center mt-10">
            <Text className="text-slate-400 text-base">Brak zadań. Wpisz coś powyżej!</Text>
          </View>
        }
      />
    </View>
  );
}