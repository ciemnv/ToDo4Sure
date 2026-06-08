// src/store/taskStore.ts
import { create } from 'zustand';
import { TaskService } from '../services/task-service';
import { Task } from '../types/task';


//deklarujemy tutaj funkcje, z których TaskState może korzystać
//TaskSate wie o istnieniu tylko serwisu
interface TaskState {
  tasks: Task[];                //taski to tablica obiektów typu Task
  isLoading: boolean;           //stan ładowania
  error: string | null;         //stan błędu
  fetchTasks: () => Promise<void>;    //fetchujemy (pobieramy) dane z bazy
  addTask: (title: string, description: string, project: string, dueDate: string) => Promise<void>; //dodajemy nowe zadanie
  completeTask: (id: string, imageUri: string) => Promise<void>;  //oznaczamy task jako ukończony
  deleteTask: (id: string) => Promise<void>; //usuwamy task
  updateTask: (id: string, title: string, description: string, project: string, dueDate: string) => Promise<void>;
}

//Używamy tutaj Zustanda do centralnego magazynowania danych aplikacji ----- dostęp z każdego komponentu

//useTaskStore -- to jest Zustand Hook, czyli sposób korzystania ze store
//create<TaskState> tworzy globalny store i generuje hook React, oraz łączy stan+funkcje
export const useTaskStore = create<TaskState>((set) => ({
  tasks: [],
  isLoading: false,
  error: null,

  fetchTasks: async () => {
    set({ isLoading: true, error: null})
    try {
      const allTasks = await TaskService.getTasks();
      set({ tasks: allTasks, isLoading: false, error: null });
    } catch (error) {
      set({error: 'Store error podczas pobierania:', isLoading: false });
    }
  },

  addTask: async (title, description, project, dueDate) => {
  set({ isLoading: true, error: null})
    try {
      // Prosimy serwis o stworzenie zadania w bazie danych
      const createdTask = await TaskService.createTask(title, description, project, dueDate);
      // Dorzucamy to zadanie do pamięci RAM
      set((state) => ({ tasks: [...state.tasks, createdTask], isLoading: false, error: null }));
    } catch (error) {
      set({error: 'Store error podczas pobierania:', isLoading: false });
      throw error;
    }
  },

  completeTask: async (id, imageUri) => {
    try {
      await TaskService.completeTask(id, imageUri);
      set((state) => ({
        tasks: state.tasks.map((t) => (t.id === id ? { ...t, isCompleted: 1, imageUri } : t)),
        error: null,
      }));
    } catch (error) {
      console.error('Store error podczas kończenia:', error);
    }
  },

  deleteTask: async (id) => {
    try {
      await TaskService.deleteTask(id);
      set((state) => ({
        tasks: state.tasks.filter((t) => t.id !== id),
      }));
    } catch (error) {
      console.error('Store error podczas usuwania:', error);
    }
  },

  updateTask: async (id, title, description, project, dueDate) => {
    try {
      await TaskService.updateTask(id, title, description, project, dueDate);
      set((state) => ({
        tasks: state.tasks.map((t) =>
        t.id === id ? { ...t, title, description, project, dueDate } : t),
        error: null,
      }));
    } catch (err) {
      console.error('Problem podczas edycji: ', err);
      throw err;
    }
  },
}));