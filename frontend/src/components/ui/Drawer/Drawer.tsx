import React, { useEffect, useId } from 'react';
import { X } from 'lucide-react';
import { DrawerProps } from './Drawer.types';
import { cn } from '../../../utils/cn';
import { IconButton } from '../IconButton';

export const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  position = 'right',
  size = 'md',
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

  const sizeClassesRightLeft = {
    sm: 'max-w-xs',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
  };

  const positionClasses = {
    right: 'right-0 top-0 bottom-0 animate-slide-left border-l',
    left: 'left-0 top-0 bottom-0 animate-slide-right border-r',
    bottom: 'bottom-0 left-0 right-0 max-h-[85vh] animate-slide-up border-t rounded-t-2xl',
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-neutral-950/50 backdrop-blur-xs animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Container */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        className={cn(
          'fixed z-10 w-full bg-white shadow-hafrose-xl border-neutral-200 flex flex-col',
          positionClasses[position],
          position !== 'bottom' && sizeClassesRightLeft[size]
        )}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 bg-cream-100/60">
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
            aria-label="Fermer le tiroir"
            onClick={onClose}
            icon={<X className="w-5 h-5 text-neutral-500" />}
          />
        </div>

        {/* Drawer Body */}
        <div className="p-6 overflow-y-auto flex-1">{children}</div>

        {/* Drawer Footer */}
        {footer && (
          <div className="p-6 border-t border-neutral-200 bg-cream-100/40">{footer}</div>
        )}
      </aside>
    </div>
  );
};
