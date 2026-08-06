import { ReactNode } from 'react';

export interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  iconVariant?: 'burgundy' | 'gold' | 'rose';
  className?: string;
}
