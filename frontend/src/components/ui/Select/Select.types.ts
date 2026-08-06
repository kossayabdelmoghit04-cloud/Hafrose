import { SelectHTMLAttributes } from 'react';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  options: SelectOption[];
  label?: string;
  helperText?: string;
  error?: string;
  placeholder?: string;
}
