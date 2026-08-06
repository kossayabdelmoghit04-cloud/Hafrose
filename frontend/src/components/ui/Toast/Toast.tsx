import React, { useEffect } from 'react';
import { CheckCircle, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import { ToastProps } from './Toast.types';
import { cn } from '../../../utils/cn';
import { IconButton } from '../IconButton';

export const Toast: React.FC<ToastProps> = ({
  id,
  variant = 'info',
  title,
  message,
  onDismiss,
  durationMs = 4000,
}) => {
  useEffect(() => {
    if (durationMs <= 0) return;
    const timer = setTimeout(() => onDismiss(id), durationMs);
    return () => clearTimeout(timer);
  }, [id, durationMs, onDismiss]);

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-success-500" />,
    error: <AlertCircle className="w-5 h-5 text-error-500" />,
    info: <Info className="w-5 h-5 text-info-500" />,
    warning: <AlertTriangle className="w-5 h-5 text-warning-500" />,
  };

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        'flex items-start gap-3 p-4 bg-white border border-neutral-200/80 rounded-md shadow-hafrose-lg max-w-sm w-full animate-slide-up pointer-events-auto'
      )}
    >
      <div className="flex-shrink-0 mt-0.5">{icons[variant]}</div>
      <div className="flex-1 space-y-0.5">
        {title && <h5 className="font-semibold text-body-sm text-neutral-900 leading-tight">{title}</h5>}
        <div className="text-body-sm text-neutral-600">{message}</div>
      </div>
      <IconButton
        variant="ghost"
        size="sm"
        aria-label="Fermer la notification"
        onClick={() => onDismiss(id)}
        icon={<X className="w-4 h-4 text-neutral-400 hover:text-neutral-700" />}
        className="-mr-1 -mt-1"
      />
    </div>
  );
};
