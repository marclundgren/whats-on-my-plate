import React, { useEffect, useState } from 'react';

interface ToastProps {
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  duration?: number;
  onClose: () => void;
}

export default function Toast({ message, action, duration = 5000, onClose }: ToastProps) {
  const [progress, setProgress] = useState(100);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);

      if (remaining <= 0) {
        clearInterval(interval);
        handleClose();
      }
    }, 50);

    return () => clearInterval(interval);
  }, [duration]);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(onClose, 200);
  };

  const handleAction = () => {
    action?.onClick();
    handleClose();
  };

  return (
    <div
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-200 ${
        isLeaving ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'
      }`}
    >
      <div
        className="bg-[var(--color-charcoal)] text-white px-5 py-3 rounded-xl shadow-lg flex items-center gap-4 min-w-[300px]"
        style={{ boxShadow: '0 8px 32px rgba(44, 40, 37, 0.3)' }}
      >
        <span className="text-sm font-display">{message}</span>

        {action && (
          <button
            onClick={handleAction}
            className="text-sm font-display font-semibold text-[var(--color-terracotta-light)] hover:text-white transition-colors ml-auto"
          >
            {action.label}
          </button>
        )}

        <button
          onClick={handleClose}
          className="text-white/60 hover:text-white transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Progress bar */}
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/10 rounded-b-xl overflow-hidden">
          <div
            className="h-full bg-[var(--color-terracotta)] transition-all duration-100 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
