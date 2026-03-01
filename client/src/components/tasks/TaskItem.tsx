import React, { useState } from 'react';
import { Task, CreateLinkInput, UpdateLinkInput } from '../../types/task.types';
import PriorityBadge from './PriorityBadge';
import TaskDetailModal from './TaskDetailModal';

const DESCRIPTION_MAX_LENGTH = 150;
const NOTES_MAX_LENGTH = 200;

interface TaskItemProps {
  task: Task;
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

export default function TaskItem({ task, onToggleComplete, onEdit, onDelete, onArchive, onUnarchive, onToggleSubtask, onCreateLink, onUpdateLink, onDeleteLink, isArchived = false }: TaskItemProps) {
  const [showLinkForm, setShowLinkForm] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkTitle, setLinkTitle] = useState('');
  const [editingLinkId, setEditingLinkId] = useState<string | null>(null);
  const [editLinkUrl, setEditLinkUrl] = useState('');
  const [editLinkTitle, setEditLinkTitle] = useState('');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [copiedLinkId, setCopiedLinkId] = useState<string | null>(null);

  const formatDate = (date: string | null) => {
    if (!date) return null;
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getRelativeTime = (date: string) => {
    const now = new Date();
    const created = new Date(date);
    const diffMs = now.getTime() - created.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)}mo ago`;
    return `${Math.floor(diffDays / 365)}y ago`;
  };

  const isOld = () => {
    const created = new Date(task.createdAt);
    const diffDays = Math.floor((Date.now() - created.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays > 14; // Older than 2 weeks
  };

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && !task.completed;
  const completedSubtasks = task.subtasks.filter(st => st.completed).length;
  const totalSubtasks = task.subtasks.length;

  const handleAddLink = () => {
    if (linkUrl.trim()) {
      onCreateLink(task.id, { url: linkUrl.trim(), title: linkTitle.trim() || undefined });
      setLinkUrl('');
      setLinkTitle('');
      setShowLinkForm(false);
    }
  };

  const handleLinkKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddLink();
    } else if (e.key === 'Escape') {
      setShowLinkForm(false);
      setLinkUrl('');
      setLinkTitle('');
    }
  };

  const startEditLink = (link: { id: string; url: string; title: string | null }) => {
    setEditingLinkId(link.id);
    setEditLinkUrl(link.url);
    setEditLinkTitle(link.title || '');
  };

  const handleUpdateLink = () => {
    if (editingLinkId && editLinkUrl.trim()) {
      onUpdateLink(task.id, editingLinkId, {
        url: editLinkUrl.trim(),
        title: editLinkTitle.trim() || null,
      });
      setEditingLinkId(null);
      setEditLinkUrl('');
      setEditLinkTitle('');
    }
  };

  const handleEditLinkKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleUpdateLink();
    } else if (e.key === 'Escape') {
      setEditingLinkId(null);
      setEditLinkUrl('');
      setEditLinkTitle('');
    }
  };

  const cancelEditLink = () => {
    setEditingLinkId(null);
    setEditLinkUrl('');
    setEditLinkTitle('');
  };

  const copyLinkToClipboard = async (linkId: string, url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedLinkId(linkId);
      setTimeout(() => setCopiedLinkId(null), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength).trim() + '...';
  };

  const descriptionExceedsLimit = task.description && task.description.length > DESCRIPTION_MAX_LENGTH;
  const notesExceedsLimit = task.notes && task.notes.length > NOTES_MAX_LENGTH;
  const hasOverflow = descriptionExceedsLimit || notesExceedsLimit;

  return (
    <div
      className={`task-card group bg-[var(--color-ivory)] rounded-xl p-5 transition-all duration-300 ${
        task.completed ? 'opacity-50' : ''
      } ${isOverdue ? 'ring-1 ring-[var(--color-rose)]/30' : ''}`}
      style={{ boxShadow: 'var(--shadow-sm)' }}
    >
      <div className="flex items-start gap-4">
        {/* Completion Circle */}
        <button
          onClick={() => {
            if (isArchived && onUnarchive) {
              if (window.confirm('Restore this task to active tasks?')) {
                onUnarchive(task.id);
              }
            } else {
              onToggleComplete(task.id);
            }
          }}
          className="mt-0.5 flex-shrink-0 group/circle"
          title={isArchived ? 'Restore to active' : task.completed ? 'Mark incomplete' : 'Mark complete'}
        >
          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
            isArchived
              ? 'bg-[var(--color-stone)]/20 border-[var(--color-stone)]/40 group-hover/circle:border-[var(--color-sage)] group-hover/circle:bg-[var(--color-sage)]/10'
              : task.completed
              ? 'bg-[var(--color-sage)] border-[var(--color-sage)]'
              : 'border-[var(--color-stone)]/30 group-hover/circle:border-[var(--color-terracotta)] group-hover/circle:bg-[var(--color-terracotta)]/5'
          }`}>
            {isArchived ? (
              <svg className="w-3 h-3 text-[var(--color-stone)] group-hover/circle:text-[var(--color-sage)] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
              </svg>
            ) : task.completed ? (
              <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-3 h-3 text-[var(--color-terracotta)] opacity-0 group-hover/circle:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>
        </button>

        {/* Task Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <h3
                onClick={() => setShowDetailModal(true)}
                className={`font-display font-medium text-[var(--color-charcoal)] leading-snug cursor-pointer hover:text-[var(--color-terracotta)] transition-colors ${task.completed ? 'line-through opacity-60' : ''}`}
              >
                {task.title}
              </h3>
              {task.description && (
                <div className="mt-1.5">
                  <p className="text-sm text-[var(--color-stone)] leading-relaxed whitespace-pre-wrap">
                    {descriptionExceedsLimit ? truncateText(task.description, DESCRIPTION_MAX_LENGTH) : task.description}
                  </p>
                  {descriptionExceedsLimit && (
                    <button
                      onClick={() => setShowDetailModal(true)}
                      className="text-sm font-display text-[var(--color-terracotta)] hover:text-[var(--color-terracotta-dark)] mt-1 transition-colors"
                    >
                      Read more
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {!isArchived && (
                <button
                  onClick={() => onEdit(task)}
                  className="p-2 rounded-lg text-[var(--color-stone)] hover:text-[var(--color-terracotta)] hover:bg-[var(--color-terracotta-light)]/50 transition-colors"
                  title="Edit task"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                  </svg>
                </button>
              )}
              {!isArchived && task.completed && onArchive && (
                <button
                  onClick={() => onArchive(task.id)}
                  className="p-2 rounded-lg text-[var(--color-stone)] hover:text-[var(--color-amber)] hover:bg-[var(--color-amber-light)]/50 transition-colors"
                  title="Archive task"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                  </svg>
                </button>
              )}
              <button
                onClick={() => onDelete(task.id)}
                className="p-2 rounded-lg text-[var(--color-stone)] hover:text-[var(--color-rose)] hover:bg-[var(--color-rose-light)]/50 transition-colors"
                title="Delete task"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                </svg>
              </button>
            </div>
          </div>

          {/* Metadata Row */}
          <div className="flex items-center gap-2.5 mt-3 flex-wrap">
            <PriorityBadge priority={task.priority} />

            <span className="category-pill">
              {task.category === 'WORK' ? (
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" />
                </svg>
              ) : (
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                </svg>
              )}
              {task.category}
            </span>

            {/* Created date - highlighted if old */}
            <span className={`category-pill ${isOld() && !task.completed ? '!bg-[var(--color-amber-light)] !text-[#996B1F]' : ''}`} title={`Created ${formatDate(task.createdAt)}`}>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {getRelativeTime(task.createdAt)}
            </span>

            {totalSubtasks > 0 && (
              <span className="category-pill">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                </svg>
                {completedSubtasks}/{totalSubtasks}
              </span>
            )}

            {/* Due date - de-emphasized */}
            {task.dueDate && (
              <span className={`text-xs ${isOverdue ? 'text-[var(--color-rose)]' : 'text-[var(--color-stone)]'}`}>
                {isOverdue ? 'Overdue: ' : 'Due: '}{formatDate(task.dueDate)}
              </span>
            )}
          </div>

          {/* Subtasks */}
          {task.subtasks.length > 0 && (
            <div className="mt-4 space-y-2 pl-1">
              {task.subtasks.map((subtask) => (
                <div key={subtask.id} className="flex items-center gap-2.5 group/subtask">
                  <button
                    onClick={() => onToggleSubtask(task.id, subtask.id)}
                    className="flex-shrink-0"
                  >
                    <div className={`w-4 h-4 rounded-full border-[1.5px] flex items-center justify-center transition-all duration-200 ${
                      subtask.completed
                        ? 'bg-[var(--color-stone)] border-[var(--color-stone)]'
                        : 'border-[var(--color-stone)]/30 group-hover/subtask:border-[var(--color-stone)]'
                    }`}>
                      {subtask.completed && (
                        <svg className="w-2 h-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  </button>
                  <span className={`text-sm ${subtask.completed ? 'line-through text-[var(--color-stone)]' : 'text-[var(--color-charcoal-light)]'}`}>
                    {subtask.title}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Links */}
          {(task.links.length > 0 || showLinkForm) && (
            <div className="mt-4 space-y-2">
              {task.links.map((link) => (
                <div key={link.id}>
                  {editingLinkId === link.id ? (
                    <div className="flex flex-col gap-2 p-3 bg-[var(--color-cream)] rounded-lg animate-scale-in">
                      <input
                        type="url"
                        value={editLinkUrl}
                        onChange={(e) => setEditLinkUrl(e.target.value)}
                        onKeyDown={handleEditLinkKeyDown}
                        placeholder="https://..."
                        className="input-field text-sm !py-2"
                        autoFocus
                      />
                      <input
                        type="text"
                        value={editLinkTitle}
                        onChange={(e) => setEditLinkTitle(e.target.value)}
                        onKeyDown={handleEditLinkKeyDown}
                        placeholder="Link title (optional)"
                        className="input-field text-sm !py-2"
                      />
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={cancelEditLink}
                          className="px-3 py-1.5 text-sm font-display text-[var(--color-stone)] hover:text-[var(--color-charcoal)]"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleUpdateLink}
                          className="px-3 py-1.5 text-sm font-display font-medium text-[var(--color-terracotta)] hover:text-[var(--color-terracotta-dark)]"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 group/link">
                      <svg className="w-4 h-4 text-[var(--color-stone)] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
                      </svg>
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-[var(--color-terracotta)] hover:text-[var(--color-terracotta-dark)] link-hover truncate"
                      >
                        {link.title || link.url}
                      </a>
                      <button
                        onClick={() => copyLinkToClipboard(link.id, link.url)}
                        className={`transition-colors ${
                          copiedLinkId === link.id
                            ? 'text-[var(--color-sage)]'
                            : 'text-[var(--color-stone)] hover:text-[var(--color-terracotta)] opacity-0 group-hover/link:opacity-100'
                        }`}
                        title={copiedLinkId === link.id ? 'Copied!' : 'Copy link'}
                      >
                        {copiedLinkId === link.id ? (
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
                          </svg>
                        )}
                      </button>
                      <button
                        onClick={() => startEditLink(link)}
                        className="text-[var(--color-stone)] hover:text-[var(--color-terracotta)] transition-colors opacity-0 group-hover/link:opacity-100"
                        title="Edit link"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => onDeleteLink(task.id, link.id)}
                        className="text-[var(--color-stone)] hover:text-[var(--color-rose)] transition-colors opacity-0 group-hover/link:opacity-100"
                        title="Delete link"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              ))}

              {showLinkForm && (
                <div className="flex flex-col gap-2 p-3 bg-[var(--color-cream)] rounded-lg animate-scale-in">
                  <input
                    type="url"
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    onKeyDown={handleLinkKeyDown}
                    placeholder="https://..."
                    className="input-field text-sm !py-2"
                    autoFocus
                  />
                  <input
                    type="text"
                    value={linkTitle}
                    onChange={(e) => setLinkTitle(e.target.value)}
                    onKeyDown={handleLinkKeyDown}
                    placeholder="Link title (optional)"
                    className="input-field text-sm !py-2"
                  />
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => {
                        setShowLinkForm(false);
                        setLinkUrl('');
                        setLinkTitle('');
                      }}
                      className="px-3 py-1.5 text-sm font-display text-[var(--color-stone)] hover:text-[var(--color-charcoal)]"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleAddLink}
                      className="px-3 py-1.5 text-sm font-display font-medium text-[var(--color-terracotta)] hover:text-[var(--color-terracotta-dark)]"
                    >
                      Add Link
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Add Link Button */}
          {!showLinkForm && (
            <button
              onClick={() => setShowLinkForm(true)}
              className="mt-3 text-sm font-display text-[var(--color-stone)] hover:text-[var(--color-terracotta)] flex items-center gap-1.5 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
              </svg>
              Add link
            </button>
          )}

          {/* Notes */}
          {task.notes && (
            <div className="mt-4 p-3 bg-[var(--color-cream)] rounded-lg border border-[var(--color-cream-dark)]">
              <div className="flex items-start gap-2">
                <svg className="w-4 h-4 text-[var(--color-stone)] mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
                <div className="flex-1">
                  <p className="text-sm text-[var(--color-charcoal-light)] whitespace-pre-wrap leading-relaxed">
                    {notesExceedsLimit ? truncateText(task.notes, NOTES_MAX_LENGTH) : task.notes}
                  </p>
                  {notesExceedsLimit && (
                    <button
                      onClick={() => setShowDetailModal(true)}
                      className="text-sm font-display text-[var(--color-terracotta)] hover:text-[var(--color-terracotta-dark)] mt-1 transition-colors"
                    >
                      Read more
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {showDetailModal && (
        <TaskDetailModal task={task} onClose={() => setShowDetailModal(false)} />
      )}
    </div>
  );
}
