// src/components/EditTaskModal.tsx
import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TextInput, Pressable, Alert } from 'react-native';
import { Task } from '@/src/types/task';
import { useTaskStore } from '@/src/store/task-store';

interface EditTaskModalProps {
  isVisible: boolean;
  onClose: () => void;
  task: Task | null;
}

export const EditTaskModal: React.FC<EditTaskModalProps> = ({ isVisible, onClose, task }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [project, setProject] = useState('Praca');
  const [dueDate, setDueDate] = useState('');

  // Kiedy modal się otwiera i dostaje obiekt zadania, wypełniamy pola formularza
  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
      setProject(task.project || 'Praca');
      setDueDate(task.dueDate);
    }
  }, [task, isVisible]);

  const handleSave = async () => {
    if (!title.trim() || !task) {
      Alert.alert('Błąd', 'Tytuł zadania nie może być pusty!');
      return;
    }

    try {
      const { updateTask } = useTaskStore.getState();
      await updateTask(task.id, title.trim(), description.trim(), project, dueDate);
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

          <View className="flex-row justify-between gap-3 mt-4">
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