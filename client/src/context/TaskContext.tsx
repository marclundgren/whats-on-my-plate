import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Task, CreateTaskInput, UpdateTaskInput, Category, CreateLinkInput, UpdateLinkInput } from '../types/task.types';
import { taskApi, subtaskApi, linkApi } from '../api/client';
import { useStringQueryParam, useBooleanQueryParam } from '../hooks/useQueryParams';

interface DeletedTask {
  task: Task;
  timeoutId: NodeJS.Timeout;
}

interface TaskContextType {
  tasks: Task[];
  archivedTasks: Task[];
  filteredTasks: Task[];
  filteredArchivedTasks: Task[];
  loading: boolean;
  error: string | null;
  selectedCategory: Category | 'ALL';
  showArchived: boolean;
  searchQuery: string;
  pendingDelete: DeletedTask | null;
  setSelectedCategory: (category: Category | 'ALL') => void;
  setShowArchived: (show: boolean) => void;
  setSearchQuery: (query: string) => void;
  fetchTasks: () => Promise<void>;
  fetchArchivedTasks: () => Promise<void>;
  createTask: (data: CreateTaskInput) => Promise<Task>;
  updateTask: (id: string, data: UpdateTaskInput) => Promise<Task>;
  toggleTaskComplete: (id: string) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  undoDelete: () => void;
  archiveTask: (id: string) => Promise<void>;
  unarchiveTask: (id: string) => Promise<void>;
  archiveCompleted: () => Promise<void>;
  createSubtask: (taskId: string, title: string) => Promise<void>;
  toggleSubtaskComplete: (taskId: string, subtaskId: string) => Promise<void>;
  deleteSubtask: (taskId: string, subtaskId: string) => Promise<void>;
  createLink: (taskId: string, data: CreateLinkInput) => Promise<void>;
  updateLink: (taskId: string, linkId: string, data: UpdateLinkInput) => Promise<void>;
  deleteLink: (taskId: string, linkId: string) => Promise<void>;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

const UNDO_TIMEOUT = 5000; // 5 seconds to undo

export function TaskProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [archivedTasks, setArchivedTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<DeletedTask | null>(null);

  // URL query param synced state
  const [selectedCategory, setSelectedCategory] = useStringQueryParam(
    'category',
    'ALL',
    ['ALL', 'WORK', 'PERSONAL']
  ) as [Category | 'ALL', (value: Category | 'ALL') => void];
  const [showArchived, setShowArchived] = useBooleanQueryParam('archived', false);
  const [searchQuery, setSearchQuery] = useStringQueryParam('q', '');

  // Filter and sort tasks by search query (title matches first, then description)
  const filterAndSortBySearch = useCallback((taskList: Task[]): Task[] => {
    if (!searchQuery.trim()) return taskList;

    const query = searchQuery.toLowerCase().trim();

    const titleMatches: Task[] = [];
    const descriptionMatches: Task[] = [];

    taskList.forEach(task => {
      const titleMatch = task.title.toLowerCase().includes(query);
      const descMatch = task.description?.toLowerCase().includes(query);

      if (titleMatch) {
        titleMatches.push(task);
      } else if (descMatch) {
        descriptionMatches.push(task);
      }
    });

    return [...titleMatches, ...descriptionMatches];
  }, [searchQuery]);

  const filteredTasks = filterAndSortBySearch(tasks);
  const filteredArchivedTasks = filterAndSortBySearch(archivedTasks);

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params: { category?: string; archived?: boolean } = { archived: false };
      if (selectedCategory !== 'ALL') {
        params.category = selectedCategory;
      }
      const data = await taskApi.getAll(params);
      setTasks(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  }, [selectedCategory]);

