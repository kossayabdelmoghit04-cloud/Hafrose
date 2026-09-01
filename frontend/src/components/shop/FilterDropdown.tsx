import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../utils/cn';

export interface FilterDropdownProps {
  label: string;
  isActive?: boolean;
  children: React.ReactNode;
}

export const FilterDropdown: React.FC<FilterDropdownProps> = ({
  label,
  isActive,
  children,
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          'inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xs border text-body-sm font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-burgundy-500',
          isActive
            ? 'border-burgundy-500 bg-burgundy-50 text-burgundy-700 font-semibold'
            : 'border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300 hover:bg-neutral-50'
        )}
        aria-expanded={open}
      >
        <span>{label}</span>
        <ChevronDown
          className={cn(
            'w-3.5 h-3.5 transition-transform duration-200 text-neutral-400',
            open && 'rotate-180 text-burgundy-500'
          )}
        />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1.5 z-30 min-w-[220px] bg-white border border-neutral-200/90 rounded-sm shadow-hafrose-md p-3 space-y-2 animate-fade-in">
          {children}
        </div>
      )}
    </div>
  );
};
