import { InputHTMLAttributes } from 'react';

export interface NumberInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'type'> {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  decrementLabel?: string;
  incrementLabel?: string;
}
