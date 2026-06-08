import { useTaskStore } from '@/src/store/task-store';
import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useEffect, useState } from 'react';
import { Alert, FlatList, Pressable, Text, TextInput, TouchableOpacity, View } from 'react-native';
 

export default function TasksScreen() {
  // Stany lokalne komponentu do obsługi formularza dodawania tasków 
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [project, setProject] = useState('Główne');


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

  //funkcja którą wywołujemy automatycznie przez komponent kalendarza, kiedy użytkownik klika w jakiś dzień
  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false); //ukryj kalendarz żeby nie zasłaniał ekranu
    if (selectedDate) {
      setDate(selectedDate);
    }
  }



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





      {/* Część z dodawaniem listy zadań */}

      {/* wyświetlanie listy zadań */}
      <Text className="text-xl font-bold text-slate-800 mb-3">Twoje zadania</Text>
      
      <FlatList
        data={tasks}
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
                    onPress={() => completeTask(item.id, 'mock-image-path.jpg')}
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