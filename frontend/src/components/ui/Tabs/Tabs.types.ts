import { ReactNode } from 'react';

export interface TabItem {
  id: string;
  label: ReactNode;
  content: ReactNode;
  disabled?: boolean;
}

export interface TabsProps {
  items: TabItem[];
  defaultTab?: string;
  onChange?: (id: string) => void;
  className?: string;
}
