import {  forwardRef } from 'react';
import { GridProps } from './Grid.types';
import { cn } from '../../../utils/cn';

const colsMap: Record<number, string> = {
  1: 'grid-cols-1', 2: 'grid-cols-2', 3: 'grid-cols-3',
  4: 'grid-cols-4', 5: 'grid-cols-5', 6: 'grid-cols-6', 12: 'grid-cols-12',
};
const smColsMap: Record<number, string> = {
  1: 'sm:grid-cols-1', 2: 'sm:grid-cols-2', 3: 'sm:grid-cols-3',
  4: 'sm:grid-cols-4', 5: 'sm:grid-cols-5', 6: 'sm:grid-cols-6', 12: 'sm:grid-cols-12',
};
const mdColsMap: Record<number, string> = {
  1: 'md:grid-cols-1', 2: 'md:grid-cols-2', 3: 'md:grid-cols-3',
  4: 'md:grid-cols-4', 5: 'md:grid-cols-5', 6: 'md:grid-cols-6', 12: 'md:grid-cols-12',
};
const lgColsMap: Record<number, string> = {
  1: 'lg:grid-cols-1', 2: 'lg:grid-cols-2', 3: 'lg:grid-cols-3',
  4: 'lg:grid-cols-4', 5: 'lg:grid-cols-5', 6: 'lg:grid-cols-6', 12: 'lg:grid-cols-12',
};
const gapMap = {
  none: 'gap-0', xs: 'gap-2', sm: 'gap-4', md: 'gap-6', lg: 'gap-8', xl: 'gap-12',
};

export const Grid = forwardRef<HTMLDivElement, GridProps>(
  ({ children, cols = 1, colsSm, colsMd, colsLg, gap = 'md', className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'grid',
        colsMap[cols],
        colsSm && smColsMap[colsSm],
        colsMd && mdColsMap[colsMd],
        colsLg && lgColsMap[colsLg],
        gapMap[gap],
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
);

Grid.displayName = 'Grid';
