// src/types/task.ts
export interface Task {
  id: string;
  title: string;
  description: string;
  project: string;
  dueDate: string;
  isCompleted: number; // 0 = fałsz, 1 = prawda
  imageUri: string | null;
}