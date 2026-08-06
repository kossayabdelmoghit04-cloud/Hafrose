import { HTMLAttributes, ReactNode, ElementType } from 'react';

export type StackDirection = 'row' | 'col' | 'row-reverse' | 'col-reverse';
export type StackAlign = 'start' | 'center' | 'end' | 'stretch' | 'baseline';
export type StackJustify = 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
export type StackGap = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface StackProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  direction?: StackDirection;
  align?: StackAlign;
  justify?: StackJustify;
  gap?: StackGap;
  wrap?: boolean;
  as?: ElementType;
}
