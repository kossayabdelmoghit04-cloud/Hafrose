import {  forwardRef, ElementType } from 'react';
import { SectionProps } from './Section.types';
import { cn } from '../../../utils/cn';

const spacingClasses = {
  none: '',
  sm: 'py-8 md:py-12',
  md: 'py-12 md:py-16',
  lg: 'py-16 md:py-24',
  xl: 'py-24 md:py-32',
};

const bgClasses = {
  white: 'bg-white',
  cream: 'bg-cream-100',
  'cream-dark': 'bg-cream-200',
  transparent: 'bg-transparent',
};

export const Section = forwardRef<HTMLElement, SectionProps>(
  ({ children, as: Tag = 'section', spacing = 'md', bg = 'transparent', className, ...props }, ref) => {
    const Component = Tag as ElementType;
    return (
      <Component
        ref={ref}
        className={cn(spacingClasses[spacing], bgClasses[bg], className)}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

Section.displayName = 'Section';
