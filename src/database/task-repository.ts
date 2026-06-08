import { getDBConnection } from '../database/db';
import { Task } from '../types/task';


//Operacja CRUD dla bazy danych
export const TaskRepository = {
  // Pobieranie wszystkich zadań z bazy danych
  async getAllTasks(): Promise<Task[]> {
    const db = await getDBConnection();

    // ZABEZPIECZENIE: Tworzymy tabelę zawsze przed próbą pobrania z niej danych.
    // Jeśli tabela już istnieje, SQLite po prostu zignoruje to polecenie.
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        project TEXT,
        dueDate TEXT,
        isCompleted INTEGER DEFAULT 0,
        imageUri TEXT
      );
    `);

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
    await db.runAsync(
      'UPDATE tasks SET isCompleted = ?, imageUri = ? WHERE id = ?', 
      [isCompleted, imageUri, id]
    );
  },

  // Usuwanie zadania z bazy
  async delete(id: string): Promise<void> {
    const db = await getDBConnection();
    await db.runAsync('DELETE FROM tasks WHERE id = ?', [id]);
  }
};