export enum Category {
  WORK = 'WORK',
  PERSONAL = 'PERSONAL'
}

export enum Priority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT'
}

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
  completedAt: string | null;
  order: number;
  taskId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Link {
  id: string;
  url: string;
  title: string | null;
  taskId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string | null;
  notes?: string | null;
  category: Category;
  priority: Priority;
  dueDate: string | null;
  completed: boolean;
  completedAt: string | null;
  archived: boolean;
  archivedAt: string | null;
  createdAt: string;
  updatedAt: string;
  subtasks: Subtask[];
  links: Link[];
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  notes?: string;
  category: Category;
  priority: Priority;
  dueDate?: string;
}

export interface UpdateTaskInput extends Partial<CreateTaskInput> {
  completed?: boolean;
  archived?: boolean;
}

export interface CreateSubtaskInput {
  title: string;
  order?: number;
}

export interface CreateLinkInput {
  url: string;
  title?: string;
}

export interface UpdateLinkInput {
  url?: string;
  title?: string | null;
}
