import React from 'react';
import { Task, CreateLinkInput, UpdateLinkInput } from '../../types/task.types';
import TaskItem from './TaskItem';

interface TaskListProps {
  tasks: Task[];
  loading: boolean;
  onToggleComplete: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onArchive?: (id: string) => void;
  onUnarchive?: (id: string) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
  onCreateLink: (taskId: string, data: CreateLinkInput) => void;
  onUpdateLink: (taskId: string, linkId: string, data: UpdateLinkInput) => void;
  onDeleteLink: (taskId: string, linkId: string) => void;
  isArchived?: boolean;
}

export default function TaskList({
  tasks,
  loading,
  onToggleComplete,
  onEdit,
  onDelete,
  onArchive,
  onUnarchive,
  onToggleSubtask,
  onCreateLink,
  onUpdateLink,
  onDeleteLink,
  isArchived = false
}: TaskListProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-[var(--color-ivory)] rounded-xl p-5" style={{ boxShadow: 'var(--shadow-sm)' }}>
            <div className="flex items-start gap-4">
              <div className="w-5 h-5 rounded-md skeleton" />
              <div className="flex-1 space-y-3">
                <div className="h-5 w-2/3 rounded skeleton" />
                <div className="h-4 w-1/2 rounded skeleton" />
                <div className="flex gap-2">
                  <div className="h-6 w-16 rounded skeleton" />
                  <div className="h-6 w-20 rounded skeleton" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in">
        <div className="w-20 h-20 rounded-2xl bg-[var(--color-cream-dark)] flex items-center justify-center mb-6">
          {isArchived ? (
            <svg className="w-10 h-10 text-[var(--color-stone)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m16.5 0V4.875c0-.621-.504-1.125-1.125-1.125H4.875c-.621 0-1.125.504-1.125 1.125V7.5m16.5 0h-16.5" />
            </svg>
          ) : (
            <svg className="w-10 h-10 text-[var(--color-stone)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          )}
        </div>
        <h3 className="font-display text-xl font-semibold text-[var(--color-charcoal)] mb-2">
          {isArchived ? 'No archived tasks' : 'Your plate is empty'}
        </h3>
        <p className="text-[var(--color-stone)] max-w-sm leading-relaxed">
          {isArchived
            ? 'Completed tasks you archive will appear here.'
            : 'Ready to get organized? Add your first task and start making progress on what matters.'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {tasks.map((task, index) => (
        <div
          key={task.id}
          className="animate-fade-in opacity-0"
          style={{ animationDelay: `${index * 0.05}s` }}
        >
          <TaskItem
            task={task}
            onToggleComplete={onToggleComplete}
            onEdit={onEdit}
            onDelete={onDelete}
            onArchive={onArchive}
            onUnarchive={onUnarchive}
            onToggleSubtask={onToggleSubtask}
            onCreateLink={onCreateLink}
            onUpdateLink={onUpdateLink}
            onDeleteLink={onDeleteLink}
            isArchived={isArchived}
          />
        </div>
      ))}
    </div>
  );
}
