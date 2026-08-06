import React from 'react';
import { AlertCircle, AlertTriangle, CheckCircle2, Info as InfoIcon, X } from 'lucide-react';
import { AlertProps } from './Alert.types';
import { cn } from '../../../utils/cn';
import { IconButton } from '../IconButton';

export const Alert: React.FC<AlertProps> = ({
  variant = 'info',
  title,
  children,
  onClose,
  icon,
  className,
}) => {
  const variantClasses = {
    info: 'bg-info-50 text-info-700 border-info-100',
    success: 'bg-success-50 text-success-700 border-success-100',
    warning: 'bg-warning-50 text-warning-700 border-warning-100',
    error: 'bg-error-50 text-error-700 border-error-100',
  };

  const defaultIcons = {
    info: <InfoIcon className="w-5 h-5 text-info-500" />,
    success: <CheckCircle2 className="w-5 h-5 text-success-500" />,
    warning: <AlertTriangle className="w-5 h-5 text-warning-500" />,
    error: <AlertCircle className="w-5 h-5 text-error-500" />,
  };

  return (
    <div
      role="alert"
      className={cn(
        'relative flex items-start gap-3.5 p-4 rounded-md border text-body-sm transition-all duration-200',
        variantClasses[variant],
        className
      )}
    >
      <div className="flex-shrink-0 mt-0.5">{icon || defaultIcons[variant]}</div>
      <div className="flex-1 space-y-1">
        {title && <h5 className="font-semibold text-body-base leading-tight">{title}</h5>}
        <div className="leading-relaxed">{children}</div>
      </div>
      {onClose && (
        <IconButton
          variant="ghost"
          size="sm"
          aria-label="Fermer l'alerte"
          onClick={onClose}
          icon={<X className="w-4 h-4" />}
          className="flex-shrink-0 -mr-1 -mt-1"
        />
      )}
    </div>
  );
};
