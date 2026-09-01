import React from 'react';
import { X } from 'lucide-react';
import { Container } from '../ui/Container';

export interface ActiveFilter {
  key: string;
  label: string;
  onRemove: () => void;
}

interface ShopActiveFiltersProps {
  filters: ActiveFilter[];
  onReset: () => void;
}

export const ShopActiveFilters: React.FC<ShopActiveFiltersProps> = ({
  filters,
  onReset,
}) => {
  if (filters.length === 0) return null;

  return (
    <div className="bg-neutral-50/90 border-b border-neutral-200/60 py-2.5">
      <Container>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-caption font-semibold uppercase tracking-wider text-neutral-500 mr-1">
            Filtres actifs :
          </span>
          {filters.map((f) => (
            <span
              key={f.key}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xs bg-white border border-neutral-200 text-neutral-800 text-caption font-medium shadow-hafrose-xs"
            >
              {f.label}
              <button
                type="button"
                onClick={f.onRemove}
                aria-label={`Retirer le filtre : ${f.label}`}
                className="text-neutral-400 hover:text-burgundy-600 transition-colors ml-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
          <button
            type="button"
            onClick={onReset}
            className="ml-auto text-caption font-medium text-burgundy-600 hover:text-burgundy-700 underline underline-offset-2 transition-colors py-1 px-2"
          >
            Tout effacer
          </button>
        </div>
      </Container>
    </div>
  );
};
