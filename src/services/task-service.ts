// src/services/taskService.ts
import { TaskRepository } from '../database/task-repository';
import { Task } from '../types/task';

export const TaskService = {
  // Pobieranie zadań z bazy danych
  async getTasks(): Promise<Task[]> {
    return await TaskRepository.getAllTasks();
  },

  // Tworzenie zadań
  async createTask(title: string, description: string, project: string): Promise<Task> {
    const newId = Date.now().toString();                         //jako id używamy daty
    const today = new Date().toISOString().split('T')[0];        //today pobieramy za pomocą Date i formatujemy na odpowiedni format

    const taskToCreate: Task = {
      id: newId,
      title,
      description,
      project,
      dueDate: today,
      isCompleted: 0,
      imageUri: null
    };

    await TaskRepository.create(taskToCreate);
    return taskToCreate; // Zwracamy gotowy obiekt, żeby było wiadomo z czego ma skorzystać store
  },

  //kończenie zadania, sprawdzamy warunki, czy na pewno zrobiliśmy zdjęcie
  async completeTask(id: string, imageUri: string): Promise<void> {
    if (!imageUri) {
      throw new Error("Ukończenie zadania wymaga zrobienia zdjęcia-dowodu!");
    }
    await TaskRepository.updateStatus(id, 1, imageUri);
  },

  // Usuwanie zadania
  async deleteTask(id: string): Promise<void> {
    await TaskRepository.delete(id);
  }
};