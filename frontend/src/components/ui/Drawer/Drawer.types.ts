import { ReactNode } from 'react';

export type DrawerPosition = 'left' | 'right' | 'bottom';
export type DrawerSize = 'sm' | 'md' | 'lg' | 'xl';

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  position?: DrawerPosition;
  size?: DrawerSize;
}
