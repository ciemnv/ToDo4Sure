import { getDBConnection } from '../database/db';
import { Task } from '../types/task';


//Operacja CRUD dla bazy danych
export const TaskRepository = {
  // Pobieranie wszystkich zadań z bazy danych
  async getAllTasks(): Promise<Task[]> {
    const db = await getDBConnection();
    return await db.getAllAsync<Task>('SELECT * FROM tasks');
  },

  // Dodawaniae nowego zadania do bazy danych
  async create(task: Task): Promise<void> {
    const db = await getDBConnection();

    await db.runAsync(
      'INSERT INTO tasks (id, title, description, project, dueDate, isCompleted, imageUri) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [task.id, task.title, task.description, task.project, task.dueDate, task.isCompleted, task.imageUri]
    );
  },

  // Aktualizacja statusu zadania i zdjęcia w bazie danych
  async updateStatus(id: string, isCompleted: number, imageUri: string | null): Promise<void> {
    const db = await getDBConnection();

    const safeImageUri = imageUri ?? '';

    // await db.runAsync(
    //   'UPDATE tasks SET isCompleted = ?, imageUri = ? WHERE id = ?', 
    //   [isCompleted, imageUri, id]
    // );
    await db.runAsync(
      'UPDATE tasks SET isCompleted = ?, imageUri = ? WHERE id = ?', 
      [isCompleted, safeImageUri, id]
    );

  },

  //edycja zadania w bazie
  async updateTask(id: string, title: string, description: string, project: string, dueDate: string): Promise<void> {
    const db = await getDBConnection();
    await db.runAsync('UPDATE tasks SET title = ?, description = ?, project = ?, dueDate = ? WHERE id = ?',[title, description, project, dueDate, id]);
  },

  // Usuwanie zadania z bazy
  async delete(id: string): Promise<void> {
    const db = await getDBConnection();
    await db.runAsync('DELETE FROM tasks WHERE id = ?', [id]);
  }
};