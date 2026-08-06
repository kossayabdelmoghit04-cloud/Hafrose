import { HTMLAttributes, ReactNode } from 'react';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  variant?: 'default' | 'flat' | 'outline' | 'cream';
  hoverEffect?: boolean;
}
