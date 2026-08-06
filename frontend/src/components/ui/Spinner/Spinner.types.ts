export type SpinnerSize = 'sm' | 'md' | 'lg' | 'xl';
export type SpinnerVariant = 'burgundy' | 'white' | 'gold' | 'current';

export interface SpinnerProps {
  size?: SpinnerSize;
  variant?: SpinnerVariant;
  className?: string;
  'aria-label'?: string;
}
