// src/services/taskService.ts
import * as Notifications from "expo-notifications";
import { TaskRepository } from '../database/task-repository';
import { Task } from '../types/task';


export const TaskService = {
  // Pobieranie zadań z bazy danych
  async getTasks(): Promise<Task[]> {
    return await TaskRepository.getAllTasks();
  },

  // Tworzenie zadań
  async createTask(title: string, description: string, project: string, dueDate: string): Promise<Task> {
    const newId = Date.now().toString();                         //jako id używamy daty

    const taskToCreate: Task = {
      id: newId,
      title,
      description,
      project,
      dueDate,
      isCompleted: 0,
      imageUri: ''
    };
    await TaskRepository.create(taskToCreate);            //zapis do bazy danych

    //planowanie powiadomienia systemowego
// 2. Próba zaplanowania powiadomienia (zabezpieczona)
    try {
      const alarmDate = new Date(`${dueDate}T09:00:00`);
      const now = new Date();
      const finalDate = alarmDate > now ? alarmDate : new Date(now.getTime() + 10000);

      // System spróbuje wywołać powiadomienie
      await Notifications.scheduleNotificationAsync({
        content: {
          title: `Powiadomienie: ${title}`,
          body: description ? description : 'Pamiętaj o Twoim zadaniu na dziś!',
          sound: true,
          data: { taskId: newId }
        },
        trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: finalDate,
          } as Notifications.DateTriggerInput
      });

      console.log(`Pomyślnie zaplanowano powiadomienie.`);
    } catch (error) {
      // Jeśli Expo Go odrzuci operację, aplikacja nie crashuje, 
      // tylko po cichu zapisuje informację w logach deweloperskich
      console.log("Powiadomienia zablokowane przez środowisko Expo Go (SDK 53+).");
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
  }
};