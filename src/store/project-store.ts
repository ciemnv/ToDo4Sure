// src/store/project-store.ts
import { create } from 'zustand';
import { getDBConnection } from '../database/db';
import { useTaskStore } from './task-store';
import { useAuthStore } from './auth-store';
import { supabase } from '../services/supabase';
import NetInfo from '@react-native-community/netinfo';

interface ProjectState {
  projects: string[];
  updateProjectName: (index: number, newName: string) => Promise<void>;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: ['Główne', 'Studia', 'Dom'],

  updateProjectName: async (index: number, newName: string) => {
    const trimmedNewName = newName.trim();
    const oldName = get().projects[index];

    // Jeśli nazwa się nie zmieniła lub jest pusta, nic nie rób
    if (!trimmedNewName || oldName === trimmedNewName) return;

    // 1. Aktualizacja nazw projektów w pamięci RAM (Zustand)
    const updatedProjects = [...get().projects];
    updatedProjects[index] = trimmedNewName;
    set({ projects: updatedProjects });

    try {
      // 2. Aktualizacja wszystkich istniejących zadań w lokalnej bazie SQLite
      const db = await getDBConnection();
      await db.runAsync(
        'UPDATE tasks SET project = ? WHERE project = ?',
        [trimmedNewName, oldName]
      );

      // 3. Aktualizacja zadań w pamięci podręcznej useTaskStore, żeby UI od razu się przerysowało
      const { tasks } = useTaskStore.getState();
      const updatedTasks = tasks.map(task => 
        task.project === oldName ? { ...task, project: trimmedNewName } : task
      );
      useTaskStore.setState({ tasks: updatedTasks });

      // 4. Jeśli użytkownik jest online i zalogowany, aktualizujemy chmurę Supabase
      const currentUser = useAuthStore.getState().user;
      const netState = await NetInfo.fetch();
      
      if (netState.isConnected && currentUser && !currentUser.isGuest) {
        await supabase
          .from('tasks')
          .update({ project: trimmedNewName })
          .eq('userId', currentUser.id)
          .eq('project', oldName);
      }
    } catch (error) {
      console.error('Błąd podczas kaskadowej aktualizacji projektów:', error);
      throw error;
    }
  }
}));