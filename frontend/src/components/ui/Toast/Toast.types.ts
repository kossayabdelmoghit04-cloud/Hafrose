import { ReactNode } from 'react';

export type ToastVariant = 'success' | 'error' | 'info' | 'warning';

export interface ToastProps {
  id: string;
  variant?: ToastVariant;
  title?: string;
  message: ReactNode;
  onDismiss: (id: string) => void;
  durationMs?: number;
}
