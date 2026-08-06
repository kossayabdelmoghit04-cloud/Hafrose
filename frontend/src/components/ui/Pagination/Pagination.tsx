import React, { useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { PaginationProps } from './Pagination.types';
import { IconButton } from '../IconButton';
import { cn } from '../../../utils/cn';

function buildPageRange(current: number, total: number, siblings: number): (number | '...')[] {
  const delta = siblings * 2 + 3;
  if (total <= delta + 2) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const left = Math.max(current - siblings, 2);
  const right = Math.min(current + siblings, total - 1);
  const range: (number | '...')[] = [1];
  if (left > 2) range.push('...');
  for (let i = left; i <= right; i++) range.push(i);
  if (right < total - 1) range.push('...');
  range.push(total);
  return range;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  siblingCount = 1,
  className,
  previousLabel = 'Page précédente',
  nextLabel = 'Page suivante',
}) => {
  const pages = useMemo(
    () => buildPageRange(currentPage, totalPages, siblingCount),
    [currentPage, totalPages, siblingCount]
  );

  if (totalPages <= 1) return null;

  return (
    <nav aria-label="Pagination" className={cn('flex items-center justify-center gap-1', className)}>
      <IconButton
        variant="ghost"
        size="sm"
        aria-label={previousLabel}
        disabled={currentPage <= 1}
        onClick={() => onPageChange(currentPage - 1)}
        icon={<ChevronLeft className="w-4 h-4" />}
      />

      {pages.map((page, idx) =>
        page === '...' ? (
          <span key={`ellipsis-${idx}`} className="w-8 h-8 flex items-center justify-center text-body-sm text-neutral-400">
            ···
          </span>
        ) : (
          <button
            key={page}
            type="button"
            aria-label={`Page ${page}`}
            aria-current={page === currentPage ? 'page' : undefined}
            onClick={() => onPageChange(page as number)}
            className={cn(
              'w-8 h-8 flex items-center justify-center rounded-xs text-body-sm font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-burgundy-500',
              page === currentPage
                ? 'bg-burgundy-500 text-white shadow-hafrose-sm'
                : 'text-neutral-600 hover:bg-rose-blush hover:text-burgundy-500'
            )}
          >
            {page}
          </button>
        )
      )}

      <IconButton
        variant="ghost"
        size="sm"
        aria-label={nextLabel}
        disabled={currentPage >= totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        icon={<ChevronRight className="w-4 h-4" />}
      />
    </nav>
  );
};
