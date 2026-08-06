import {  forwardRef } from 'react';
import { Search, X } from 'lucide-react';
import { SearchInputProps } from './SearchInput.types';
import { Input } from '../Input';
import { IconButton } from '../IconButton';

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  (
    {
      value,
      onClear,
      clearLabel = 'Effacer la recherche',
      placeholder = 'Rechercher un produit, une collection...',
      ...props
    },
    ref
  ) => {
    const hasValue = Boolean(value && String(value).length > 0);

    return (
      <Input
        ref={ref}
        type="search"
        value={value}
        placeholder={placeholder}
        leftIcon={<Search className="w-4 h-4 text-neutral-400" />}
        rightIcon={
          hasValue && onClear ? (
            <IconButton
              variant="ghost"
              size="sm"
              aria-label={clearLabel}
              onClick={onClear}
              icon={<X className="w-4 h-4 text-neutral-400 hover:text-neutral-700" />}
            />
          ) : undefined
        }
        {...props}
      />
    );
  }
);

SearchInput.displayName = 'SearchInput';
