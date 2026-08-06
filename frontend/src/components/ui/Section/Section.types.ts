import { HTMLAttributes, ReactNode } from 'react';

export interface SectionProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
  as?: 'section' | 'div' | 'article' | 'aside' | 'main';
  spacing?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  bg?: 'white' | 'cream' | 'cream-dark' | 'transparent';
}
