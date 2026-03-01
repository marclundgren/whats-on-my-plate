import React from 'react';
import { Priority } from '../../types/task.types';

interface PriorityBadgeProps {
  priority: Priority;
}

export default function PriorityBadge({ priority }: PriorityBadgeProps) {
  const config = {
    LOW: {
      className: 'badge-low',
      label: 'Low',
      dot: 'bg-[var(--color-stone)]'
    },
    MEDIUM: {
      className: 'badge-medium',
      label: 'Medium',
      dot: 'bg-[var(--color-sage)]'
    },
    HIGH: {
      className: 'badge-high',
      label: 'High',
      dot: 'bg-[var(--color-amber)]'
    },
    URGENT: {
      className: 'badge-urgent',
      label: 'Urgent',
      dot: 'bg-[var(--color-rose)]'
    },
  };

  const { className, label, dot } = config[priority];

  return (
    <span className={`badge ${className}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
      {label}
    </span>
  );
}
