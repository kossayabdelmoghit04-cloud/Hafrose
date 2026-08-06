import {  forwardRef } from 'react';
import { ContainerProps } from './Container.types';
import { cn } from '../../../utils/cn';

const sizeClasses = {
  sm: 'max-w-xl',
  md: 'max-w-3xl',
  lg: 'max-w-5xl',
  xl: 'max-w-6xl',
  '2xl': 'max-w-screen-2xl',
  full: 'max-w-full',
};

export const Container = forwardRef<HTMLDivElement, ContainerProps>(
  ({ children, size = 'xl', padded = true, className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('w-full mx-auto', sizeClasses[size], padded && 'px-4 sm:px-6 lg:px-8', className)}
      {...props}
    >
      {children}
    </div>
  )
);

Container.displayName = 'Container';
