import React, { useEffect, useId } from 'react';
import { X } from 'lucide-react';
import { ModalProps } from './Modal.types';
import { cn } from '../../../utils/cn';
import { IconButton } from '../IconButton';

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  closeOnBackdropClick = true,
}) => {
  const titleId = useId();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-2xl',
    full: 'max-w-5xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-neutral-950/60 backdrop-blur-xs animate-fade-in"
        onClick={() => closeOnBackdropClick && onClose()}
        aria-hidden="true"
      />

      {/* Modal Viewport Box */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        className={cn(
          'relative w-full bg-white rounded-lg shadow-hafrose-modal border border-rose-powder/50 z-10 animate-scale-up overflow-hidden flex flex-col max-h-[90vh]',
          sizeClasses[size]
        )}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200/80 bg-cream-100/50">
          {title ? (
            <h3 id={titleId} className="font-serif text-h4 text-neutral-950 leading-tight">
              {title}
            </h3>
          ) : (
            <div />
          )}
          <IconButton
            variant="ghost"
            size="sm"
            aria-label="Fermer la fenêtre"
            onClick={onClose}
            icon={<X className="w-5 h-5 text-neutral-500" />}
          />
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto flex-1 text-body-base text-neutral-700 leading-relaxed">
          {children}
        </div>

        {/* Modal Footer */}
        {footer && (
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-neutral-200/80 bg-cream-100/30">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