  const fetchArchivedTasks = useCallback(async () => {
    try {
      const params: { archived: boolean; category?: string } = { archived: true };
      if (selectedCategory !== 'ALL') {
        params.category = selectedCategory;
      }
      const data = await taskApi.getAll(params);
      setArchivedTasks(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch archived tasks');
    }
  }, [selectedCategory]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  useEffect(() => {
    if (showArchived) {
      fetchArchivedTasks();
    }
  }, [showArchived, fetchArchivedTasks]);

  const createTask = async (data: CreateTaskInput): Promise<Task> => {
    try {
      const newTask = await taskApi.create(data);
      setTasks(prev => [newTask, ...prev]);
      return newTask;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create task');
      throw err;
    }
  };

  const updateTask = async (id: string, data: UpdateTaskInput): Promise<Task> => {
    try {
      const updatedTask = await taskApi.update(id, data);
      setTasks(prev => prev.map(task => task.id === id ? updatedTask : task));
      return updatedTask;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update task');
      throw err;
    }
  };

  const toggleTaskComplete = async (id: string) => {
    try {
      const updatedTask = await taskApi.toggleComplete(id);
      setTasks(prev => prev.map(task => task.id === id ? updatedTask : task));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle task');
    }
  };

  const deleteTask = async (id: string) => {
    // Find the task to delete
    const taskToDelete = tasks.find(t => t.id === id);
    if (!taskToDelete) return;

    // Clear any existing pending delete
    if (pendingDelete) {
      clearTimeout(pendingDelete.timeoutId);
      // Actually delete the previous pending task
      try {
        await taskApi.delete(pendingDelete.task.id);
      } catch {
        // Ignore errors for the previous task
      }
    }

    // Remove from UI immediately
    setTasks(prev => prev.filter(task => task.id !== id));

    // Set up undo timeout
    const timeoutId = setTimeout(async () => {
      try {
        await taskApi.delete(id);
      } catch {
        // Task might already be deleted or restored
      }
      setPendingDelete(null);
    }, UNDO_TIMEOUT);

    setPendingDelete({ task: taskToDelete, timeoutId });
  };

  const undoDelete = () => {
    if (!pendingDelete) return;

    clearTimeout(pendingDelete.timeoutId);

    // Restore the task to UI
    setTasks(prev => [pendingDelete.task, ...prev]);
    setPendingDelete(null);
  };

  const archiveTask = async (id: string) => {
    try {
      const updatedTask = await taskApi.update(id, { archived: true });
      setTasks(prev => prev.filter(task => task.id !== id));
      if (showArchived) {
        setArchivedTasks(prev => [updatedTask, ...prev]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to archive task');
    }
  };

  const unarchiveTask = async (id: string) => {
    try {
      const updatedTask = await taskApi.unarchive(id);
      setArchivedTasks(prev => prev.filter(task => task.id !== id));
      setTasks(prev => [updatedTask, ...prev]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to unarchive task');
    }
  };

  const archiveCompleted = async () => {
    try {
      await taskApi.archiveCompleted();
      await fetchTasks();
      if (showArchived) {
        await fetchArchivedTasks();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to archive completed tasks');
    }
  };

  const createSubtask = async (taskId: string, title: string) => {
    try {
      await subtaskApi.create(taskId, { title });
      await fetchTasks();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create subtask');
    }
  };

  const toggleSubtaskComplete = async (taskId: string, subtaskId: string) => {
    try {
      await subtaskApi.toggleComplete(taskId, subtaskId);
      await fetchTasks();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle subtask');
    }
  };

  const deleteSubtask = async (taskId: string, subtaskId: string) => {
    try {
      await subtaskApi.delete(taskId, subtaskId);
      await fetchTasks();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete subtask');
    }
  };

  const createLink = async (taskId: string, data: CreateLinkInput) => {
    try {
      await linkApi.create(taskId, data);
      await fetchTasks();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create link');
    }
  };

  const updateLink = async (taskId: string, linkId: string, data: UpdateLinkInput) => {
    try {
      await linkApi.update(taskId, linkId, data);
      await fetchTasks();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update link');
    }
  };

  const deleteLink = async (taskId: string, linkId: string) => {
    try {
      await linkApi.delete(taskId, linkId);
      await fetchTasks();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete link');
    }
  };

  return (
    <TaskContext.Provider
      value={{
        tasks,
        archivedTasks,
        filteredTasks,
        filteredArchivedTasks,
        loading,
        error,
        selectedCategory,
        showArchived,
        searchQuery,
        pendingDelete,
        setSelectedCategory,
        setShowArchived,
        setSearchQuery,
        fetchTasks,
        fetchArchivedTasks,
        createTask,
        updateTask,
        toggleTaskComplete,
        deleteTask,
        undoDelete,
        archiveTask,
        unarchiveTask,
        archiveCompleted,
        createSubtask,
        toggleSubtaskComplete,
        deleteSubtask,
        createLink,
        updateLink,
        deleteLink,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
}

export function useTasks() {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error('useTasks must be used within a TaskProvider');
  }
  return context;
}
