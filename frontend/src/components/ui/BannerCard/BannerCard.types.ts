import { ReactNode } from 'react';

export interface BannerCardProps {
  title: string;
  subtitle?: string;
  description?: string;
  imageUrl?: string | null;
  badgeText?: string;
  cta?: ReactNode;
  align?: 'left' | 'center' | 'right';
  className?: string;
}
