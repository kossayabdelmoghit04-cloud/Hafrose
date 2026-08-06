import {  forwardRef, ElementType } from 'react';
import { StackProps } from './Stack.types';
import { cn } from '../../../utils/cn';

const directionMap = {
  row: 'flex-row', col: 'flex-col',
  'row-reverse': 'flex-row-reverse', 'col-reverse': 'flex-col-reverse',
};
const alignMap = {
  start: 'items-start', center: 'items-center', end: 'items-end',
  stretch: 'items-stretch', baseline: 'items-baseline',
};
const justifyMap = {
  start: 'justify-start', center: 'justify-center', end: 'justify-end',
  between: 'justify-between', around: 'justify-around', evenly: 'justify-evenly',
};
const gapMap = {
  none: 'gap-0', xs: 'gap-2', sm: 'gap-3', md: 'gap-4', lg: 'gap-6', xl: 'gap-8',
};

export const Stack = forwardRef<HTMLDivElement, StackProps>(
  (
    {
      children, direction = 'col', align = 'stretch', justify = 'start',
      gap = 'md', wrap = false, as, className, ...props
    },
    ref
  ) => {
    const Component = (as ?? 'div') as ElementType;
    return (
      <Component
        ref={ref}
        className={cn(
          'flex',
          directionMap[direction],
          alignMap[align],
          justifyMap[justify],
          gapMap[gap],
          wrap && 'flex-wrap',
          className
        )}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

Stack.displayName = 'Stack';
