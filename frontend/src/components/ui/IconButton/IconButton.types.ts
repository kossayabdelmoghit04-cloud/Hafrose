import { ButtonHTMLAttributes, ReactNode } from 'react';

export type IconButtonVariant = 'default' | 'ghost' | 'outline' | 'filled';
export type IconButtonSize = 'sm' | 'md' | 'lg';

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: ReactNode;
  'aria-label': string; // Required for WCAG 2.2 AA accessibility
  variant?: IconButtonVariant;
  size?: IconButtonSize;
  isLoading?: boolean;
}
