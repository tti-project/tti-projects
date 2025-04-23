import { User } from './user.model';

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'todo' | 'doing' | 'done';
  project: string;
  assignee?: User;
  createdBy: User;
  dueDate?: Date;
  priority: 'low' | 'medium' | 'high';
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface TaskAdd {
  title: string;
  description?: string;
  project: string;
  assignee?: string;
  dueDate?: Date;
  priority?: 'low' | 'medium' | 'high';
  order?: number;
}

export interface TaskUpdate {
  title?: string;
  description?: string;
  status?: 'todo' | 'doing' | 'done';
  assignee?: string;
  dueDate?: Date;
  priority?: 'low' | 'medium' | 'high';
  order?: number;
}
