import { getDBConnection } from '../database/db';
import { Task } from '../types/task';
import { User } from '../types/user';

//Operacje CRUD dla bazy danych
export const TaskRepository = {
  async getAllTasks(currentUser: User): Promise<Task[]> {
    const db = await getDBConnection();
    
    // BEZPIECZEŃSTWO: Jeśli id jest puste, podstawiamy bezpieczny identyfikator, chroniąc przed NullPointerException
    const currentUserId = currentUser && currentUser.id ? currentUser.id : 'guest_local_device';
    
    const rows = await db.getAllAsync<any>('SELECT * FROM tasks WHERE userId = ?', [currentUserId]);

    return rows.map(row => ({
      id: row.id,
      title: row.title,
      description: row.description,
      project: row.project,
      dueDate: row.dueDate,
      isCompleted: row.isCompleted,
      imageUri: row.imageUri,
      user: currentUser
    }));
  },

  // Dodawaniae nowego zadania do bazy danych
  async create(task: Task): Promise<void> {
    const db = await getDBConnection();
    
    // ubezpieczenie przed brakiem ID użytkownika w locie asynchronicznym
    const currentUserId = task.user && task.user.id ? task.user.id : 'guest_local_device';

    await db.runAsync(
      'INSERT INTO tasks (id, title, description, project, dueDate, isCompleted, imageUri, userId) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [task.id, task.title, task.description, task.project, task.dueDate, task.isCompleted, task.imageUri, currentUserId]
    );
  },

  // Aktualizacja statusu zadania i zdjęcia w bazie danych
  async updateStatus(id: string, isCompleted: number, imageUri: string | null): Promise<void> {
    const db = await getDBConnection();
    const safeImageUri = imageUri ?? '';
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
  },

  //usuwanie wszystkich tasków z bazy danyhc
  async deleteAllTasks(): Promise<void> {
    const db = await getDBConnection();
    await db.runAsync('DELETE FROM tasks');
  }
};