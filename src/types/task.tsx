import { User } from "./user";

export interface Task {
  id: string;
  title: string;
  description: string;
  project: string;
  dueDate: string;
  isCompleted: number; // 0 = fałsz, 1 = prawda
  imageUri: string | null;
  user: User; 
}

export interface NewTaskPayload {
  title: string;
  description: string;
  project: string;
  dueDate: string;
}