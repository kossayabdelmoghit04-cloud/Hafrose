import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { BreadcrumbProps } from './Breadcrumb.types';
import { cn } from '../../../utils/cn';

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ items, onNavigate, className }) => {
  return (
    <nav aria-label="Fil d'Ariane" className={cn('flex items-center', className)}>
      <ol className="flex items-center flex-wrap gap-1" itemScope itemType="https://schema.org/BreadcrumbList">
        {items.map((item, idx) => {
          const isLast = idx === items.length - 1;
          return (
            <li
              key={idx}
              className="flex items-center gap-1"
              itemProp="itemListElement"
              itemScope
              itemType="https://schema.org/ListItem"
            >
              {idx === 0 && (
                <Home className="w-3.5 h-3.5 text-neutral-400 flex-shrink-0" aria-hidden="true" />
              )}

              {item.href && !isLast ? (
                <button
                  type="button"
                  onClick={() => onNavigate?.(item.href!)}
                  className="text-caption font-medium tracking-wider text-neutral-500 hover:text-burgundy-500 transition-colors duration-200 focus:outline-none focus-visible:underline"
                  itemProp="item"
                >
                  <span itemProp="name">{item.label}</span>
                </button>
              ) : (
                <span
                  className={cn(
                    'text-caption font-medium tracking-wider',
                    isLast ? 'text-neutral-900' : 'text-neutral-500'
                  )}
                  aria-current={isLast ? 'page' : undefined}
                  itemProp="name"
                >
                  {item.label}
                </span>
              )}

              {!isLast && (
                <ChevronRight className="w-3 h-3 text-neutral-300 flex-shrink-0" aria-hidden="true" />
              )}

              <meta itemProp="position" content={String(idx + 1)} />
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
