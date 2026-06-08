import React, { useState, useEffect } from 'react';
import { Text, View, FlatList, Pressable } from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { useTaskStore } from '@/src/store/task-store';

// Ustawiamy polską lokalizację dla kalendarza
LocaleConfig.locales['pl'] = {
  monthNames: ['Styczeń','Luty','Marzec','Kwiecień','Maj','Czerwiec','Lipiec','Sierpień','Wrzesień','Październik','Listopad','Grudzień'],
  monthNamesShort: ['Sty.','Luty','Mar.','Kwi.','Maj','Cze.','Lip.','Sie.','Wrz.','Paź.','Lis.','Gru.'],
  dayNames: ['Niedziela','Poniedziałek','Wtorek','Środa','Czwartek','Piątek','Sobota'],
  dayNamesShort: ['Nd','Pn','Wt','Śr','Cz','Pt','Sb'],
  today: 'Dzisiaj'
};
LocaleConfig.defaultLocale = 'pl';

interface MarkedDates {
  [date: string]: {
    marked?: boolean;
    dotColor?: string;
    selected?: boolean;
    selectedColor?: string;
  };
}

export default function CalendarScreen() {
  const { tasks, fetchTasks } = useTaskStore();
  
  // Stan przechowujący aktualnie kliknięty dzień (domyślnie dzisiejszy YYYY-MM-DD)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // Pobieramy najświeższe zadania z bazy przy każdym wejściu na ten ekran
  useEffect(() => {
    fetchTasks();
  }, []);

  // Logika 1: Mapowanie zadań na kropki w kalendarzu
  const getMarkedDates = (): MarkedDates => {
    const marked: MarkedDates = {};

    // Najpierw zaznaczamy dni, w których są jakiekolwiek zadania
    tasks.forEach((task) => {
      if (task.dueDate) {
        marked[task.dueDate] = { 
          marked: true, 
          dotColor: task.isCompleted === 1 ? '#10b981' : '#f59e0b' // zielona kropka dla skończonych, pomarańczowa dla aktywnych
        };
      }
    });

    // Na koniec nakładamy niebieskie tło na aktualnie WYBRANY dzień
    marked[selectedDate] = {
      ...marked[selectedDate],
      selected: true,
      selectedColor: '#0284c7',
    };

    return marked;
  };

  // Logika 2: Filtrowanie zadań, które należą TYLKO do klikniętego dnia
  const filteredTasks = tasks.filter((task) => task.dueDate === selectedDate);

  return (
    <View className="flex-1 bg-slate-50">
      
      {/* SEKCJA 1: Komponent Kalendarza */}
      <View className="bg-white pb-2 shadow-sm border-b border-slate-200">
        <Calendar
          current={selectedDate}
          onDayPress={(day) => setSelectedDate(day.dateString)}
          markedDates={getMarkedDates()}
          theme={{
            todayTextColor: '#0284c7',
            arrowColor: '#0284c7',
            dotStyle: { width: 6, height: 6, borderRadius: 3, marginTop: 1 },
            textDayFontWeight: '500',
            textMonthFontWeight: 'bold',
            textDayHeaderFontWeight: 'bold',
          }}
        />
      </View>

      {/* SEKCJA 2: Nagłówek wybranego dnia */}
      <View className="px-4 pt-4 pb-2">
        <Text className="text-sm font-bold text-slate-400 uppercase tracking-wider">
          Zadania na dzień:
        </Text>
        <Text className="text-xl font-extrabold text-slate-800">
          {selectedDate}
        </Text>
      </View>

      {/* SEKCJA 3: Lista zadań pod kalendarzem */}
      <FlatList
        data={filteredTasks}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
        renderItem={({ item }) => {
          const isDone = item.isCompleted === 1;
          return (
            <View className={`bg-white p-4 rounded-xl mb-3 border border-slate-200 flex-row justify-between items-center ${isDone ? 'opacity-50' : ''}`}>
              <View className="flex-1">
                <Text className={`text-base font-bold text-slate-900 ${isDone ? 'line-through text-slate-400' : ''}`}>
                  {item.title}
                </Text>
                {item.description ? (
                  <Text className="text-slate-500 text-sm mt-1">{item.description}</Text>
                ) : null}
              <Text className="text-xs text-sky-600 font-medium bg-sky-50 px-2 py-0.5 rounded self-start mt-2">
                {item.project}
              </Text>
              </View>
              <View>
                {isDone ? (
                  <Text className="text-emerald-600 font-bold text-xs">✓ Wykonane</Text>
                ) : (
                  <Text className="text-amber-500 font-bold text-xs">● W toku</Text>
                )}
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <View className="items-center mt-8 bg-white p-6 rounded-xl border border-slate-200 border-dashed">
            <Text className="text-slate-400 text-base font-medium">Brak zadań zaplanowanych na ten dzień.</Text>
          </View>
        }
      />
    </View>
  );
}