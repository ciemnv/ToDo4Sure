// src/components/EditTaskModal.tsx
import { useProjectStore } from '@/src/store/project-store';
import { useTaskStore } from '@/src/store/task-store';
import { Task } from '@/src/types/task';
import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useEffect, useState } from 'react';
import { Alert, Modal, Pressable, Text, TextInput, View } from 'react-native';

interface EditTaskModalProps {
    isVisible: boolean;
    onClose: () => void;
    task: Task | null;
}

// const AVAILABLE_PROJECTS = ['Główne', 'Studia', 'Dom'];


export const EditTaskModal: React.FC<EditTaskModalProps> = ({ isVisible, onClose, task }) => {

    const { projects } = useProjectStore();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [project, setProject] = useState('Praca');
    const [dueDate, setDueDate] = useState('');
    const [date, setDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);

    // Kiedy modal się otwiera i dostaje obiekt zadania, wypełniamy pola formularza
    useEffect(() => {
        if (task) {
            setTitle(task.title);
            setDescription(task.description || '');
            setDate(new Date(task.dueDate));

            // NOWA LOGIKA MAPOWANIA STARYCH NAZW NA NOWE:
            // Sprawdzamy, czy projekt przypisany do zadania (np. 'Studia') wciąż istnieje w naszych 3 slotach
            if (projects.includes(task.project)) {
                setProject(task.project);
            } else {
                // Jeśli nazwa zadania w bazie danych jest przestarzała (bo zmieniliśmy ją w Ustawieniach),
                // to domyślnie podświetlamy pierwszy slot projektu ze sklepu, aby użytkownik nie widział błędu braku zaznaczenia.
                // Po kliknięciu "Zapisz zmiany" baza danych i tak nadpisze ten rekord nową, poprawną nazwą!
                setProject(projects[0] || 'Główne');
            }
        }
    }, [task, isVisible, projects]);

    const onDateChange = (event: any, selectedDate?: Date) => {
        setShowDatePicker(false); // Ukrywamy selektor po wyborze
        if (selectedDate) {
            setDate(selectedDate);
        }
    };

    const handleSave = async () => {
        if (!title.trim() || !task) {
            Alert.alert('Błąd', 'Tytuł zadania nie może być pusty!');
            return;
        }

        const formattedDate = date.toISOString().split('T')[0];

        try {
            const { updateTask } = useTaskStore.getState();
            await updateTask(task.id, title.trim(), description.trim(), project, formattedDate);
            onClose(); // Zamykamy modal po sukcesie
            Alert.alert('Sukces', 'Zadanie zostało zaktualizowane.');
        } catch (err) {
            Alert.alert('Błąd', 'Nie udało się zaktualizować zadania.');
        }
    };

    return (
        <Modal visible={isVisible} animationType="slide" transparent={true}>
            <View className="flex-1 justify-center items-center bg-black/50 p-4">
                <View className="bg-white w-full rounded-2xl p-5 shadow-xl max-w-md">
                    <Text className="text-xl font-bold text-slate-800 mb-4">Edytuj zadanie</Text>

                    <Text className="text-xs font-semibold text-slate-500 mb-1 ml-1">Tytuł zadania</Text>
                    <TextInput
                        className="border border-slate-200 rounded-xl p-3 mb-3 text-slate-700 bg-slate-50 font-medium"
                        value={title}
                        onChangeText={setTitle}
                        placeholder="Wpisz tytuł..."
                    />

                    <Text className="text-xs font-semibold text-slate-500 mb-1 ml-1">Opis (opcjonalnie)</Text>
                    <TextInput
                        className="border border-slate-200 rounded-xl p-3 mb-3 text-slate-700 bg-slate-50 font-medium"
                        value={description}
                        onChangeText={setDescription}
                        placeholder="Dodaj szczegóły..."
                        multiline
                        numberOfLines={3}
                    />
                    {/* Wybór kategorii*/}
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

                    {/* Wybór daty wewnątrz modalu */}
                    <Text className="text-xs font-semibold text-slate-500 mb-1 ml-1">Termin wykonania</Text>
                    <Pressable
                        className="bg-slate-50 p-3 rounded-xl mb-4 border border-slate-200 flex-row justify-between items-center active:opacity-70"
                        onPress={() => setShowDatePicker(true)}
                    >
                        <Text className="text-slate-600 font-medium">Zmień datę:</Text>
                        <Text className="text-sky-600 font-bold text-base">
                            {date.toISOString().split('T')[0]}
                        </Text>
                    </Pressable>

                    {showDatePicker && (
                        <DateTimePicker
                            value={date}
                            mode="date"
                            display="default"
                            minimumDate={new Date()} // Blokada dat przeszłych
                            onChange={onDateChange}
                        />
                    )}

                    <View className="flex-row justify-between gap-3 mt-2">
                        <Pressable
                            className="flex-1 bg-slate-100 p-3.5 rounded-xl items-center active:bg-slate-200 border border-slate-200"
                            onPress={onClose}
                        >
                            <Text className="text-slate-700 font-bold text-sm">Anuluj</Text>
                        </Pressable>

                        <Pressable
                            className="flex-1 bg-blue-600 p-3.5 rounded-xl items-center active:bg-blue-700 shadow-sm"
                            onPress={handleSave}
                        >
                            <Text className="text-white font-bold text-sm">Zapisz zmiany</Text>
                        </Pressable>
                    </View>
                </View>
            </View>
        </Modal>
    );
};