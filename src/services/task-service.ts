// src/services/taskService.ts
import * as Notifications from "expo-notifications";
import { TaskRepository } from '../database/task-repository';
import { Task } from '../types/task';
import { User } from "../types/user";


export const TaskService = {
  // Pobieranie zadań z bazy danych
  async getTasks(currentUser: User): Promise<Task[]> {
    return await TaskRepository.getAllTasks(currentUser);
  },

  // Tworzenie zadań
  // wykorzystujemy natywny typ Omit z TypeScripta
  async createTask(taskData: Omit<Task, 'id' | 'isCompleted' | 'imageUri' | 'user'>, currentUser: User): Promise<Task> {
    
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
    await TaskRepository.create(taskToCreate);          //zapis do bazy danych

    // Planowanie powiadomienia systemowego.
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

      console.log('Pomyślnie zaplanowano powiadomienie.');
    } catch (error) {
      console.log('Powiadomienia zablokowane przez środowisko Expo Go (SDK 53+).');
    }

    return taskToCreate; // Zwracamy gotowy obiekt, żeby było wiadomo z czego ma skorzystać store
  },

  //kończenie zadania, sprawdzamy warunki, czy na pewno zrobiliśmy zdjęcie
  async completeTask(id: string, imageUri: string): Promise<void> {
    if (!imageUri) {
      throw new Error("Zrób zdjęcie jako dowód, żeby ukończyć zadanie!");
    }
    await TaskRepository.updateStatus(id, 1, imageUri);
  },

  // Usuwanie zadania
  async deleteTask(id: string): Promise<void> {
    await TaskRepository.delete(id);
  },

  //edycja zadania
  async updateTask(id: string, title: string, description: string, project: string, dueDate: string): Promise<void> {
    await TaskRepository.updateTask(id, title, description, project, dueDate);
  }
};