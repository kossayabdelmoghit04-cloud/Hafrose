import { HTMLAttributes, ReactNode } from 'react';

export type GridCols = 1 | 2 | 3 | 4 | 5 | 6 | 12;

export interface GridProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  cols?: GridCols;
  colsSm?: GridCols;
  colsMd?: GridCols;
  colsLg?: GridCols;
  gap?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}
