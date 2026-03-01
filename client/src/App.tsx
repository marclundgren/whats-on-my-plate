import React, { useState, useEffect, useRef } from 'react';
import { TaskProvider, useTasks } from './context/TaskContext';
import { ThemeProvider } from './context/ThemeContext';
import { SettingsProvider } from './context/SettingsContext';
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import TaskList from './components/tasks/TaskList';
import TaskForm from './components/tasks/TaskForm';
import Toast from './components/ui/Toast';
import SettingsPage from './components/settings/SettingsPage';
import { Task, CreateTaskInput, CreateLinkInput } from './types/task.types';

function AppContent() {
  const {
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
    createTask,
    updateTask,
    toggleTaskComplete,
    deleteTask,
    undoDelete,
    archiveTask,
    unarchiveTask,
    archiveCompleted,
    toggleSubtaskComplete,
    createLink,
    updateLink,
    deleteLink,
  } = useTasks();

  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInputField = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA';

      // Focus search with /
      if (e.key === '/' && !isInputField && !showTaskForm) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      // Add new task with n
      if (e.key === 'n' && !e.metaKey && !e.ctrlKey && !showTaskForm && !isInputField) {
        e.preventDefault();
        handleAddTask();
      }
      // Close form with Escape
      if (e.key === 'Escape') {
        if (showTaskForm) {
          handleCloseForm();
        } else if (document.activeElement === searchInputRef.current) {
          searchInputRef.current?.blur();
          setSearchQuery('');
        }
      }
      // Undo with Cmd/Ctrl+Z
      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && pendingDelete) {
        e.preventDefault();
        undoDelete();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showTaskForm, pendingDelete, undoDelete, setSearchQuery]);

  const handleAddTask = () => {
    setEditingTask(null);
    setShowTaskForm(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setShowTaskForm(true);
  };

  const handleCloseForm = () => {
    setShowTaskForm(false);
    setEditingTask(null);
  };

  const handleSubmitTask = async (data: CreateTaskInput, pendingLinks?: CreateLinkInput[]) => {
    if (editingTask) {
      await updateTask(editingTask.id, data);
    } else {
      const newTask = await createTask(data);
      // Create any pending links for the new task
      if (pendingLinks && pendingLinks.length > 0) {
        for (const link of pendingLinks) {
          await createLink(newTask.id, link);
        }
      }
    }
  };

  const handleDeleteTask = async (id: string) => {
    await deleteTask(id);
  };

  const completedCount = tasks.filter(t => t.completed).length;

  return (
    <div className="min-h-screen bg-[var(--color-cream)]">
      <Header onAddTask={handleAddTask} onOpenSettings={() => setShowSettings(true)} showSettings={showSettings} />

      <div className="flex">
        <Sidebar
          selectedCategory={selectedCategory}
          onSelectCategory={(cat) => { setSelectedCategory(cat); setShowSettings(false); }}
        />

        <main className="flex-1 min-h-[calc(100vh-73px)]">
          {showSettings ? <SettingsPage /> : <div className="max-w-3xl mx-auto px-6 lg:px-8 py-8">
            {/* Page Title */}
            <div className="mb-8 flex items-start justify-between">
              <div>
                <h2 className="font-display text-2xl font-semibold text-[var(--color-charcoal)]">
                  {showArchived
                    ? 'Archived Tasks'
                    : selectedCategory === 'ALL'
                    ? 'All Tasks'
                    : selectedCategory === 'WORK'
                    ? 'Work Tasks'
                    : 'Personal Tasks'}
                </h2>
                <p className="text-[var(--color-stone)] mt-1">
                  {showArchived
                    ? `${archivedTasks.length} archived`
                    : tasks.length === 0
                    ? 'No tasks yet'
                    : `${tasks.filter(t => !t.completed).length} active, ${completedCount} completed`}
                </p>
              </div>

              <div className="flex items-center gap-2">
                {!showArchived && completedCount > 0 && (
                  <button
                    onClick={archiveCompleted}
                    className="btn-secondary text-sm !py-2 !px-3"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                    </svg>
                    Archive completed
                  </button>
                )}
                <button
                  onClick={() => setShowArchived(!showArchived)}
                  className={`btn-secondary text-sm !py-2 !px-3 ${showArchived ? '!bg-[var(--color-charcoal)] !text-white !border-[var(--color-charcoal)]' : ''}`}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m16.5 0V4.875c0-.621-.504-1.125-1.125-1.125H4.875c-.621 0-1.125.504-1.125 1.125V7.5m16.5 0h-16.5" />
                  </svg>
                  {showArchived ? 'Show active' : 'View archive'}
                </button>
              </div>
            </div>

            {/* Search Input */}
            <div className="mb-6">
              <div className="relative">
                <svg
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-stone)]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search tasks... (press / to focus)"
                  className="input-field w-full !pl-12 !pr-10"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[var(--color-stone)] hover:text-[var(--color-charcoal)] transition-colors"
                    title="Clear search"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
              {searchQuery && (
                <p className="text-sm text-[var(--color-stone)] mt-2">
                  {showArchived
                    ? `${filteredArchivedTasks.length} result${filteredArchivedTasks.length !== 1 ? 's' : ''} for "${searchQuery}"`
                    : `${filteredTasks.length} result${filteredTasks.length !== 1 ? 's' : ''} for "${searchQuery}"`}
                </p>
              )}
            </div>

            {error && (
              <div className="mb-6 p-4 rounded-xl bg-[var(--color-rose-light)] border border-[var(--color-rose)]/20 animate-fade-in">
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-[var(--color-rose)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                  </svg>
                  <p className="text-sm text-[var(--color-rose)] font-medium">{error}</p>
                </div>
              </div>
            )}

            {showArchived ? (
              <TaskList
                tasks={filteredArchivedTasks}
                loading={false}
                onToggleComplete={toggleTaskComplete}
                onEdit={handleEditTask}
                onDelete={handleDeleteTask}
                onUnarchive={unarchiveTask}
                onToggleSubtask={toggleSubtaskComplete}
                onCreateLink={createLink}
                onUpdateLink={updateLink}
                onDeleteLink={deleteLink}
                isArchived={true}
              />
            ) : (
              <TaskList
                tasks={filteredTasks}
                loading={loading}
                onToggleComplete={toggleTaskComplete}
                onEdit={handleEditTask}
                onDelete={handleDeleteTask}
                onArchive={archiveTask}
                onToggleSubtask={toggleSubtaskComplete}
                onCreateLink={createLink}
                onUpdateLink={updateLink}
                onDeleteLink={deleteLink}
              />
            )}
          </div>}
        </main>
      </div>

      {showTaskForm && (
        <TaskForm
          task={editingTask}
          defaultCategory={selectedCategory !== 'ALL' ? selectedCategory : undefined}
          onSubmit={handleSubmitTask}
          onClose={handleCloseForm}
        />
      )}

      {/* Undo Delete Toast */}
      {pendingDelete && (
        <Toast
          message={`"${pendingDelete.task.title}" deleted`}
          action={{
            label: 'Undo',
            onClick: undoDelete
          }}
          onClose={() => {}}
        />
      )}
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <SettingsProvider>
        <TaskProvider>
          <AppContent />
        </TaskProvider>
      </SettingsProvider>
    </ThemeProvider>
  );
}

export default App;
