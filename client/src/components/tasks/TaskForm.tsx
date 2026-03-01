import React, { useState, useEffect } from 'react';
import { Task, Category, Priority, CreateTaskInput, CreateLinkInput } from '../../types/task.types';

interface PendingLink {
  id: string;
  url: string;
  title: string;
}

interface TaskFormProps {
  task?: Task | null;
  defaultCategory?: Category;
  onSubmit: (data: CreateTaskInput, pendingLinks?: CreateLinkInput[]) => Promise<void>;
  onClose: () => void;
}

export default function TaskForm({ task, defaultCategory, onSubmit, onClose }: TaskFormProps) {
  const [formData, setFormData] = useState<CreateTaskInput>({
    title: '',
    description: '',
    notes: '',
    category: (defaultCategory || 'PERSONAL') as Category,
    priority: 'MEDIUM' as Priority,
    dueDate: undefined,
  });

  const [submitting, setSubmitting] = useState(false);
  const [pendingLinks, setPendingLinks] = useState<PendingLink[]>([]);
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [newLinkTitle, setNewLinkTitle] = useState('');

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description || '',
        notes: task.notes || '',
        category: task.category,
        priority: task.priority,
        dueDate: task.dueDate || undefined,
      });
      // Don't load existing links for editing - those are managed in TaskItem
    }
  }, [task]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const linksToCreate = pendingLinks.map(({ url, title }) => ({
        url,
        title: title || undefined,
      }));
      await onSubmit(formData, linksToCreate.length > 0 ? linksToCreate : undefined);
      onClose();
    } catch (error) {
      console.error('Failed to save task:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (field: keyof CreateTaskInput, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddLink = () => {
    if (newLinkUrl.trim()) {
      setPendingLinks(prev => [
        ...prev,
        {
          id: crypto.randomUUID(),
          url: newLinkUrl.trim(),
          title: newLinkTitle.trim(),
        },
      ]);
      setNewLinkUrl('');
      setNewLinkTitle('');
      setShowLinkInput(false);
    }
  };

  const handleRemoveLink = (id: string) => {
    setPendingLinks(prev => prev.filter(link => link.id !== id));
  };

  const handleLinkKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddLink();
    } else if (e.key === 'Escape') {
      setShowLinkInput(false);
      setNewLinkUrl('');
      setNewLinkTitle('');
    }
  };

  return (
    <div className="fixed inset-0 modal-overlay flex items-center justify-center p-4 z-50 animate-fade-in" style={{ animationDuration: '0.2s' }}>
      <div
        className="modal-content max-w-xl w-full max-h-[90vh] overflow-y-auto animate-scale-in"
        style={{ animationDuration: '0.3s' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 sm:p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="font-display text-2xl font-semibold text-[var(--color-charcoal)]">
                {task ? 'Edit Task' : 'New Task'}
              </h2>
              <p className="text-sm text-[var(--color-stone)] mt-1">
                {task ? 'Update the details below' : 'Fill in the details to create a new task'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-[var(--color-stone)] hover:text-[var(--color-charcoal)] hover:bg-[var(--color-cream-dark)] transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block font-display text-sm font-medium text-[var(--color-charcoal)] mb-2">
                Title <span className="text-[var(--color-terracotta)]">*</span>
              </label>
              <input
                type="text"
                id="title"
                required
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                className="input-field"
                placeholder="What needs to be done?"
                autoFocus
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block font-display text-sm font-medium text-[var(--color-charcoal)] mb-2">
                Description
              </label>
              <input
                type="text"
                id="description"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                className="input-field"
                placeholder="Brief description (optional)"
              />
            </div>

            {/* Category and Priority */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="category" className="block font-display text-sm font-medium text-[var(--color-charcoal)] mb-2">
                  Category
                </label>
                <div className="relative">
                  <select
                    id="category"
                    value={formData.category}
                    onChange={(e) => handleChange('category', e.target.value as Category)}
                    className="input-field appearance-none cursor-pointer pr-10"
                  >
                    <option value="PERSONAL">Personal</option>
                    <option value="WORK">Work</option>
                  </select>
                  <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-stone)] pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </div>
              </div>

              <div>
                <label htmlFor="priority" className="block font-display text-sm font-medium text-[var(--color-charcoal)] mb-2">
                  Priority
                </label>
                <div className="relative">
                  <select
                    id="priority"
                    value={formData.priority}
                    onChange={(e) => handleChange('priority', e.target.value as Priority)}
                    className="input-field appearance-none cursor-pointer pr-10"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                  <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-stone)] pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Due Date */}
            <div>
              <label htmlFor="dueDate" className="block font-display text-sm font-medium text-[var(--color-charcoal)] mb-2">
                Due Date
              </label>
              <input
                type="date"
                id="dueDate"
                value={formData.dueDate ? new Date(formData.dueDate).toISOString().split('T')[0] : ''}
                onChange={(e) => {
                  const value = e.target.value;
                  handleChange('dueDate', value ? new Date(value).toISOString() : undefined);
                }}
                className="input-field cursor-pointer"
              />
            </div>

            {/* Notes */}
            <div>
              <label htmlFor="notes" className="block font-display text-sm font-medium text-[var(--color-charcoal)] mb-2">
                Notes
              </label>
              <textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                rows={4}
                className="input-field resize-none"
                placeholder="Additional notes or details..."
              />
            </div>

            {/* Links */}
            {!task && (
              <div>
                <label className="block font-display text-sm font-medium text-[var(--color-charcoal)] mb-2">
                  Links
                </label>

                {/* Pending links list */}
                {pendingLinks.length > 0 && (
                  <div className="space-y-2 mb-3">
                    {pendingLinks.map((link) => (
                      <div
                        key={link.id}
                        className="flex items-center gap-2 p-2 bg-[var(--color-cream)] rounded-lg group"
                      >
                        <svg className="w-4 h-4 text-[var(--color-stone)] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
                        </svg>
                        <span className="text-sm text-[var(--color-terracotta)] truncate flex-1">
                          {link.title || link.url}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveLink(link.id)}
                          className="text-[var(--color-stone)] hover:text-[var(--color-rose)] transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add link form */}
                {showLinkInput ? (
                  <div className="space-y-2 p-3 bg-[var(--color-cream)] rounded-lg">
                    <input
                      type="url"
                      value={newLinkUrl}
                      onChange={(e) => setNewLinkUrl(e.target.value)}
                      onKeyDown={handleLinkKeyDown}
                      placeholder="https://..."
                      className="input-field text-sm !py-2"
                      autoFocus
                    />
                    <input
                      type="text"
                      value={newLinkTitle}
                      onChange={(e) => setNewLinkTitle(e.target.value)}
                      onKeyDown={handleLinkKeyDown}
                      placeholder="Link title (optional)"
                      className="input-field text-sm !py-2"
                    />
                    <div className="flex gap-2 justify-end">
                      <button
                        type="button"
                        onClick={() => {
                          setShowLinkInput(false);
                          setNewLinkUrl('');
                          setNewLinkTitle('');
                        }}
                        className="px-3 py-1.5 text-sm font-display text-[var(--color-stone)] hover:text-[var(--color-charcoal)]"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleAddLink}
                        className="px-3 py-1.5 text-sm font-display font-medium text-[var(--color-terracotta)] hover:text-[var(--color-terracotta-dark)]"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowLinkInput(true)}
                    className="text-sm font-display text-[var(--color-stone)] hover:text-[var(--color-terracotta)] flex items-center gap-1.5 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    Add link
                  </button>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-[var(--color-cream-dark)]">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="btn-secondary disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="btn-primary disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>{task ? 'Update Task' : 'Create Task'}</span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
