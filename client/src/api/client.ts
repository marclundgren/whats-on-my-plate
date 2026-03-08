import { Task, CreateTaskInput, UpdateTaskInput, Subtask, CreateSubtaskInput, Link, CreateLinkInput, UpdateLinkInput } from '../types/task.types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

function authHeaders(extra: Record<string, string> = {}): Record<string, string> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json', ...extra };
  const token = localStorage.getItem('auth_token');
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'An error occurred' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  if (response.status === 204) {
    return null as T;
  }

  return response.json();
}

// Task API
export const taskApi = {
  async getAll(params?: {
    category?: string;
    completed?: boolean;
    archived?: boolean;
    priority?: string;
    sortBy?: string;
    order?: string;
  }): Promise<Task[]> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
    }

    const url = `${API_URL}/tasks${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    const response = await fetch(url, { headers: authHeaders() });
    return handleResponse<Task[]>(response);
  },

  async getById(id: string): Promise<Task> {
    const response = await fetch(`${API_URL}/tasks/${id}`, { headers: authHeaders() });
    return handleResponse<Task>(response);
  },

  async create(data: CreateTaskInput): Promise<Task> {
    const response = await fetch(`${API_URL}/tasks`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<Task>(response);
  },

  async update(id: string, data: UpdateTaskInput): Promise<Task> {
    const response = await fetch(`${API_URL}/tasks/${id}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<Task>(response);
  },

  async toggleComplete(id: string): Promise<Task> {
    const response = await fetch(`${API_URL}/tasks/${id}/complete`, {
      method: 'PATCH',
      headers: authHeaders(),
    });
    return handleResponse<Task>(response);
  },

  async delete(id: string): Promise<void> {
    const response = await fetch(`${API_URL}/tasks/${id}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    return handleResponse<void>(response);
  },

  async archiveCompleted(): Promise<{ archived: number }> {
    const response = await fetch(`${API_URL}/tasks/archive-completed`, {
      method: 'POST',
      headers: authHeaders(),
    });
    return handleResponse<{ archived: number }>(response);
  },

  async unarchive(id: string): Promise<Task> {
    const response = await fetch(`${API_URL}/tasks/${id}/unarchive`, {
      method: 'PATCH',
      headers: authHeaders(),
    });
    return handleResponse<Task>(response);
  },
};

// Subtask API
export const subtaskApi = {
  async create(taskId: string, data: CreateSubtaskInput): Promise<Subtask> {
    const response = await fetch(`${API_URL}/tasks/${taskId}/subtasks`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<Subtask>(response);
  },

  async update(taskId: string, subtaskId: string, data: Partial<CreateSubtaskInput>): Promise<Subtask> {
    const response = await fetch(`${API_URL}/tasks/${taskId}/subtasks/${subtaskId}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<Subtask>(response);
  },

  async toggleComplete(taskId: string, subtaskId: string): Promise<Subtask> {
    const response = await fetch(`${API_URL}/tasks/${taskId}/subtasks/${subtaskId}/complete`, {
      method: 'PATCH',
      headers: authHeaders(),
    });
    return handleResponse<Subtask>(response);
  },

  async delete(taskId: string, subtaskId: string): Promise<void> {
    const response = await fetch(`${API_URL}/tasks/${taskId}/subtasks/${subtaskId}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    return handleResponse<void>(response);
  },
};

// Link API
export const linkApi = {
  async create(taskId: string, data: CreateLinkInput): Promise<Link> {
    const response = await fetch(`${API_URL}/tasks/${taskId}/links`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<Link>(response);
  },

  async update(taskId: string, linkId: string, data: UpdateLinkInput): Promise<Link> {
    const response = await fetch(`${API_URL}/tasks/${taskId}/links/${linkId}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<Link>(response);
  },

  async delete(taskId: string, linkId: string): Promise<void> {
    const response = await fetch(`${API_URL}/tasks/${taskId}/links/${linkId}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    return handleResponse<void>(response);
  },
};
