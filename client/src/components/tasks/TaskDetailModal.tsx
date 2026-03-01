import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Task } from '../../types/task.types';
import PriorityBadge from './PriorityBadge';

interface TaskDetailModalProps {
  task: Task;
  onClose: () => void;
}

export default function TaskDetailModal({ task, onClose }: TaskDetailModalProps) {
  const formatDate = (date: string | null) => {
    if (!date) return null;
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const completedSubtasks = task.subtasks.filter(st => st.completed).length;
  const totalSubtasks = task.subtasks.length;
  const [copiedLinkId, setCopiedLinkId] = useState<string | null>(null);

  const copyLinkToClipboard = async (linkId: string, url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedLinkId(linkId);
      setTimeout(() => setCopiedLinkId(null), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-[var(--color-ivory)] rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden animate-scale-in"
        style={{ boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-[var(--color-cream-dark)]">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h2 className={`font-display text-xl font-semibold text-[var(--color-charcoal)] leading-snug ${task.completed ? 'line-through opacity-60' : ''}`}>
                {task.title}
              </h2>
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
                {task.completed && (
                  <span className="category-pill !bg-[var(--color-sage-light)] !text-[var(--color-sage-dark)]">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    Completed
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-[var(--color-stone)] hover:text-[var(--color-charcoal)] hover:bg-[var(--color-cream)] transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(85vh-180px)]">
          {/* Description */}
          {task.description && (
            <div className="mb-6">
              <h3 className="text-xs font-display font-semibold text-[var(--color-stone)] uppercase tracking-wide mb-2">
                Description
              </h3>
              <p className="text-[var(--color-charcoal-light)] leading-relaxed whitespace-pre-wrap">
                {task.description}
              </p>
            </div>
          )}

          {/* Dates */}
          <div className="mb-6 grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-xs font-display font-semibold text-[var(--color-stone)] uppercase tracking-wide mb-1">
                Created
              </h3>
              <p className="text-sm text-[var(--color-charcoal-light)]">
                {formatDate(task.createdAt)}
              </p>
            </div>
            {task.dueDate && (
              <div>
                <h3 className="text-xs font-display font-semibold text-[var(--color-stone)] uppercase tracking-wide mb-1">
                  Due Date
                </h3>
                <p className={`text-sm ${new Date(task.dueDate) < new Date() && !task.completed ? 'text-[var(--color-rose)]' : 'text-[var(--color-charcoal-light)]'}`}>
                  {formatDate(task.dueDate)}
                </p>
              </div>
            )}
          </div>

          {/* Subtasks */}
          {totalSubtasks > 0 && (
            <div className="mb-6">
              <h3 className="text-xs font-display font-semibold text-[var(--color-stone)] uppercase tracking-wide mb-3">
                Subtasks ({completedSubtasks}/{totalSubtasks})
              </h3>
              <div className="space-y-2">
                {task.subtasks.map((subtask) => (
                  <div key={subtask.id} className="flex items-center gap-2.5">
                    <div className={`w-4 h-4 rounded-full border-[1.5px] flex items-center justify-center ${
                      subtask.completed
                        ? 'bg-[var(--color-stone)] border-[var(--color-stone)]'
                        : 'border-[var(--color-stone)]/30'
                    }`}>
                      {subtask.completed && (
                        <svg className="w-2 h-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <span className={`text-sm ${subtask.completed ? 'line-through text-[var(--color-stone)]' : 'text-[var(--color-charcoal-light)]'}`}>
                      {subtask.title}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Links */}
          {task.links.length > 0 && (
            <div className="mb-6">
              <h3 className="text-xs font-display font-semibold text-[var(--color-stone)] uppercase tracking-wide mb-3">
                Links
              </h3>
              <div className="space-y-2">
                {task.links.map((link) => (
                  <div key={link.id} className="flex items-center gap-2 group/link">
                    <svg className="w-4 h-4 text-[var(--color-stone)] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
                    </svg>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-[var(--color-terracotta)] hover:text-[var(--color-terracotta-dark)] link-hover"
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
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {task.notes && (
            <div>
              <h3 className="text-xs font-display font-semibold text-[var(--color-stone)] uppercase tracking-wide mb-2">
                Notes
              </h3>
              <div className="p-4 bg-[var(--color-cream)] rounded-lg border border-[var(--color-cream-dark)]">
                <p className="text-sm text-[var(--color-charcoal-light)] whitespace-pre-wrap leading-relaxed">
                  {task.notes}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
