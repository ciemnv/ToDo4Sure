// src/services/taskService.ts
import NetInfo from '@react-native-community/netinfo';
import * as Notifications from "expo-notifications";
import { TaskRepository } from '../database/task-repository';
import { NewTaskPayload, Task } from '../types/task';
import { User } from "../types/user";
import { supabase } from "./supabase";


export const TaskService = {
  // Pobieranie zadań z bazy danych


// Tryb Offline: Zawsze najpierw pobieramy dane z lokalnego SQLite cache
  async getTasks(currentUser: User): Promise<Task[]> {
    const localTasks = await TaskRepository.getAllTasks(currentUser);
    
    const netState = await NetInfo.fetch();
    // Jeśli mamy sieć i nie jesteśmy gościem, pobieramy najświeższe dane z chmury i aktualizujemy cache
    if (netState.isConnected && !currentUser.isGuest) {
      try {
        const { data: cloudTasks, error } = await supabase
          .from('tasks')
          .select('*')
          .eq('userId', currentUser.id);

        if (!error && cloudTasks) {
          // Synchronizacja: Nadpisujemy lokalny cache danymi z chmury
          for (const cTask of cloudTasks) {
            const exists = localTasks.find(t => t.id === cTask.id);
            if (!exists) {
              await TaskRepository.create({
                id: cTask.id,
                title: cTask.title,
                description: cTask.description,
                project: cTask.project,
                dueDate: cTask.dueDate,
                isCompleted: cTask.isCompleted ? 1 : 0,
                imageUri: cTask.imageUri,
                user: currentUser
              });
            }
          }
          return await TaskRepository.getAllTasks(currentUser);
        }
      } catch (e) {
        console.log("Supabase nieosiągalne, działamy na danych z cache SQLite");
      }
    }

    return localTasks;
  },

  // Tworzenie zadań
  // wykorzystujemy natywny typ Omit z TypeScripta
  async createTask(taskData: NewTaskPayload, currentUser: User): Promise<Task> {
    
    const newId = Date.now().toString();                         //jako id używamy daty

    const taskToCreate: Task = {
      id: newId,
      title: taskData.title,
      description: taskData.description,
      project: taskData.project,
      dueDate: taskData.dueDate,
      isCompleted: 0,
      imageUri: '',
      user: currentUser
    };
    await TaskRepository.create(taskToCreate);          //zapis do bazy danych SQLite


    //jeśli mamy internet i użytkownik jest zalogowany, wysyłamy do Supabase
    const netState = await NetInfo.fetch();
    if (netState.isConnected && !currentUser.isGuest) {
      try {
        await supabase.from('tasks').insert([{
          id: newId,
          title: taskData.title,
          description: taskData.description,
          project: taskData.project,
          dueDate: taskData.dueDate,
          isCompleted: false,
          userId: currentUser.id
        }]);
      } catch (e) {
        console.log("Nie udało się zapisać w chmurze, dane zachowane w cache lokalnym.");
      }
    }



    // Planowanie powiadomienia systemowego
    try {
      const alarmDate = new Date(`${taskData.dueDate}T09:00:00`);
      const now = new Date();
      const finalDate = alarmDate > now ? alarmDate : new Date(now.getTime() + 10000);

      await Notifications.scheduleNotificationAsync({
        content: {
          title: `Powiadomienie: ${taskData.title}`,
          body: taskData.description ? taskData.description : 'Pamiętaj o Twoim zadaniu na dziś!',
          sound: true,
          data: { taskId: newId }
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: finalDate,
        } as Notifications.DateTriggerInput
      });
      console.log('Zaplanowano powiadomienie.');
    } catch (error) {
      console.log('Powiadomienia wstrzymane');
    }

    return taskToCreate; // Zwracamy gotowy obiekt, żeby było wiadomo z czego ma skorzystać store
  },

  //kończenie zadania, sprawdzamy warunki, czy na pewno zrobiliśmy zdjęcie
  async completeTask(id: string, imageUri: string): Promise<void> {
    if (!imageUri) {
      throw new Error("Zrób zdjęcie jako dowód, żeby ukończyć zadanie!");
    }

    //aktualizacja w pamieci telefonu (w bazie sqlite)
    await TaskRepository.updateStatus(id, 1, imageUri);

    //aktualizacja w chmurze
    const netState = await NetInfo.fetch();
    if (netState.isConnected) {
      await supabase.from('tasks').update({ isCompleted: true, imageUri }).eq('id', id);
    }
  },

  // Usuwanie zadania
  async deleteTask(id: string): Promise<void> {
    //usuwanie z bazy
    await TaskRepository.delete(id);

    //usuwanie z chmury
    const netState = await NetInfo.fetch();
    if (netState.isConnected) {
      await supabase.from('tasks').delete().eq('id', id);
    }
  },

  async updateTask(
    id: string,
    title: string,
    description: string,
    project: string,
    dueDate: string
  ): Promise<void> {

    await TaskRepository.updateTask(
      id,
      title,
      description,
      project,
      dueDate
    );

    const netState = await NetInfo.fetch();

    if (netState.isConnected) {
      await supabase
        .from('tasks')
        .update({
          title,
          description,
          project,
          dueDate
        })
        .eq('id', id);
    }
  },

  // kompleksowe czyszczenie baz danych
  async deleteAllTasks(currentUser: User): Promise<void> {
    // 1. Zawsze czyścimy lokalne repozytorium SQLite
    await TaskRepository.deleteAllTasks();

    // 2. Jeśli użytkownik jest online i nie jest gościem, czyścimy też jego zadania w Supabase
    const netState = await NetInfo.fetch();
    if (netState.isConnected && !currentUser.isGuest) {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('userId', currentUser.id); // Czyścimy tylko zadania zalogowanego studenta!

      if (error) throw error;
    }
  }
};