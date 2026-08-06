import { AnchorHTMLAttributes, ReactNode } from 'react';

export type LinkButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
export type LinkButtonSize = 'sm' | 'md' | 'lg';

export interface LinkButtonProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  variant?: LinkButtonVariant;
  size?: LinkButtonSize;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
  children: ReactNode;
}
